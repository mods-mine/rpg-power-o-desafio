// Afinidade entre tomo e armadura (RPG Series).
//
// Com um tomo no slot de tomo (Curios), cada peça de armadura conta assim:
//   - peça do conjunto do tomo: +1 (vantagem)
//   - peça de outro conjunto (outra classe, vanilla ou outro mod): -1 (desvantagem)
//   - slot vazio: 0
// Por ponto (de -4 a +4): ±10% de vida máxima e armadura, ±5% de dano da classe,
// ±2% de chance de crítico e ±2% de redução do dano recebido.
// Com uma arma da classe do tomo na mão principal, cada ponto também vale:
// ±2% de dano, ±3% de velocidade (ataque, puxada do arco ou conjuração, conforme a arma)
// e ±4% de velocidade do projétil (arcos e bestas). Com o escudo da classe na mão ou com o
// Deflection (aparar) ativo, cada ponto dá ±3% de proteção extra.
// Arma de outra classe não ganha nem perde nada.
// Sem tomo equipado, nada é aplicado.
// Recalculado a cada segundo; os modificadores têm ID fixo, então não acumulam.
//
// Tudo dentro de uma função: os scripts do KubeJS dividem o mesmo escopo global, e uma
// constante com o mesmo nome em outro arquivo impediria este de carregar.

;(() => {

const Attributes = Java.loadClass('net.minecraft.world.entity.ai.attributes.Attributes')
const AttributeModifier = Java.loadClass('net.minecraft.world.entity.ai.attributes.AttributeModifier')
const Operation = Java.loadClass('net.minecraft.world.entity.ai.attributes.AttributeModifier$Operation')
const ResourceLocation = Java.loadClass('net.minecraft.resources.ResourceLocation')
const BuiltInRegistries = Java.loadClass('net.minecraft.core.registries.BuiltInRegistries')
const EquipmentSlot = Java.loadClass('net.minecraft.world.entity.EquipmentSlot')
const CuriosApi = Java.loadClass('top.theillusivec4.curios.api.CuriosApi')
const TagKey = Java.loadClass('net.minecraft.tags.TagKey')
const Registries = Java.loadClass('net.minecraft.core.registries.Registries')

const POR_PECA_VIDA = 0.10
const POR_PECA_ARMADURA = 0.10
const POR_PECA_DANO = 0.05
const POR_PECA_CRITICO = 0.02
const POR_PECA_REDUCAO = 0.02
const POR_PECA_ARMA_DANO = 0.02
const POR_PECA_ARMA_VELOCIDADE = 0.03
const POR_PECA_ARMA_PROJETIL = 0.04
const POR_PECA_PROTECAO = 0.03
const POR_PECA_PODER_MAGICO = 0.02 // só conjuradores e só peças certas (sem penalidade)
const POR_PECA_DESLOCAMENTO = 0.02 // só caçadores e só peças certas (sem penalidade)
const POR_PECA_ALCANCE = 0.5 // blocos; só corpo a corpo, com arma corpo a corpo da classe, só peças certas
const CHAVE_PONTOS = 'conjunto_classe_pontos'
const CHAVE_PROTECAO = 'conjunto_classe_protecao'

const SLOTS = [EquipmentSlot.HEAD, EquipmentSlot.CHEST, EquipmentSlot.LEGS, EquipmentSlot.FEET]

// Ataque físico corpo a corpo, à distância e crítico de cada tipo
const FISICO = 'minecraft:generic.attack_damage'
const DISTANCIA = 'ranged_weapon:damage'
const CRIT_FISICO = 'critical_strike:chance'
const CRIT_MAGIA = 'spell_power:critical_chance'

// Tomo (pool do livro) -> conjuntos de armadura (prefixo do ID, sem _head/_chest/_legs/_feet),
// atributos de dano e de crítico que recebem o bônus.
const TOMOS = {
  'wizards:spell_book/arcane': {
    conjuntos: ['wizards:wizard_robe', 'wizards:arcane_robe', 'wizards:netherite_arcane_robe'],
    dano: ['spell_power:arcane'], critico: [CRIT_MAGIA] },
  'wizards:spell_book/fire': {
    conjuntos: ['wizards:wizard_robe', 'wizards:fire_robe', 'wizards:netherite_fire_robe'],
    dano: ['spell_power:fire'], critico: [CRIT_MAGIA] },
  'wizards:spell_book/frost': {
    conjuntos: ['wizards:wizard_robe', 'wizards:frost_robe', 'wizards:netherite_frost_robe'],
    dano: ['spell_power:frost'], critico: [CRIT_MAGIA] },
  'elemental_wizards_rpg:spell_book/aqua': {
    conjuntos: ['elemental_wizards_rpg:elemental', 'elemental_wizards_rpg:kelp',
      'elemental_wizards_rpg:netherite_kelp', 'elemental_wizards_rpg:ocean_robe'],
    dano: ['spell_power:water'], critico: [CRIT_MAGIA] },
  'elemental_wizards_rpg:spell_book/terra': {
    conjuntos: ['elemental_wizards_rpg:elemental', 'elemental_wizards_rpg:dripstone',
      'elemental_wizards_rpg:netherite_dripstone', 'elemental_wizards_rpg:mountain_robe'],
    dano: ['spell_power:earth'], critico: [CRIT_MAGIA] },
  'elemental_wizards_rpg:spell_book/wind': {
    conjuntos: ['elemental_wizards_rpg:elemental', 'elemental_wizards_rpg:wind',
      'elemental_wizards_rpg:netherite_wind', 'elemental_wizards_rpg:hurricane_robe'],
    dano: ['spell_power:air'], critico: [CRIT_MAGIA] },
  'paladins:spell_book/paladin': {
    conjuntos: ['paladins:paladin_armor', 'paladins:crusader_armor', 'paladins:netherite_crusader_armor'],
    dano: [FISICO, 'spell_power:healing'], critico: [CRIT_FISICO, CRIT_MAGIA] },
  'paladins:spell_book/priest': {
    conjuntos: ['paladins:priest_robe', 'paladins:prior_robe', 'paladins:netherite_prior_robe'],
    dano: ['spell_power:healing'], critico: [CRIT_MAGIA] },
  'rogues:spell_book/rogue': {
    conjuntos: ['rogues:rogue_armor', 'rogues:assassin_armor', 'rogues:netherite_assassin_armor'],
    dano: [FISICO], critico: [CRIT_FISICO] },
  'rogues:spell_book/warrior': {
    conjuntos: ['rogues:warrior_armor', 'rogues:berserker_armor', 'rogues:netherite_berserker_armor'],
    dano: [FISICO], critico: [CRIT_FISICO] },
  'berserker_rpg:spell_book/berserker': {
    conjuntos: ['berserker_rpg:wildling', 'berserker_rpg:northling', 'berserker_rpg:netherite_northling',
      'berserker_rpg:warlord'],
    dano: [FISICO], critico: [CRIT_FISICO] },
  'forcemaster_rpg:spell_book/forcemaster': {
    conjuntos: ['forcemaster_rpg:oriene', 'forcemaster_rpg:aken', 'forcemaster_rpg:billporon',
      'forcemaster_rpg:phasleb'],
    dano: [FISICO, 'spell_power:arcane'], critico: [CRIT_FISICO, CRIT_MAGIA] },
  'bards_rpg:spell_book/bard': {
    conjuntos: ['bards_rpg:entertainer_garb', 'bards_rpg:storyteller_garb', 'bards_rpg:troubadour_garb',
      'bards_rpg:netherite_troubadour_garb'],
    dano: ['spell_power:arcane'], critico: [CRIT_MAGIA] },
  'archers:spell_book/archer': {
    conjuntos: ['archers:archer_armor', 'archers:ranger_armor', 'archers:netherite_ranger_armor'],
    dano: [DISTANCIA], critico: [CRIT_FISICO] },
  'archers_expansion:spell_book/deadeye': {
    conjuntos: ['archers:archer_armor', 'archers_expansion:deadeye', 'archers_expansion:netherite_deadeye',
      'archers_expansion:bounty_hunter'],
    dano: [DISTANCIA], critico: [CRIT_FISICO] },
  'archers_expansion:spell_book/tundra_hunter': {
    conjuntos: ['archers:archer_armor', 'archers_expansion:tundra_hunter',
      'archers_expansion:netherite_tundra_hunter', 'archers_expansion:polar_stalker'],
    dano: [DISTANCIA, 'spell_power:frost'], critico: [CRIT_FISICO] },
  'archers_expansion:spell_book/war_archer': {
    conjuntos: ['archers:archer_armor', 'archers_expansion:war_archer', 'archers_expansion:netherite_war_archer',
      'archers_expansion:sentinel_archer'],
    dano: [DISTANCIA, 'spell_power:fire'], critico: [CRIT_FISICO] },
}

// Witcher: os dois tomos usam todas as armaduras de escola do mod
const WITCHER = ['witcher_rpg:witcher']
;['feline', 'griffin', 'ursine', 'wolven'].forEach(escola => {
  ;['', 'enhanced_', 'superior_', 'mastercrafted_', 'grandmaster_'].forEach(nivel => {
    WITCHER.push(`witcher_rpg:${nivel}${escola}`)
  })
})
TOMOS['witcher_rpg:spell_book/fencing'] = { conjuntos: WITCHER, dano: [FISICO], critico: [CRIT_FISICO] }
TOMOS['witcher_rpg:spell_book/signs'] = {
  conjuntos: WITCHER, dano: [FISICO, 'witcher_rpg:sign_intensity'], critico: [CRIT_FISICO] }

// Armas de cada tomo: tags de tipo de arma e itens avulsos; `mods` limita aos mods listados e
// `evitar` descarta IDs com o nome de outra escola (ex.: cajado de gelo não serve ao tomo de fogo).
const T = id => TagKey.create(Registries.ITEM, ResourceLocation.parse(id))
const CAJADO = T('rpg_series:weapon_type/damage_staff')
const VARINHA = T('rpg_series:weapon_type/damage_wand')
const ARCO_LONGO = T('rpg_series:weapon_type/long_bow')
const ARCO_CURTO = T('rpg_series:weapon_type/short_bow')
const BESTA_PESADA = T('rpg_series:weapon_type/heavy_crossbow')
const BESTA_RAPIDA = T('rpg_series:weapon_type/rapid_crossbow')
const HARPA_BESTA = T('bards_rpg:harp_crossbows')
const ALAUDE = T('bards_rpg:lutes')
const LIRA = T('bards_rpg:lyres')
const CAJADO_CURA = T('rpg_series:weapon_type/healing_staff')
const VARINHA_CURA = T('rpg_series:weapon_type/healing_wand')
const ESCUDO = T('rpg_series:weapon_type/shield')
const ESCUDO_COMUM = T('c:shields')

const MAGO = { tags: [CAJADO, VARINHA], mods: ['wizards', 'arsenal'] }
const ELEMENTAL = { tags: [CAJADO, VARINHA], mods: ['elemental_wizards_rpg', 'arsenal'] }
const ARQUEIRO = {
  tags: [ARCO_LONGO, ARCO_CURTO, BESTA_PESADA, BESTA_RAPIDA, T('rpg_series:weapon_type/spear')],
  itens: ['minecraft:bow', 'minecraft:crossbow'], mods: ['archers', 'arsenal', 'minecraft'] }
const WITCHER_ARMAS = { tags: [T('rpg_series:weapon_type/spell_blade')] }
const ARMAS = {
  'wizards:spell_book/arcane': Object.assign({ evitar: ['fire', 'frost'] }, MAGO),
  'wizards:spell_book/fire': Object.assign({ evitar: ['arcane', 'frost'] }, MAGO),
  'wizards:spell_book/frost': Object.assign({ evitar: ['arcane', 'fire'] }, MAGO),
  'elemental_wizards_rpg:spell_book/aqua': Object.assign({ evitar: ['terra', 'clay', 'wind', 'feather'] }, ELEMENTAL),
  'elemental_wizards_rpg:spell_book/terra': Object.assign({ evitar: ['aqua', 'kelp', 'wind', 'feather'] }, ELEMENTAL),
  'elemental_wizards_rpg:spell_book/wind': Object.assign({ evitar: ['aqua', 'kelp', 'terra', 'clay'] }, ELEMENTAL),
  'paladins:spell_book/paladin': {
    tags: [T('rpg_series:weapon_type/mace'), T('rpg_series:weapon_type/hammer'),
      T('rpg_series:weapon_type/claymore'), ESCUDO, ESCUDO_COMUM], itens: ['minecraft:shield'] },
  'paladins:spell_book/priest': { tags: [CAJADO_CURA, VARINHA_CURA] },
  'rogues:spell_book/rogue': { tags: [T('rpg_series:weapon_type/dagger'), T('rpg_series:weapon_type/sickle')] },
  'rogues:spell_book/warrior': { tags: [T('rpg_series:weapon_type/double_axe'), T('rpg_series:weapon_type/glaive')] },
  'berserker_rpg:spell_book/berserker': { tags: [T('berserker_rpg:berserker_axes')], itens: ['berserker_rpg:unique_sword_1'] },
  'forcemaster_rpg:spell_book/forcemaster': { tags: [T('forcemaster_rpg:knuckles')] },
  'bards_rpg:spell_book/bard': {
    tags: [ALAUDE, LIRA, HARPA_BESTA, T('rpg_series:weapon_type/sword')], mods: ['bards_rpg'] },
  'archers:spell_book/archer': ARQUEIRO,
  'archers_expansion:spell_book/deadeye': ARQUEIRO,
  'archers_expansion:spell_book/tundra_hunter': ARQUEIRO,
  'archers_expansion:spell_book/war_archer': ARQUEIRO,
  'witcher_rpg:spell_book/fencing': WITCHER_ARMAS,
  'witcher_rpg:spell_book/signs': WITCHER_ARMAS,
}
// Equivalentes vanilla: espada = espada de witcher, machado = machado duplo/de berserker,
// enxada = foice, maça = maça do paladino, tridente = lança, besta = harpa-besta.
// Só vale o item do próprio Minecraft: as tags vanilla também trazem espadas e machados de outros mods.
const EQUIVALENTES_VANILLA = {
  'witcher_rpg:spell_book/fencing': { tags: [T('minecraft:swords')] },
  'witcher_rpg:spell_book/signs': { tags: [T('minecraft:swords')] },
  'rogues:spell_book/warrior': { tags: [T('minecraft:axes')] },
  'berserker_rpg:spell_book/berserker': { tags: [T('minecraft:axes')] },
  'rogues:spell_book/rogue': { tags: [T('minecraft:hoes')] },
  'paladins:spell_book/paladin': { itens: ['minecraft:mace'] },
  'bards_rpg:spell_book/bard': { itens: ['minecraft:crossbow'] },
  'archers:spell_book/archer': { itens: ['minecraft:trident'] },
  'archers_expansion:spell_book/deadeye': { itens: ['minecraft:trident'] },
  'archers_expansion:spell_book/tundra_hunter': { itens: ['minecraft:trident'] },
  'archers_expansion:spell_book/war_archer': { itens: ['minecraft:trident'] },
}
Object.keys(ARMAS).forEach(k => { TOMOS[k].armas = Object.assign({ vanilla: EQUIVALENTES_VANILLA[k] }, ARMAS[k]) })
Object.keys(TOMOS).forEach(k => { TOMOS[k].pool = k })

// Tipo da arma decide qual velocidade recebe o bônus
const TAGS_DISTANCIA = [ARCO_LONGO, ARCO_CURTO, BESTA_PESADA, BESTA_RAPIDA, HARPA_BESTA]
const ITENS_DISTANCIA = ['minecraft:bow', 'minecraft:crossbow']
const TAGS_MAGIA = [CAJADO, VARINHA, CAJADO_CURA, VARINHA_CURA, ALAUDE, LIRA]
const TAGS_ESCUDO = [ESCUDO, ESCUDO_COMUM]
const VEL_FISICO = 'minecraft:generic.attack_speed'
const VEL_DISTANCIA = 'ranged_weapon:haste'
const VEL_MAGIA = 'spell_power:haste'
const VEL_PROJETIL = 'ranged_weapon:velocity'
const EFEITO_APARAR = 'skill_tree_rpgs:deflection'

const ID_VIDA = ResourceLocation.parse('classes_rpg:conjunto_vida')
const ID_ARMADURA = ResourceLocation.parse('classes_rpg:conjunto_armadura')
const ID_DANO = ResourceLocation.parse('classes_rpg:conjunto_dano')
const ID_CRITICO = ResourceLocation.parse('classes_rpg:conjunto_critico')
const ID_ARMA_DANO = ResourceLocation.parse('classes_rpg:conjunto_arma_dano')
const ID_ARMA_VELOCIDADE = ResourceLocation.parse('classes_rpg:conjunto_arma_velocidade')
const ID_ARMA_PROJETIL = ResourceLocation.parse('classes_rpg:conjunto_arma_projetil')
const ID_PODER_MAGICO = ResourceLocation.parse('classes_rpg:conjunto_poder_magico')
const PODER_MAGICO = 'spell_power:generic'
const ID_DESLOCAMENTO = ResourceLocation.parse('classes_rpg:conjunto_deslocamento')
const DESLOCAMENTO = 'minecraft:generic.movement_speed'
const ID_ALCANCE = ResourceLocation.parse('classes_rpg:conjunto_alcance')
// Alcance de ataque vanilla; o Better Combat também usa este atributo
const ALCANCE = 'minecraft:player.entity_interaction_range'
// Tomos de combate corpo a corpo: ganham alcance com arma corpo a corpo da classe, por peça certa
const CORPO_A_CORPO = [
  'rogues:spell_book/warrior', 'rogues:spell_book/rogue', 'berserker_rpg:spell_book/berserker',
  'paladins:spell_book/paladin', 'forcemaster_rpg:spell_book/forcemaster',
  'witcher_rpg:spell_book/fencing', 'witcher_rpg:spell_book/signs',
]
// Tomos de caçadores (arqueiros, ladino e berserker): ganham velocidade de deslocamento por peça certa
const CACADORES = [
  'archers:spell_book/archer', 'archers_expansion:spell_book/deadeye',
  'archers_expansion:spell_book/tundra_hunter', 'archers_expansion:spell_book/war_archer',
  'rogues:spell_book/rogue', 'berserker_rpg:spell_book/berserker',
]
// Tomos de conjuradores: ganham poder mágico geral por peça certa
const CONJURADORES = [
  'wizards:spell_book/arcane', 'wizards:spell_book/fire', 'wizards:spell_book/frost',
  'elemental_wizards_rpg:spell_book/aqua', 'elemental_wizards_rpg:spell_book/terra', 'elemental_wizards_rpg:spell_book/wind',
  'paladins:spell_book/priest', 'paladins:spell_book/paladin', 'bards_rpg:spell_book/bard',
  'forcemaster_rpg:spell_book/forcemaster',
]

// Todos os atributos que este script pode alterar (para limpar os que deixam de valer ao trocar de tomo)
const TODOS_DANO = []
const TODOS_CRITICO = []
Object.keys(TOMOS).forEach(k => {
  TOMOS[k].dano.forEach(a => { if (TODOS_DANO.indexOf(a) < 0) TODOS_DANO.push(a) })
  TOMOS[k].critico.forEach(a => { if (TODOS_CRITICO.indexOf(a) < 0) TODOS_CRITICO.push(a) })
})

const holders = {}
function atributo(id) {
  if (!(id in holders)) {
    const h = BuiltInRegistries.ATTRIBUTE.getHolder(ResourceLocation.parse(id))
    holders[id] = h.isPresent() ? h.get() : null
    if (!holders[id]) console.warn(`conjunto_classe.js: atributo ${id} não existe, ignorado`)
  }
  return holders[id]
}

const TIPO_CONTAINER = BuiltInRegistries.DATA_COMPONENT_TYPE.get(ResourceLocation.parse('spell_engine:spell_container'))

function poolDoLivro(stack) {
  if (!stack || stack.isEmpty() || !TIPO_CONTAINER) return null
  const container = stack.get(TIPO_CONTAINER)
  if (!container) return null
  try {
    return String(container.pool())
  } catch (e) {
    const m = String(container).match(/pool=([a-z0-9_.-]+:[a-z0-9_./-]+)/)
    return m ? m[1] : null
  }
}

// Tomo com pool fora da tabela (ex.: mod novo): avisa uma vez por pool
const poolsAvisados = {}
function avisarPoolDesconhecido(pool) {
  if (poolsAvisados[pool]) return
  poolsAvisados[pool] = true
  console.warn(`conjunto_classe.js: tomo ${pool} não está na tabela, ignorado`)
}

function tomoEquipado(player) {
  const inv = CuriosApi.getCuriosInventory(player)
  if (!inv.isPresent()) return null
  const handler = inv.get().getStacksHandler('spell_book')
  if (!handler.isPresent()) return null
  const stacks = handler.get().getStacks()
  for (let i = 0; i < stacks.getSlots(); i++) {
    const pool = poolDoLivro(stacks.getStackInSlot(i))
    if (pool && TOMOS[pool]) return TOMOS[pool]
    if (pool) avisarPoolDesconhecido(pool)
  }
  return null
}

function pecasCertas(player, tomo) {
  let certas = 0
  SLOTS.forEach(slot => {
    const stack = player.getItemBySlot(slot)
    if (stack.isEmpty()) return
    if (tomo.conjuntos.indexOf(idDoItem(stack).replace(/_(head|chest|legs|feet)$/, '')) >= 0) certas++
  })
  return certas
}

function pontos(player, tomo) {
  let total = 0
  SLOTS.forEach(slot => {
    const stack = player.getItemBySlot(slot)
    if (stack.isEmpty()) return
    const id = String(BuiltInRegistries.ITEM.getKey(stack.getItem()))
    const conjunto = id.replace(/_(head|chest|legs|feet)$/, '')
    total += tomo.conjuntos.indexOf(conjunto) >= 0 ? 1 : -1
  })
  return total
}

function idDoItem(stack) {
  return String(BuiltInRegistries.ITEM.getKey(stack.getItem()))
}

// ItemStack.is() tem várias sobrecargas; força a de TagKey
function temTag(stack, tags) {
  return tags.some(t => stack['is(net.minecraft.tags.TagKey)'](t))
}

function armaDaClasse(stack, tomo) {
  const armas = tomo.armas
  if (!armas || stack.isEmpty()) return false
  const id = idDoItem(stack)
  const vanilla = armas.vanilla
  if (vanilla && id.startsWith('minecraft:') &&
    ((vanilla.itens && vanilla.itens.indexOf(id) >= 0) || temTag(stack, vanilla.tags || []))) return true
  if (!((armas.itens && armas.itens.indexOf(id) >= 0) || temTag(stack, armas.tags || []))) return false
  if (armas.mods && armas.mods.indexOf(id.split(':')[0]) < 0) return false
  if (armas.evitar && armas.evitar.some(nome => id.indexOf(nome) >= 0)) return false
  return true
}

function ehEscudo(stack) {
  return !stack.isEmpty() && (idDoItem(stack) === 'minecraft:shield' || temTag(stack, TAGS_ESCUDO))
}

let efeitoAparar
function aparando(player) {
  if (efeitoAparar === undefined) {
    const h = BuiltInRegistries.MOB_EFFECT.getHolder(ResourceLocation.parse(EFEITO_APARAR))
    efeitoAparar = h.isPresent() ? h.get() : null
  }
  return efeitoAparar !== null && player.hasEffect(efeitoAparar)
}

function aplicar(player, idAttr, idMod, valor, operacao) {
  const holder = atributo(idAttr)
  if (!holder) return
  const inst = player.getAttribute(holder)
  if (!inst) return
  const atual = inst.getModifier(idMod)
  if (valor === 0) {
    if (atual) inst['removeModifier(net.minecraft.resources.ResourceLocation)'](idMod)
    return
  }
  if (atual && Math.abs(atual.amount() - valor) < 1e-9) return
  // removeModifier tem sobrecargas (ResourceLocation/AttributeModifier); força a de ResourceLocation
  inst['removeModifier(net.minecraft.resources.ResourceLocation)'](idMod)
  inst.addPermanentModifier(new AttributeModifier(idMod, valor, operacao || Operation.ADD_MULTIPLIED_BASE))
}

function atualizar(player) {
  const tomo = tomoEquipado(player)
  const p = tomo ? pontos(player, tomo) : 0
  aplicar(player, 'minecraft:generic.max_health', ID_VIDA, p * POR_PECA_VIDA)
  aplicar(player, 'minecraft:generic.armor', ID_ARMADURA, p * POR_PECA_ARMADURA)
  TODOS_DANO.forEach(a => aplicar(player, a, ID_DANO, tomo && tomo.dano.indexOf(a) >= 0 ? p * POR_PECA_DANO : 0))
  TODOS_CRITICO.forEach(a => aplicar(player, a, ID_CRITICO, tomo && tomo.critico.indexOf(a) >= 0 ? p * POR_PECA_CRITICO : 0))
  const conjurador = tomo !== null && CONJURADORES.indexOf(tomo.pool) >= 0
  const cacador = tomo !== null && CACADORES.indexOf(tomo.pool) >= 0
  const certas = tomo !== null ? pecasCertas(player, tomo) : 0
  aplicar(player, PODER_MAGICO, ID_PODER_MAGICO, conjurador ? certas * POR_PECA_PODER_MAGICO : 0)
  aplicar(player, DESLOCAMENTO, ID_DESLOCAMENTO, cacador ? certas * POR_PECA_DESLOCAMENTO : 0)

  // Arma da classe na mão principal
  const principal = player.getMainHandItem()
  const armaOk = tomo !== null && armaDaClasse(principal, tomo)
  let velocidade = null
  let projetil = false
  if (armaOk) {
    if (ITENS_DISTANCIA.indexOf(idDoItem(principal)) >= 0 || temTag(principal, TAGS_DISTANCIA)) {
      velocidade = VEL_DISTANCIA
      projetil = true
    } else {
      velocidade = temTag(principal, TAGS_MAGIA) ? VEL_MAGIA : VEL_FISICO
    }
  }
  TODOS_DANO.forEach(a => aplicar(player, a, ID_ARMA_DANO, armaOk && tomo.dano.indexOf(a) >= 0 ? p * POR_PECA_ARMA_DANO : 0))
  ;[VEL_FISICO, VEL_DISTANCIA, VEL_MAGIA].forEach(a =>
    aplicar(player, a, ID_ARMA_VELOCIDADE, a === velocidade ? p * POR_PECA_ARMA_VELOCIDADE : 0))
  aplicar(player, VEL_PROJETIL, ID_ARMA_PROJETIL, projetil ? p * POR_PECA_ARMA_PROJETIL : 0)
  const alcance = velocidade === VEL_FISICO && CORPO_A_CORPO.indexOf(tomo.pool) >= 0
  aplicar(player, ALCANCE, ID_ALCANCE, alcance ? certas * POR_PECA_ALCANCE : 0, Operation.ADD_VALUE)

  // Proteção: escudo da classe em qualquer mão, ou aparar (Deflection) ativo
  const escudo = tomo !== null && [principal, player.getOffhandItem()].some(s => ehEscudo(s) && armaDaClasse(s, tomo))
  const protecao = tomo !== null && (escudo || aparando(player)) ? p : 0

  if (player.getHealth() > player.getMaxHealth()) player.setHealth(player.getMaxHealth())
  // Registra no log só quando o saldo muda, para conferir no jogo
  if (player.persistentData.getInt(CHAVE_PONTOS) !== p) {
    console.info(`conjunto_classe.js: ${player.username} com ${p} ponto(s) de afinidade`)
  }
  player.persistentData.putInt(CHAVE_PONTOS, p)
  player.persistentData.putInt(CHAVE_PROTECAO, protecao)
}

// --- Descrição (lore) dos tomos ---
// O servidor escreve no próprio item o que o tomo dá com a armadura e as armas certas (e o que
// tira com as erradas). Funciona sem nada no cliente. Só preenche tomos sem descrição ou que já
// tenham a descrição deste script, para não apagar texto de outra origem.
const DataComponents = Java.loadClass('net.minecraft.core.component.DataComponents')
const ItemLore = Java.loadClass('net.minecraft.world.item.component.ItemLore')
const Component = Java.loadClass('net.minecraft.network.chat.Component')
const Style = Java.loadClass('net.minecraft.network.chat.Style')
const ChatFormatting = Java.loadClass('net.minecraft.ChatFormatting')
const ArrayList = Java.loadClass('java.util.ArrayList')

const TITULO_LORE = 'Afinidade de classe (RPG Power)'
const ARMAS_DESCRICAO = {
  'wizards:spell_book/arcane': 'cajados e varinhas arcanos e de mago',
  'wizards:spell_book/fire': 'cajados e varinhas de fogo e de mago',
  'wizards:spell_book/frost': 'cajados e varinhas de gelo e de mago',
  'elemental_wizards_rpg:spell_book/aqua': 'cajados e varinhas de água e elementais',
  'elemental_wizards_rpg:spell_book/terra': 'cajados e varinhas de terra e elementais',
  'elemental_wizards_rpg:spell_book/wind': 'cajados e varinhas de vento e elementais',
  'paladins:spell_book/paladin': 'maças (inclusive a vanilla), martelos, claymores e escudos',
  'paladins:spell_book/priest': 'cajados e varinhas sagrados',
  'rogues:spell_book/rogue': 'adagas, foices e enxadas vanilla',
  'rogues:spell_book/warrior': 'machados duplos, glaives e machados vanilla',
  'berserker_rpg:spell_book/berserker': 'machados de berserker e machados vanilla',
  'forcemaster_rpg:spell_book/forcemaster': 'soqueiras',
  'bards_rpg:spell_book/bard': 'alaúdes, liras, harpas-besta, rapieiras e besta vanilla',
  'archers:spell_book/archer': 'arcos, bestas, lanças e tridente vanilla',
  'archers_expansion:spell_book/deadeye': 'arcos, bestas, lanças e tridente vanilla',
  'archers_expansion:spell_book/tundra_hunter': 'arcos, bestas, lanças e tridente vanilla',
  'archers_expansion:spell_book/war_archer': 'arcos, bestas, lanças e tridente vanilla',
  'witcher_rpg:spell_book/fencing': 'espadas de witcher e espadas vanilla',
  'witcher_rpg:spell_book/signs': 'espadas de witcher e espadas vanilla',
}
// Fonte da proteção extra de cada tomo (escudo da classe ou a passiva Deflection do arqueiro)
const PROTECAO_DESCRICAO = {
  'paladins:spell_book/paladin': 'Escudo da classe na mão',
  'archers:spell_book/archer': 'Deflection (aparar) ativo',
  'archers_expansion:spell_book/deadeye': 'Deflection (aparar) ativo',
  'archers_expansion:spell_book/tundra_hunter': 'Deflection (aparar) ativo',
  'archers_expansion:spell_book/war_archer': 'Deflection (aparar) ativo',
}

const pct = v => `${Math.round(v * 100)}%`

function linha(texto, cor) {
  return Component.literal(texto).setStyle(Style.EMPTY['withColor(net.minecraft.ChatFormatting)'](cor).withItalic(false))
}

// Nome dos conjuntos pelo item do peitoral, traduzido no cliente (ex.: "Fire Robe Top")
function nomeDoConjunto(conjunto) {
  const item = BuiltInRegistries.ITEM['getOptional(net.minecraft.resources.ResourceLocation)'](ResourceLocation.parse(`${conjunto}_chest`))
  return item.isPresent() ? item.get().getDescription() : null
}

const loresProntos = {}
function loreDoTomo(pool) {
  if (pool in loresProntos) return loresProntos[pool]
  const tomo = TOMOS[pool]
  const linhas = new ArrayList()
  linhas.add(linha(TITULO_LORE, ChatFormatting.GOLD))
  linhas.add(linha('Por peça do conjunto do tomo:', ChatFormatting.GRAY))
  linhas.add(linha(` +${pct(POR_PECA_VIDA)} vida e armadura, +${pct(POR_PECA_DANO)} dano, +${pct(POR_PECA_CRITICO)} crítico, -${pct(POR_PECA_REDUCAO)} dano recebido`, ChatFormatting.GREEN))
  if (CONJURADORES.indexOf(pool) >= 0) linhas.add(linha(` +${pct(POR_PECA_PODER_MAGICO)} poder mágico (conjurador)`, ChatFormatting.GREEN))
  if (CACADORES.indexOf(pool) >= 0) linhas.add(linha(` +${pct(POR_PECA_DESLOCAMENTO)} velocidade de deslocamento (caçador)`, ChatFormatting.GREEN))
  if (CORPO_A_CORPO.indexOf(pool) >= 0) linhas.add(linha(` +${String(POR_PECA_ALCANCE).replace('.', ',')} bloco de alcance com arma corpo a corpo da classe`, ChatFormatting.GREEN))
  linhas.add(linha('Por peça de outro conjunto:', ChatFormatting.GRAY))
  linhas.add(linha(` -${pct(POR_PECA_VIDA)} vida e armadura, -${pct(POR_PECA_DANO)} dano, -${pct(POR_PECA_CRITICO)} crítico, +${pct(POR_PECA_REDUCAO)} dano recebido`, ChatFormatting.RED))
  linhas.add(linha('Com a arma da classe, por peça certa (ou errada):', ChatFormatting.GRAY))
  const armas = tomo.armas || {}
  const distancia = (armas.tags || []).some(t => TAGS_DISTANCIA.indexOf(t) >= 0) ||
    (armas.itens || []).some(i => ITENS_DISTANCIA.indexOf(i) >= 0)
  const projetil = distancia ? `, ±${pct(POR_PECA_ARMA_PROJETIL)} velocidade do projétil` : ''
  linhas.add(linha(` ±${pct(POR_PECA_ARMA_DANO)} dano, ±${pct(POR_PECA_ARMA_VELOCIDADE)} velocidade${projetil}`, ChatFormatting.YELLOW))
  if (PROTECAO_DESCRICAO[pool]) {
    linhas.add(linha(`${PROTECAO_DESCRICAO[pool]}: ±${pct(POR_PECA_PROTECAO)} proteção por peça`, ChatFormatting.YELLOW))
  }
  linhas.add(linha('Conjuntos:', ChatFormatting.GRAY))
  if (tomo.conjuntos === WITCHER) {
    linhas.add(linha(' todas as armaduras de escola do Witcher', ChatFormatting.AQUA))
  } else {
    tomo.conjuntos.forEach(c => {
      const nome = nomeDoConjunto(c)
      if (nome) linhas.add(linha(' ', ChatFormatting.AQUA)['append(net.minecraft.network.chat.Component)'](nome))
    })
  }
  linhas.add(linha(`Armas: ${ARMAS_DESCRICAO[pool]}`, ChatFormatting.GRAY))
  const texto = textoDasLinhas(linhas)
  loresProntos[pool] = { lore: new ItemLore(linhas), texto: texto }
  return loresProntos[pool]
}

function textoDasLinhas(linhas) {
  let s = ''
  for (let i = 0; i < linhas.size(); i++) s += String(linhas.get(i).getString()) + '\n'
  return s
}

function descreverTomo(stack) {
  const pool = poolDoLivro(stack)
  if (!pool || !TOMOS[pool]) return
  const pronto = loreDoTomo(pool)
  const atual = stack.get(DataComponents.LORE)
  if (atual && atual.lines().size() > 0) {
    // Já tem a descrição atual, ou tem texto de outra origem: não mexe
    if (String(atual.lines().get(0).getString()) !== TITULO_LORE) return
    if (textoDasLinhas(atual.lines()) === pronto.texto) return
  }
  stack['set(net.minecraft.core.component.DataComponentType,java.lang.Object)'](DataComponents.LORE, pronto.lore)
}

function descreverTomos(player) {
  const inv = player.getInventory()
  for (let i = 0; i < inv.getContainerSize(); i++) descreverTomo(inv.getItem(i))
  const curios = CuriosApi.getCuriosInventory(player)
  if (!curios.isPresent()) return
  const handler = curios.get().getStacksHandler('spell_book')
  if (!handler.isPresent()) return
  const stacks = handler.get().getStacks()
  for (let i = 0; i < stacks.getSlots(); i++) descreverTomo(stacks.getStackInSlot(i))
}

PlayerEvents.tick(event => {
  const player = event.player
  if (player.level.isClientSide() || player.tickCount % 20 !== 0) return
  try {
    atualizar(player)
    descreverTomos(player)
  } catch (e) {
    console.error(`conjunto_classe.js: ${e}`)
  }
})

// Redução de dano: +2% por ponto positivo, -2% (dano extra) por ponto negativo,
// mais ±3% por ponto com escudo da classe ou aparar ativo
EntityEvents.beforeHurt(event => {
  if (!event.entity.isPlayer()) return
  const dados = event.entity.persistentData
  const p = dados.getInt(CHAVE_PONTOS)
  if (p === 0) return
  const protecao = dados.getInt(CHAVE_PROTECAO)
  event.damage = event.damage * (1 - p * POR_PECA_REDUCAO) * (1 - protecao * POR_PECA_PROTECAO)
})

})()

// Reforço dos chefes: só a vida máxima é multiplicada por 1.5x (dano, armadura e o resto
// ficam como no vanilla / mod de origem). Os demais mobs não recebem nenhum ajuste.
//
// A antiga curva por dias (vida, dano e armadura dos mobs comuns) foi removida. Mobs já salvos
// no mundo com os modificadores antigos são limpos quando carregam (chunk carregado).
//
// Tudo dentro de uma função: os scripts do KubeJS dividem o mesmo escopo global, e uma
// constante com o mesmo nome em outro arquivo impediria este de carregar.

;(() => {

const Mob = Java.loadClass('net.minecraft.world.entity.Mob')
const Attributes = Java.loadClass('net.minecraft.world.entity.ai.attributes.Attributes')
const AttributeModifier = Java.loadClass('net.minecraft.world.entity.ai.attributes.AttributeModifier')
const Operation = Java.loadClass('net.minecraft.world.entity.ai.attributes.AttributeModifier$Operation')
const ResourceLocation = Java.loadClass('net.minecraft.resources.ResourceLocation')
const TagKey = Java.loadClass('net.minecraft.tags.TagKey')
const Registries = Java.loadClass('net.minecraft.core.registries.Registries')
const BuiltInRegistries = Java.loadClass('net.minecraft.core.registries.BuiltInRegistries')

const MULT_VIDA_CHEFE = 1.5
const MARCA = 'dificuldade_dias_aplicada'

// Chefes e minichefes que recebem o reforço de vida. Além desta lista, qualquer entidade na
// tag comum #c:bosses entra automaticamente
// (hoje: Wither, Ender Dragon e os 8 chefes do Cataclysm; cobre chefes de mods futuros que usem a tag).
const TAG_CHEFES = TagKey.create(Registries.ENTITY_TYPE, ResourceLocation.parse('c:bosses'))
const CHEFES = [
  // Vanilla
  'minecraft:ender_dragon', 'minecraft:wither', 'minecraft:warden', 'minecraft:elder_guardian',
  // L_Ender's Cataclysm: chefes (também na tag), variantes e minichefes guardiões de estrutura
  'cataclysm:ignis', 'cataclysm:netherite_monstrosity', 'cataclysm:old_netherite_monstrosity',
  'cataclysm:ender_guardian', 'cataclysm:the_harbinger', 'cataclysm:the_leviathan',
  'cataclysm:ancient_remnant', 'cataclysm:ancient_ancient_remnant', 'cataclysm:maledictus',
  'cataclysm:scylla', 'cataclysm:ender_golem', 'cataclysm:the_prowler', 'cataclysm:coralssus',
  'cataclysm:amethyst_crab', 'cataclysm:kobolediator', 'cataclysm:wadjet', 'cataclysm:aptrgangr',
  'cataclysm:clawdian',
  // Born in Chaos: chefes e minichefes
  'born_in_chaos_v1:lord_pumpkinhead', 'born_in_chaos_v1:lord_pumpkinhead_withouta_horse',
  'born_in_chaos_v1:lord_pumpkinhead_head', 'born_in_chaos_v1:lord_the_headless',
  'born_in_chaos_v1:sir_pumpkinhead', 'born_in_chaos_v1:sir_pumpkinhead_without_horse',
  'born_in_chaos_v1:sir_the_headless', 'born_in_chaos_v1:supreme_bonescaller',
  'born_in_chaos_v1:supreme_bonescaller_stage_2', 'born_in_chaos_v1:supreme_bonescaller_not_despawn',
  'born_in_chaos_v1:lifestealer', 'born_in_chaos_v1:lifestealer_true_form', 'born_in_chaos_v1:krampus',
  'born_in_chaos_v1:nightmare_stalker', 'born_in_chaos_v1:mother_spider',
  'born_in_chaos_v1:fallen_chaos_knight', 'born_in_chaos_v1:door_knight',
  'born_in_chaos_v1:door_knight_not_despawn', 'born_in_chaos_v1:dire_hound_leader',
  'born_in_chaos_v1:missioner',
]

// O Ender Dragon fica de fora: a vida dele vem do EDFR (scoreboard), ajustada em dragao.js.
const SEM_REFORCO_CHEFE = ['minecraft:ender_dragon']

function ehChefe(mob) {
  const id = String(mob.getEncodeId())
  if (CHEFES.indexOf(id) >= 0) return true
  // mob.getType() no KubeJS devolve só o ID; o EntityType vem do registro
  // EntityType.is(TagKey) tem uma única assinatura; Holder.is() é ambíguo e o KubeJS escolhe a errada
  try {
    return BuiltInRegistries.ENTITY_TYPE.get(ResourceLocation.parse(id)).is(TAG_CHEFES)
  } catch (e) {
    return false
  }
}

const ID_VIDA = ResourceLocation.parse('classes_rpg:dificuldade_vida')
// Modificadores da versão antiga, removidos de mobs que ainda os tenham salvos
const ID_DANO = ResourceLocation.parse('classes_rpg:dificuldade_dano')
const ID_ARMADURA = ResourceLocation.parse('classes_rpg:dificuldade_armadura')

function remover(mob, attr, id) {
  const inst = mob.getAttribute(attr)
  if (!inst) return
  // removeModifier tem sobrecargas (ResourceLocation/AttributeModifier); força a de ResourceLocation
  inst['removeModifier(net.minecraft.resources.ResourceLocation)'](id)
}

EntityEvents.spawned(event => {
  const mob = event.entity
  if (!(mob instanceof Mob)) return
  const dados = mob.persistentData
  const chefe = ehChefe(mob) && SEM_REFORCO_CHEFE.indexOf(String(mob.getEncodeId())) < 0

  // Limpa o que a versão antiga aplicou (dano/armadura em todos; vida nos mobs comuns)
  if (dados.getBoolean(MARCA) || !chefe) {
    remover(mob, Attributes.ATTACK_DAMAGE, ID_DANO)
    remover(mob, Attributes.ARMOR, ID_ARMADURA)
    if (!chefe) {
      remover(mob, Attributes.MAX_HEALTH, ID_VIDA)
      if (mob.getHealth() > mob.getMaxHealth()) mob.setHealth(mob.getMaxHealth())
      dados.remove(MARCA)
      return
    }
  }

  if (dados.getBoolean(MARCA)) return // já reforçado quando nasceu (chunk recarregado)

  const inst = mob.getAttribute(Attributes.MAX_HEALTH)
  if (!inst) return
  // Mantém a proporção da vida atual (o Wither, por exemplo, nasce com 1/3 e vai carregando)
  const proporcao = mob.getHealth() / mob.getMaxHealth()
  inst['removeModifier(net.minecraft.resources.ResourceLocation)'](ID_VIDA)
  inst.addPermanentModifier(new AttributeModifier(ID_VIDA, MULT_VIDA_CHEFE - 1.0, Operation.ADD_MULTIPLIED_TOTAL))
  mob.setHealth(mob.getMaxHealth() * proporcao)
  dados.putBoolean(MARCA, true)
})

})()

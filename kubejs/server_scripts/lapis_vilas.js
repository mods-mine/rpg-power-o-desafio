// Lápis-lazúli nos baús das vilas (LootJS). Recarregar sem reiniciar: /reload
//
// Cada baú de vila tem 2% de chance de trazer 1 a 3 lápis-lazúli.
// Se a vila tiver um gazebo (todos trazem uma Spell Binding Table), a chance sobe para 8%
// e a quantidade para 3 a 8. O gazebo é uma peça dentro da vila, não uma estrutura própria,
// então ele é detectado procurando a mesa nos chunks já carregados em volta do baú.
//
// Tudo dentro de uma função: os scripts do KubeJS dividem o mesmo escopo global, e uma
// constante com o mesmo nome em outro arquivo impediria este de carregar.

;(() => {

const LootContextParams = Java.loadClass('net.minecraft.world.level.storage.loot.parameters.LootContextParams')
const BuiltInRegistries = Java.loadClass('net.minecraft.core.registries.BuiltInRegistries')

const LAPIS_CHANCE = 0.02
const LAPIS_MIN = 1
const LAPIS_MAX = 3
const LAPIS_CHANCE_GAZEBO = 0.08
const LAPIS_MIN_GAZEBO = 3
const LAPIS_MAX_GAZEBO = 8
const RAIO_CHUNKS = 6 // ~96 blocos: cobre a vila inteira sem alcançar a vizinha
const MESA = 'spell_engine:spell_binding'

// Baús de vila (vanilla, ChoiceTheorem's, Repurposed Structures, Nova Structures e casas de mods)
const TABELAS = [
  /^minecraft:chests\/village\//,
  /^ctov:chests\/village\//,
  /^repurposed_structures:chests\/villages\//,
  'nova_structures:chests/village/village_birch_house',
  'gazebo:chests/gazebo',
  'paladins:chests/village_monk',
  'wizards:chests/village_wizard',
  'village_taverns:chests/tavern',
]

function temMesaPerto(level, origem) {
  const cx = Math.floor(origem.x()) >> 4
  const cz = Math.floor(origem.z()) >> 4
  const chunks = level.getChunkSource()
  for (let dx = -RAIO_CHUNKS; dx <= RAIO_CHUNKS; dx++) {
    for (let dz = -RAIO_CHUNKS; dz <= RAIO_CHUNKS; dz++) {
      // getChunkNow não carrega chunk novo: só olha os que já estão na memória
      const chunk = chunks.getChunkNow(cx + dx, cz + dz)
      if (!chunk) continue
      const it = chunk.getBlockEntities().values().iterator()
      while (it.hasNext()) {
        const bloco = it.next().getBlockState().getBlock()
        if (String(BuiltInRegistries.BLOCK.getKey(bloco)) === MESA) return true
      }
    }
  }
  return false
}

LootJS.modifiers(event => {
  TABELAS.forEach(tabela => {
    event.addTableModifier(tabela).customAction((contexto, loot) => {
      const origem = contexto.getParamOrNull(LootContextParams.ORIGIN)
      if (!origem) return
      const random = contexto.getRandom()
      // Sorteia antes de procurar a mesa: acima da maior chance nem precisa procurar
      const sorteio = random.nextFloat()
      if (sorteio >= LAPIS_CHANCE_GAZEBO) return
      const gazebo = temMesaPerto(contexto.getLevel(), origem)
      if (!gazebo && sorteio >= LAPIS_CHANCE) return
      const min = gazebo ? LAPIS_MIN_GAZEBO : LAPIS_MIN
      const max = gazebo ? LAPIS_MAX_GAZEBO : LAPIS_MAX
      loot.addItem(Item.of('minecraft:lapis_lazuli', min + random.nextInt(max - min + 1)))
    })
  })
})

})()

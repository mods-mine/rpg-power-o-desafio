// Controle de drops e loot (LootJS). Recarregar sem reiniciar: /reload
// Docs: https://docs.almostreliable.com/lootjs/
LootJS.lootTables(event => {
  // Remover um item de todas as loot tables (baús, mobs, blocos):
  // event.getLootTableIds().forEach(id => event.getLootTable(id)?.removeItem('minecraft:enchanted_golden_apple'))
})

LootJS.modifiers(event => {
  // Zumbis deixam cair esmeralda com 10% de chance:
  // event.addEntityModifier('minecraft:zombie').randomChance(0.1).addLoot('minecraft:emerald')

  // Remover drop de um mob:
  // event.addEntityModifier('minecraft:enderman').removeLoot('minecraft:ender_pearl')
})

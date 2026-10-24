// Edição de receitas (KubeJS). Recarregar sem reiniciar: /reload
// Docs: https://kubejs.com/wiki
ServerEvents.recipes(event => {
  // Remover uma receita:
  // event.remove({ output: 'minecraft:ender_eye' })

  // Receita com forma:
  // event.shaped('minecraft:saddle', [
  //   'LLL',
  //   'S S'
  // ], { L: 'minecraft:leather', S: 'minecraft:string' })

  // Receita sem forma:
  // event.shapeless('2x minecraft:string', ['#minecraft:wool'])

  // Trocar um ingrediente em todas as receitas:
  // event.replaceInput({ output: 'waystones:waystone' }, 'minecraft:emerald', 'minecraft:diamond')
})

// Guard Villagers + Mebahel's RPG: o rumor gravado no Guard é sincronizado com o cliente num campo de
// dados de entidade cujo tipo difere entre cliente e servidor, o que derruba quem se aproxima do Guard
// ("Invalid entity data item type for field 32"). Remove o rumor salvo ao carregar o Guard.
function limparRumorGuarda(guarda) {
  var tag = guarda.nbt
  var chaves = tag.getAllKeys().toArray().filter(function (c) { return String(c).toLowerCase().indexOf('rumor') >= 0 })
  var sujas = chaves.filter(function (c) { return String(tag.getString(c)) !== '' })
  if (sujas.length === 0) return
  // zera em vez de remover: o campo sincronizado volta ao padrão ("") e deixa de ser enviado ao cliente
  sujas.forEach(function (c) { tag.putString(c, '') })
  guarda.nbt = tag
  console.info('limpar_rumor_guardas.js: rumor limpo em ' + guarda.name.string + ' (' + sujas.join(', ') + ')')
}

EntityEvents.spawned(function (event) {
  if (String(event.entity.getEncodeId()) !== 'guardvillagers:guard') return
  try {
    limparRumorGuarda(event.entity)
  } catch (e) {
    console.error('limpar_rumor_guardas.js: ' + e)
  }
})

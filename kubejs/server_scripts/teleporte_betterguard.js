// Evita que o BetterGuard marque como "speed"/movimento ilegal os teleportes do Teleport Commands
// (/home, /back, /warp, /worldspawn, /tpaaccept). O salto de posição de um teleporte parece
// um movimento instantâneo para o anticheat, então o jogador fica isento por alguns segundos.
// Só remove a isenção que este script colocou (um /bg bypass manual de admin é preservado).

const BypassManager = Java.loadClass('com.soleapixel.betterguard.testing.BypassManager')

const COMANDOS_TELEPORTE = ['home', 'back', 'warp', 'worldspawn', 'tpaaccept']
const TICKS_ISENCAO = 100 // 5 segundos

// uuid (string) -> { uuid, ticks }
const isentos = {}

function isentar(player) {
  if (!player) return
  const uuid = player.getUUID()
  const chave = String(uuid)
  if (isentos[chave]) {
    isentos[chave].ticks = TICKS_ISENCAO
    return
  }
  if (BypassManager.isBypassed(uuid)) return // bypass manual de admin: não mexe
  BypassManager.setBypass(uuid, true)
  isentos[chave] = { uuid: uuid, ticks: TICKS_ISENCAO }
}

ServerEvents.command(event => {
  if (COMANDOS_TELEPORTE.indexOf(event.commandName) < 0) return
  const source = event.parseResults.getContext().getSource()
  const executor = source.getPlayer()
  isentar(executor)

  // No /tpaaccept quem se move pode ser o outro jogador (pedido /tpa): isenta os dois.
  if (event.commandName === 'tpaaccept') {
    const partes = String(event.input).trim().split(/\s+/)
    if (partes.length > 1) {
      isentar(source.getServer().getPlayerList().getPlayerByName(partes[1]))
    }
  }
})

ServerEvents.tick(event => {
  Object.keys(isentos).forEach(chave => {
    const item = isentos[chave]
    if (--item.ticks > 0) return
    BypassManager.setBypass(item.uuid, false)
    delete isentos[chave]
  })
})

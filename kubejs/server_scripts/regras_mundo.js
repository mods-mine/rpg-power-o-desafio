// Gamerules fixas do servidor, reaplicadas a cada boot (valem também para um mundo recriado).
// Para mudar uma regra de vez, altere aqui; mudanças feitas só por /gamerule voltam no próximo boot.

const GAMERULES = {
  playersSleepingPercentage: 0, // basta 1 jogador dormir para passar a noite
}

ServerEvents.loaded(event => {
  Object.keys(GAMERULES).forEach(regra => {
    event.server.runCommandSilent(`gamerule ${regra} ${GAMERULES[regra]}`)
  })
  console.info(`regras_mundo.js: gamerules aplicadas: ${JSON.stringify(GAMERULES)}`)
})

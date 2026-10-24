// Ajustes da luta contra o Ender Dragon (usado junto com o Ender Dragon Fight Remastered).
// Vida aumentada para a luta em grupo; o dano fica no padrão do EDFR.
// Recarregar sem reiniciar: /reload

const VIDA_DRAGAO = 1000       // vanilla 200, padrão do EDFR 500
const VIDA_FASE_MAD = 200      // 2ª fase só no fim, para dar tempo de destruir de novo os cristais

// Vida: o EDFR lê a vida do scoreboard "DragonHealth EDFR.config" ao iniciar a luta,
// e a fase "Mad" começa quando a vida cai abaixo de "MadThreshold".
// A função de load do EDFR roda no primeiro tick e, no primeiro boot, grava o padrão (500);
// por isso aplicamos os nossos valores alguns ticks depois.
// Obs.: isto sobrescreve o que for mudado pelo [Open Config] do EDFR a cada boot e /reload.
let ticksAteConfig = 100
ServerEvents.tick(event => {
  if (ticksAteConfig < 0) return
  if (ticksAteConfig-- > 0) return
  const server = event.server
  server.runCommandSilent(`scoreboard players set DragonHealth EDFR.config ${VIDA_DRAGAO}`)
  server.runCommandSilent(`scoreboard players set MadThreshold EDFR.config ${VIDA_FASE_MAD}`)
  console.info(`dragao.js: vida do dragão (EDFR) = ${VIDA_DRAGAO}, fase Mad abaixo de ${VIDA_FASE_MAD}`)
})

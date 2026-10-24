# Changelog

Mudanças relevantes do modpack **RPG Power - O Desafio**. As versões dos mods e do Minecraft são mantidas no perfil `.mrpack`.

## [2026-10-24]

### Alterado

- Adicionado o Polymorph 1.1.0: quando duas receitas usam os mesmos ingredientes, aparece um botão na mesa de trabalho (e em fornalhas, ferrarias etc.) para escolher qual item fabricar. Usada a 1.1.0 porque a 1.2.0 exige JEI 19.52 ou mais novo (o modpack usa 19.51). Incluído no servidor, no `.mrpack`, no `.zip` e no AutoModpack.
- Mobs comuns voltam aos atributos do vanilla / mod de origem: removida a curva de dificuldade por dias (vida, dano e armadura) do `dificuldade_dias.js`. Mobs já salvos no mundo perdem os modificadores antigos ao carregar.
- Chefes (lista do `dificuldade_dias.js` + tag `c:bosses`) recebem apenas 1,5x de vida máxima; o reforço de dano e de armadura foi removido. A vida atual é mantida na mesma proporção (o Wither continua carregando a partir de 1/3).
- `dragao.js`: Ender Dragon mantém 1000 de vida, com a fase Mad (2ª fase) só abaixo de 200 (antes 500), para os jogadores terem tempo de destruir de novo os cristais; removido o multiplicador de dano 2,5x.
- Buff Mobs mantido apenas com a troca de arma à distância por corpo a corpo (atributos, efeitos e escalas continuam neutros). Arquivos sincronizados no `.mrpack` e no `.zip`.
- Kit inicial `Mago` dividido em três: `Mago_Arcano`, `Mago_Fogo` e `Mago_Gelo`. Cada um traz o manto de mago, a varinha da escola (`wand_arcane`, `wand_fire` ou `wand_frost`), comida e 64 runas da escola.
- Kit inativo `Mago_Tier_3` e a função `classes_rpg:mago_tier_3` substituídos por `Mago_Arcano_Tier_3`, `Mago_Fogo_Tier_3` e `Mago_Gelo_Tier_3` (funções `classes_rpg:mago_arcano_tier_3`, `mago_fogo_tier_3` e `mago_gelo_tier_3`), cada um só com o manto, o cajado, o livro e as runas da sua escola.
- Kits e funções tier 3 de todas as classes agora trazem os encantamentos do RPG Series, conforme o que cada item aceita:
  - Armas de magia (cajados, varinhas, alaúde, lira, soqueira, espada de witcher): Spell Power V, Spell Haste V, Spell Critical Chance V e Spell Infinity.
  - Armas corpo a corpo e à distância: Critical Strike Chance V; as que aceitam magia (maça, glaive, machado berserker, rapieira) também recebem Spell Power V e Spell Infinity.
  - Armaduras: uma escola por peça, conforme o atributo de poder dela (Sunfire V para arcano/fogo, bardo e forcemaster; Soulfrost V para gelo; Energize V para paladino e sacerdote; Typhoon V para kelp e vento; Stonebloom V para dripstone) e Sign Intensity V na armadura de witcher. Magic Protection não foi incluída por ser exclusiva com Protection IV.
- Custo de XP da Spell Binding Table reduzido para todas as classes do RPG Series: as magias dos tomos (tiers 2, 3 e 4) passam a exigir nível 5 / 10 / 15 (antes 20 / 30 / 40) e a consumir 2 / 3 / 4 níveis (antes 6 / 9 / 12); os sinais tier 1 do Witcher exigem e consomem 1 nível. Feito com 173 cópias das magias em `kubejs/data/<mod>/spell/` (`learn.level_requirement_per_tier = 5`, `learn.level_cost_per_tier = 1`) e `spell_binding_level_requirement_offset = -5` em `config/spell_engine/server.json5`. As cópias precisam ser refeitas se algum mod do RPG Series for atualizado.
- Novo `conjunto_classe.js`: afinidade entre tomo e armadura. Com um tomo no slot de tomo, cada peça do conjunto do tomo vale +1, cada peça de outro conjunto (outra classe, vanilla ou outro mod) vale -1 e slot vazio vale 0. Por ponto: ±10% de vida máxima e armadura, ±5% de dano da classe (ataque físico, dano à distância ou poder da escola, conforme o tomo), ±2% de chance de crítico e ±2% de redução do dano recebido. Sem tomo equipado, nada muda. Recalculado a cada segundo.
- `conjunto_classe.js`: armas da classe do tomo na mão principal também recebem, por ponto, ±2% de dano, ±3% de velocidade (ataque corpo a corpo, puxada de arco/besta ou conjuração de cajado, varinha, alaúde e lira) e ±4% de velocidade do projétil (arcos e bestas). Com o escudo da classe em qualquer mão ou o efeito Deflection (aparar) ativo, cada ponto dá ±3% de proteção extra. Arma de outra classe não ganha nem perde nada.
- Exportado como o mod **RPG Power** 1.1.0 (`export/rpg_power/`), um content pack do KubeLoader com o mesmo script em inglês, para publicar no Modrinth e no CurseForge.
- Lootr removido (jar e `config/lootr-common.toml`): os baús voltam a ter loot compartilhado. Adicionado a `nonModpackFilesToDelete` do AutoModpack para os clientes apagarem o jar ao sincronizar. O mundo atual ainda não tinha chunks gerados, então nenhum baú do Lootr foi perdido.
- Novo `lapis_vilas.js` (LootJS): baús de vila (vanilla, ChoiceTheorem's, Repurposed Structures, Nova Structures, gazebo, mosteiro do paladino, torre do mago e taverna) têm 2% de chance de trazer 1 a 3 lápis-lazúli. Se houver uma Spell Binding Table (gazebo) nos chunks carregados até ~96 blocos do baú, a chance sobe para 8% e a quantidade para 3 a 8.
- Teleport Commands (`/home`, `/tpa` etc.) removido apenas do `.mrpack` (de 134 para 133 mods no `modrinth.index.json`); continua no servidor, no `.zip` e no AutoModpack.
- Corrigido: `dificuldade_dias.js` (vida 1,5x dos chefes) e `lapis_vilas.js` não carregavam (`redeclaration of const ID_ARMADURA` / `BuiltInRegistries`): os scripts do KubeJS dividem o mesmo escopo global e o `conjunto_classe.js` declarava constantes com os mesmos nomes. Os três agora rodam cada um dentro da própria função.
- Corrigido: a afinidade de tomo e armadura (`conjunto_classe.js`) nunca era aplicada, porque usava `player.age`, que não existe no KubeJS (agora `player.tickCount`). O log do KubeJS passa a mostrar quando os pontos de afinidade de um jogador mudam. RPG Power atualizado para 1.1.1 com as mesmas correções.
- Better Combat 2.4.0 e Elytra Slot 9.0.2 reativados (servidor, `.mrpack` e `.zip`). Dependências já presentes: playerAnimator, Cloth Config, Curios e Caelus API (o Caelus tinha ficado nos pacotes e agora também está no servidor). A pasta `config/bettercombat` é gerada de novo, com os valores padrão, na primeira inicialização.
- `conjunto_classe.js`: os tomos ganham uma descrição (lore) com os bônus do conjunto certo, as penalidades de outra armadura, os efeitos da arma e do escudo/aparar da classe, os conjuntos aceitos e as armas da classe. O servidor escreve a descrição nos tomos do inventário e do slot de tomo, a cada segundo; tomos com descrição de outra origem não são alterados. RPG Power atualizado para 1.2.0 com a mesma descrição, traduzível (inglês e português).
- `conjunto_classe.js`: tomos de conjuradores (mago, mago elemental, sacerdote, paladino, bardo e forcemaster) ganham +2% de poder mágico geral (`spell_power:generic`) por peça do conjunto certo, sem penalidade pelas peças erradas; a descrição do tomo mostra o bônus. RPG Power atualizado para 1.3.0.
- `conjunto_classe.js`: tomos de caçadores (Archer, Deadeye, Tundra Hunter, War Archer, ladino e berserker) ganham +2% de velocidade de deslocamento por peça do conjunto certo, sem penalidade pelas peças erradas; a descrição do tomo mostra o bônus. RPG Power atualizado para 1.4.0.
- `conjunto_classe.js`: tomos de combate corpo a corpo (guerreiro, ladino, berserker, paladino, forcemaster e witcher) ganham +0,5 bloco de alcance de ataque (`minecraft:player.entity_interaction_range`, também usado pelo Better Combat) por peça do conjunto certo, só com arma corpo a corpo da classe na mão e sem penalidade pelas peças erradas; a descrição do tomo mostra o bônus. RPG Power atualizado para 1.5.0.
- `conjunto_classe.js`: armas vanilla contam como a arma de classe equivalente: espadas para o witcher, machados para guerreiro e berserker, enxadas (foice) para o ladino, maça para o paladino, tridente (lança) para os arqueiros e besta (harpa-besta) para o bardo. Só vale o item do próprio Minecraft (espadas e machados de outros mods nas tags vanilla não contam). RPG Power atualizado para 1.6.0.

## [2026-10-23]

### Alterado

- Farmer's Delight limitado ao mod base; removidos 62 addons, dependências e utilitários relacionados.
- Collective atualizado para 8.65, atendendo à dependência mínima do Villager Names.
- Progressão de vida e dano dos mobs ajustada para +0,02x por dia, com limite de 1,5x no dia 38.
- Buff Mobs reativado apenas para a troca de arma à distância por arma corpo a corpo (modo `MELEE`), sem encantamentos, efeitos nos golpes, poção de regeneração ou alteração de atributos; a progressão de dificuldade continua no KubeJS.
- Mebahel's RPG: `villagerRumorChance` zerado (0.15 → 0.0). O mod grava o dado sincronizado `mine_smoke_below` em Guards do Guard Villagers e o cliente rejeitava o pacote (`Invalid entity data item type for field 32 on entity Guard`), derrubando quem entrava perto de uma vila (agora que o spawn é em vila).
- Novo starter kit inativo `Paladino_Tier_3` (em `config/serilum/starterkit/kits/inactive`, fora da escolha inicial): armadura Netherite Crusader, Netherite Mace e Netherite Kite Shield encantados, 64 pedras de cura, 64 cenouras douradas e o Paladin Libram com os 6 feitiços. Uso: `/sk give <jogador> Paladino_Tier_3`, ou `/execute as <jogador> run function classes_rpg:paladino_tier_3` (também dá 13 pontos em `class_skills` e 6 em `weapon_skills`).
- Kits inativos `<Classe>_Tier_3` para Arqueiro, Bardo, Berserker, Forcemaster, Guerreiro, Ladino, Mago, Mago_Elemental, Sacerdote e Witcher (netherite/topo de tier encantado, livros de feitiços completos). Cada classe tem a função `/execute as <jogador> run function classes_rpg:<classe>_tier_3` (ex.: `mago_elemental_tier_3`), que entrega os itens com comandos vanilla (`item replace`/`give`, sem depender do `/sk`) e 13 + 6 pontos de habilidade.
- Kits `<Classe>_Tier_3` agora trazem livros de feitiços vazios (para vincular na Spell Binding Table), 128 lápis-lazúli e 192 frascos de XP. Corrigidos os kits Bardo, Forcemaster e Witcher, cujo livro usava ids inexistentes (`bard_spell_book`, `forcemaster_spell_book`, `base_signs_spell_book`): agora recebem o livro vazio da classe.
- Better Combat removido (mrpg-lib e Simply Swords só o usam como dependência opcional); removida a pasta `config/bettercombat`.
- Elytra Slot removido (o mod não tem config para desativar o slot).
- Novo `limpar_rumor_guardas.js`: zera nos Guards já existentes o rumor do Mebahel salvo no mundo (chaves `MebahelRpgMobRumor*`, via `entity.nbt`), que continuava derrubando o cliente mesmo com `villagerRumorChance` em 0.
- `dificuldade_dias.js`: corrigido o `removeModifier` ambíguo (ResourceLocation x AttributeModifier) que abortava o reforço a cada spawn; corrigida a checagem da tag `c:bosses` (erro `Could not create ID from 'TagKey...'` a cada spawn); script sincronizado no `.mrpack` e no `.zip`.
- `dragao.js`: corrigido o erro em `beforeHurt` (`DamageSource.getEntity`), que impedia o multiplicador de dano 2,5x do Ender Dragon; agora usa `source.actual`.
- Small Ships removido de vez (o erro ao desligar o servidor persiste na 2.0.2, a mais recente); removidos também a config `smallships-server.toml` e o livro "Guia do Construtor Naval" do loot de vilas.
- Starter kits das classes que consomem runas agora incluem 64 de cada runa (como as 64 flechas do Arqueiro): Mago (arcana, fogo, gelo), Paladino e Sacerdote (cura) e Mago Elemental (aqua, terra, tempestade).
- Removido o script `spawn_vila.js`, que não funcionava. O Village Spawn Point 4.8 chegou a ser adicionado e foi removido em seguida: com o spawn dentro da vila, o cliente caía ao receber os dados dos Guards (Guard Villagers + rumores do Mebahel).
- README atualizado com os 135 mods agrupados por tipo.

### Corrigido

- Script de dificuldade progressiva corrigido para verificar a tag de chefes pelo holder do tipo de entidade.
- Falha de inicialização do Comforts/SpectreLib: arquivos de configuração pertenciam a `root` e o servidor não conseguia gravá-los; a propriedade foi ajustada para o usuário do servidor.
- Falha de inicialização por `world/session.lock` sem permissão: o mundo antigo, de `root`, foi separado e um novo diretório `world/` foi criado.
- AutoModpack mantido na 4.0.6, a versão estável mais recente; a 5.0.0-rc.5 é beta e não foi adotada.

### Pacotes

- Perfil Modrinth com 135 mods; o pacote dedicado do servidor contém 131, sem os quatro mods exclusivos de cliente.
- Pacotes e manifestos do AutoModpack atualizados, incluindo a remoção dos addons em clientes existentes.

## [2026-10-22]

### Adicionado

- Conteúdo e progressão da RPG Series e RPG Series Plus, com novas classes, habilidades, equipamentos, runas, relíquias e joias.
- Combate com Better Combat, Simply Swords e suporte a armas, escudos, animações e magias.
- Farmer's Delight e addons compatíveis, ampliando cultivo, ingredientes, receitas e culinária.
- Novos mobs, criaturas e chefes, incluindo Alex's Mobs e Mowzie's Mobs.
- Exploração e geração de mundo com Explorify, Repurposed Structures, estruturas da YUNG's, Dungeons and Taverns, When Dungeons Arise, Terralith, Tectonic e outros.
- Utilidades de exploração, como Nature's Compass e Explorer's Compass.
- Qualidade de vida e interface: Elytra Slot, luzes dinâmicas, camadas 3D de skin, nomes para villagers, sentar em blocos e guias adicionais para JEI.
- MmmMmmMmmMmm para testar dano em bonecos de treinamento.

### Alterado

- Desativadas as quests oferecidas por villagers pelo Mebahel's RPG; os quadros de quests nas vilas permanecem habilitados.
- Desabilitadas receitas, loot de baús e drops de armas e armaduras de Born in Chaos e L_Ender's Cataclysm para manter os equipamentos da RPG Series no centro da progressão.
- Perfil de skills configurado para usar as categorias de habilidades de classes e armas da RPG Series e seus addons.
- Registrado o slot `cape` do Curios usado pela capa Greater Sunfire, evitando falha ao carregar o item.
- Corrigidos dois advancements do Dungeons and Taverns que apontavam para um avanço inexistente.
- Removido Small Ships: a versão disponível causava uma falha fatal ao encerrar o servidor.
- README reorganizado com os 199 mods agrupados por tipo.

### Pacotes

- Perfil Modrinth com 199 mods; o pacote dedicado do servidor contém 195, sem os quatro mods exclusivos de cliente.
- Manifestos do servidor e do AutoModpack sincronizados com as adições.

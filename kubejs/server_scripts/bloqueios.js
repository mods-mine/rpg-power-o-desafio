// Bloqueia armas e armaduras do Born in Chaos e do L_Ender's Cataclysm:
// sem receita (crafting/smithing/etc.), sem drop de mobs e sem aparecer em baús.
// Buff Mobs não adiciona itens, por isso não aparece aqui.
// Para liberar um item, remova-o da lista e rode /reload.

const BLOQUEADOS = [
  // --- Born in Chaos: armaduras ---
  'born_in_chaos_v1:dark_metal_armor_helmet',
  'born_in_chaos_v1:dark_metal_armor_chestplate',
  'born_in_chaos_v1:dark_metal_armor_leggings',
  'born_in_chaos_v1:dark_metal_armor_boots',
  'born_in_chaos_v1:nightmare_mantleofthe_night_helmet',
  'born_in_chaos_v1:nightmare_mantleofthe_night_chestplate',
  'born_in_chaos_v1:nightmare_mantleofthe_night_leggings',
  'born_in_chaos_v1:nightmare_mantleofthe_night_boots',
  'born_in_chaos_v1:spiny_shell_armor_helmet',
  'born_in_chaos_v1:spiny_shell_armor_chestplate',
  'born_in_chaos_v1:lord_pumpkinheads_hat_helmet',
  'born_in_chaos_v1:damned_demomans_hat_helmet',
  'born_in_chaos_v1:killer_rabbit_ears_helmet',
  'born_in_chaos_v1:spiritual_guide_sombrero_helmet',
  'born_in_chaos_v1:missionary_hat_helmet',
  // --- Born in Chaos: armas ---
  'born_in_chaos_v1:sweet_axe',
  'born_in_chaos_v1:wood_splitter_axe',
  'born_in_chaos_v1:supreme_measure',
  'born_in_chaos_v1:great_reaper_axe',
  'born_in_chaos_v1:carrot_sword',
  'born_in_chaos_v1:sweet_sword',
  'born_in_chaos_v1:spiritual_sword',
  'born_in_chaos_v1:sharpened_dark_metal_sword',
  'born_in_chaos_v1:spider_bite_sword',
  'born_in_chaos_v1:darkwarblade',
  'born_in_chaos_v1:frostbitten_blade',
  'born_in_chaos_v1:soul_cutlass',
  'born_in_chaos_v1:soulbane',
  'born_in_chaos_v1:intoxicating_dagger',
  'born_in_chaos_v1:dark_ritual_dagger',
  'born_in_chaos_v1:nightmare_scythe',
  'born_in_chaos_v1:skullbreaker_hammer',
  'born_in_chaos_v1:nut_hammer',
  'born_in_chaos_v1:stop_hammer',
  'born_in_chaos_v1:shell_mace',
  'born_in_chaos_v1:trident_hayfork',
  'born_in_chaos_v1:staff_of_magic_arrows',
  'born_in_chaos_v1:staffof_blindness',
  'born_in_chaos_v1:bonescaller_staff',
  'born_in_chaos_v1:pumpkinstaffa',
  'born_in_chaos_v1:pumpkinhandgun',

  // --- L_Ender's Cataclysm: armaduras ---
  'cataclysm:ignitium_helmet',
  'cataclysm:ignitium_chestplate',
  'cataclysm:ignitium_elytra_chestplate',
  'cataclysm:ignitium_leggings',
  'cataclysm:ignitium_boots',
  'cataclysm:cursium_helmet',
  'cataclysm:cursium_chestplate',
  'cataclysm:cursium_leggings',
  'cataclysm:cursium_boots',
  'cataclysm:bone_reptile_helmet',
  'cataclysm:bone_reptile_chestplate',
  'cataclysm:monstrous_helm',
  'cataclysm:bloom_stone_pauldrons',
  // --- L_Ender's Cataclysm: armas e escudos ---
  'cataclysm:black_steel_sword',
  'cataclysm:black_steel_axe',
  'cataclysm:black_steel_targe',
  'cataclysm:azure_sea_shield',
  'cataclysm:bulwark_of_the_flame',
  'cataclysm:the_incinerator',
  'cataclysm:the_annihilator',
  'cataclysm:the_immolator',
  'cataclysm:soul_render',
  'cataclysm:meat_shredder',
  'cataclysm:infernal_forge',
  'cataclysm:void_forge',
  'cataclysm:brontes',
  'cataclysm:athame',
  'cataclysm:khopesh',
  'cataclysm:tidal_claws',
  'cataclysm:ancient_spear',
  'cataclysm:astrape',
  'cataclysm:ceraunus',
  'cataclysm:coral_spear',
  'cataclysm:coral_bardiche',
  'cataclysm:gauntlet_of_guard',
  'cataclysm:gauntlet_of_bulwark',
  'cataclysm:gauntlet_of_maelstrom',
  'cataclysm:cursed_bow',
  'cataclysm:wrath_of_the_desert',
  'cataclysm:laser_gatling',
  'cataclysm:wither_assault_shoulder_weapon',
  'cataclysm:void_assault_shoulder_weapon',
  'cataclysm:void_scatter_arrow',
]

// Ignora IDs que não existem no registro (ex.: item removido numa atualização do mod),
// para que um único ID inválido não derrube os bloqueios abaixo.
const VALIDOS = BLOQUEADOS.filter(id => {
  if (Item.exists(id)) return true
  console.warn(`bloqueios.js: item inexistente ignorado: ${id}`)
  return false
})
const BLOQUEADOS_SET = new Set(VALIDOS)

// 1) Receitas: remove toda receita que produz um item bloqueado.
ServerEvents.recipes(event => {
  VALIDOS.forEach(id => event.remove({ output: id }))
})

// 2) Loot tables (baús de estrutura, mobs, blocos): tira os itens das tabelas.
LootJS.lootTables(event => {
  event.getLootTableIds().forEach(id => {
    const table = event.getLootTable(id)
    if (table) table.removeItem(VALIDOS)
  })
})

// 3) Rede de segurança para loot adicionado por outros mods via global loot modifiers.
LootJS.modifiers(event => {
  event.addTableModifier(/.*/).removeLoot(VALIDOS)
})

// 4) Equipamento que o mob estava usando (não passa pela loot table).
EntityEvents.drops(event => {
  event.drops.removeIf(drop => BLOQUEADOS_SET.has(String(drop.item.id)))
})

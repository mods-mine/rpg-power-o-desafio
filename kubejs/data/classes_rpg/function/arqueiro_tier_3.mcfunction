# Uso: /execute as <jogador> run function classes_rpg:arqueiro_tier_3
item replace entity @s armor.head with archers:netherite_ranger_armor_head[minecraft:enchantments={levels:{"minecraft:protection":4,"minecraft:unbreaking":3,"minecraft:mending":1,"minecraft:thorns":3,"minecraft:respiration":3,"minecraft:aqua_affinity":1}}]
item replace entity @s armor.chest with archers:netherite_ranger_armor_chest[minecraft:enchantments={levels:{"minecraft:protection":4,"minecraft:unbreaking":3,"minecraft:mending":1,"minecraft:thorns":3}}]
item replace entity @s armor.legs with archers:netherite_ranger_armor_legs[minecraft:enchantments={levels:{"minecraft:protection":4,"minecraft:unbreaking":3,"minecraft:mending":1,"minecraft:thorns":3,"minecraft:swift_sneak":3}}]
item replace entity @s armor.feet with archers:netherite_ranger_armor_feet[minecraft:enchantments={levels:{"minecraft:protection":4,"minecraft:unbreaking":3,"minecraft:mending":1,"minecraft:thorns":3,"minecraft:feather_falling":4,"minecraft:depth_strider":3,"minecraft:soul_speed":3}}]
give @s archers:netherite_longbow[minecraft:enchantments={levels:{"minecraft:power":5,"minecraft:punch":2,"minecraft:flame":1,"minecraft:unbreaking":3,"minecraft:mending":1,"critical_strike:chance":5}}] 1
give @s archers:netherite_heavy_crossbow[minecraft:enchantments={levels:{"minecraft:quick_charge":3,"minecraft:piercing":4,"minecraft:unbreaking":3,"minecraft:mending":1,"critical_strike:chance":5}}] 1
give @s archers:netherite_rapid_crossbow[minecraft:enchantments={levels:{"minecraft:quick_charge":3,"minecraft:piercing":4,"minecraft:unbreaking":3,"minecraft:mending":1,"critical_strike:chance":5}}] 1
give @s spell_engine:spell_book[spell_engine:spell_container={access:"NONE",pool:"archers:spell_book/archer",max_spell_count:6,spell_ids:[]},spell_engine:item_model="archers:item/spell_book/archer"] 1
give @s minecraft:arrow 64
give @s minecraft:arrow 64
give @s minecraft:golden_carrot 64
give @s minecraft:lapis_lazuli 64
give @s minecraft:lapis_lazuli 64
give @s minecraft:experience_bottle 64
give @s minecraft:experience_bottle 64
give @s minecraft:experience_bottle 64
puffish_skills points add @s skill_tree_rpgs:class_skills 13
puffish_skills points add @s skill_tree_rpgs:weapon_skills 6

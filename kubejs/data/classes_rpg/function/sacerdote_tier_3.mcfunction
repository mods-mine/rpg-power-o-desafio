# Uso: /execute as <jogador> run function classes_rpg:sacerdote_tier_3
item replace entity @s armor.head with paladins:netherite_prior_robe_head[minecraft:enchantments={levels:{"minecraft:protection":4,"minecraft:unbreaking":3,"minecraft:mending":1,"minecraft:thorns":3,"minecraft:respiration":3,"minecraft:aqua_affinity":1,"spell_power:energize":5}}]
item replace entity @s armor.chest with paladins:netherite_prior_robe_chest[minecraft:enchantments={levels:{"minecraft:protection":4,"minecraft:unbreaking":3,"minecraft:mending":1,"minecraft:thorns":3,"spell_power:energize":5}}]
item replace entity @s armor.legs with paladins:netherite_prior_robe_legs[minecraft:enchantments={levels:{"minecraft:protection":4,"minecraft:unbreaking":3,"minecraft:mending":1,"minecraft:thorns":3,"minecraft:swift_sneak":3,"spell_power:energize":5}}]
item replace entity @s armor.feet with paladins:netherite_prior_robe_feet[minecraft:enchantments={levels:{"minecraft:protection":4,"minecraft:unbreaking":3,"minecraft:mending":1,"minecraft:thorns":3,"minecraft:feather_falling":4,"minecraft:depth_strider":3,"minecraft:soul_speed":3,"spell_power:energize":5}}]
give @s paladins:netherite_holy_staff[minecraft:enchantments={levels:{"minecraft:unbreaking":3,"minecraft:mending":1,"spell_power:spell_power":5,"spell_power:haste":5,"spell_power:critical_chance":5,"spell_engine:spell_infinity":1}}] 1
give @s paladins:netherite_holy_wand[minecraft:enchantments={levels:{"minecraft:unbreaking":3,"minecraft:mending":1,"spell_power:spell_power":5,"spell_power:haste":5,"spell_power:critical_chance":5,"spell_engine:spell_infinity":1}}] 1
give @s spell_engine:spell_book[spell_engine:spell_container={access:"NONE",pool:"paladins:spell_book/priest",max_spell_count:6,spell_ids:[]},spell_engine:item_model="paladins:item/spell_book/priest"] 1
give @s minecraft:golden_carrot 64
give @s runes:healing_stone 64
give @s minecraft:lapis_lazuli 64
give @s minecraft:lapis_lazuli 64
give @s minecraft:experience_bottle 64
give @s minecraft:experience_bottle 64
give @s minecraft:experience_bottle 64
puffish_skills points add @s skill_tree_rpgs:class_skills 13
puffish_skills points add @s skill_tree_rpgs:weapon_skills 6

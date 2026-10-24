# Uso: /execute as <jogador> run function classes_rpg:forcemaster_tier_3
item replace entity @s armor.head with forcemaster_rpg:phasleb_head[minecraft:enchantments={levels:{"minecraft:protection":4,"minecraft:unbreaking":3,"minecraft:mending":1,"minecraft:thorns":3,"minecraft:respiration":3,"minecraft:aqua_affinity":1,"spell_power:sunfire":5}}]
item replace entity @s armor.chest with forcemaster_rpg:phasleb_chest[minecraft:enchantments={levels:{"minecraft:protection":4,"minecraft:unbreaking":3,"minecraft:mending":1,"minecraft:thorns":3,"spell_power:sunfire":5}}]
item replace entity @s armor.legs with forcemaster_rpg:phasleb_legs[minecraft:enchantments={levels:{"minecraft:protection":4,"minecraft:unbreaking":3,"minecraft:mending":1,"minecraft:thorns":3,"minecraft:swift_sneak":3,"spell_power:sunfire":5}}]
item replace entity @s armor.feet with forcemaster_rpg:phasleb_feet[minecraft:enchantments={levels:{"minecraft:protection":4,"minecraft:unbreaking":3,"minecraft:mending":1,"minecraft:thorns":3,"minecraft:feather_falling":4,"minecraft:depth_strider":3,"minecraft:soul_speed":3,"spell_power:sunfire":5}}]
give @s forcemaster_rpg:netherite_knuckle[minecraft:enchantments={levels:{"minecraft:sharpness":5,"minecraft:fire_aspect":2,"minecraft:knockback":2,"minecraft:looting":3,"minecraft:sweeping_edge":3,"minecraft:unbreaking":3,"minecraft:mending":1,"spell_power:spell_power":5,"spell_power:haste":5,"spell_power:critical_chance":5,"spell_engine:spell_infinity":1,"critical_strike:chance":5}}] 1
give @s spell_engine:spell_book[spell_engine:spell_container={access:"NONE",pool:"forcemaster_rpg:spell_book/forcemaster",max_spell_count:6,spell_ids:[]},spell_engine:item_model="forcemaster_rpg:item/spell_book/forcemaster"] 1
give @s minecraft:golden_carrot 64
give @s minecraft:lapis_lazuli 64
give @s minecraft:lapis_lazuli 64
give @s minecraft:experience_bottle 64
give @s minecraft:experience_bottle 64
give @s minecraft:experience_bottle 64
puffish_skills points add @s skill_tree_rpgs:class_skills 13
puffish_skills points add @s skill_tree_rpgs:weapon_skills 6

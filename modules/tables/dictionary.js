import { HMCONST } from "./constants.js";
export const idx = {};

// Dictionaries
idx.ability_short = {
    str: "HM.ability_short.str",
    int: "HM.ability_short.int",
    wis: "HM.ability_short.wis",
    dex: "HM.ability_short.dex",
    con: "HM.ability_short.con",
    lks: "HM.ability_short.lks",
    cha: "HM.ability_short.cha",
};

idx.ability_long = {
    str: "HM.ability.str",
    int: "HM.ability.int",
    wis: "HM.ability.wis",
    dex: "HM.ability.dex",
    con: "HM.ability.con",
    lks: "HM.ability.lks",
    cha: "HM.ability.cha",
};

idx.ability = {
    str: "HM.str",
    int: "HM.int",
    wis: "HM.wis",
    dex: "HM.dex",
    con: "HM.con",
    lks: "HM.lks",
    cha: "HM.cha",
};

idx.affix = {
    [HMCONST.AFFIX.TYPE.UNDEF]: "HM.EFFECT.TYPE.undef",
    [HMCONST.AFFIX.TYPE.BUFF]: "HM.EFFECT.TYPE.buff",
    [HMCONST.AFFIX.TYPE.DEBUFF]: "HM.EFFECT.TYPE.debuff",
    [HMCONST.AFFIX.TYPE.STATUS]: "HM.EFFECT.TYPE.status",
    [HMCONST.AFFIX.TYPE.TALENT]: "HM.EFFECT.TYPE.talent",
};

idx.alignment = {
    lg: "HM.alignmentSelect.lg",
    ng: "HM.alignmentSelect.ng",
    cg: "HM.alignmentSelect.cg",
    ln: "HM.alignmentSelect.ln",
    tn: "HM.alignmentSelect.tn",
    cn: "HM.alignmentSelect.cn",
    le: "HM.alignmentSelect.le",
    ne: "HM.alignmentSelect.ne",
    ce: "HM.alignmentSelect.ce",
    non: "HM.alignmentSelect.non",
};

idx.bmi = {
    [HMCONST.PRIORS.BMI.NORMAL]: "Normal",
    [HMCONST.PRIORS.BMI.OVER]: "Overweight",
    [HMCONST.PRIORS.BMI.OBESE]: "Obese",
};

idx.embedSelect = {
    [HMCONST.RANGED.EMBED.AUTO]: "HM.auto",
    [HMCONST.RANGED.EMBED.NONE]: "HM.embedSelect.none",
    [HMCONST.RANGED.EMBED.SUPERFICIAL]: "HM.embedSelect.superficial",
    [HMCONST.RANGED.EMBED.EMBEDDED]: "HM.embedSelect.embedded",
    [HMCONST.RANGED.EMBED.DEEPLY]: "HM.embedSelect.deeply",
};

idx.containerType = {
    [HMCONST.CONTAINER.TYPE.WEIGHT]: "HM.containerTypeSelect.weight",
    [HMCONST.CONTAINER.TYPE.QUANTITY]: "HM.containerTypeSelect.quantity",
    [HMCONST.CONTAINER.TYPE.UNLIMITED]: "HM.containerTypeSelect.unlimited",
};

idx.handedness = {
    right: "HM.handednessSelect.right",
    left: "HM.handednessSelect.left",
    ambidextrous: "HM.handednessSelect.ambidextrous",
};

idx.classHints = {
    assn: "HM.CCLASS.HINT.assn",
    fcast: "HM.CCLASS.HINT.fcast",
    hp: "HM.CCLASS.HINT.hp",
    hprof: "HM.CCLASS.HINT.hprof",
    slvl: "HM.CCLASS.HINT.slvl",
};

idx.honor = {
    [HMCONST.HONOR.NOTORIETY]: "HM.honorSelect.notoriety",
    [HMCONST.HONOR.DISHONORABLE]: "HM.honorSelect.dishonorable",
    [HMCONST.HONOR.LOW]: "HM.honorSelect.low",
    [HMCONST.HONOR.AVERAGE]: "HM.honorSelect.average",
    [HMCONST.HONOR.GREAT]: "HM.honorSelect.great",
    [HMCONST.HONOR.LEGENDARY]: "HM.honorSelect.legendary",
};

idx.fame = {
    [HMCONST.FAME.UNKNOWN]: "HM.fameSelect.unknown",
    [HMCONST.FAME.OBSCURE]: "HM.fameSelect.obscure",
    [HMCONST.FAME.LOCALPERSON]: "HM.fameSelect.localperson",
    [HMCONST.FAME.MINORCELEB]: "HM.fameSelect.minorceleb",
    [HMCONST.FAME.MAJORCELEB]: "HM.fameSelect.majorceleb",
    [HMCONST.FAME.FAMOUS]: "HM.fameSelect.famous",
    [HMCONST.FAME.EPIC]: "HM.fameSelect.epic",
};

idx.movement = {
    action: {
        walk: {
            [HMCONST.MOVEACTION.WALK.WALK]: "HM.MOVEMENT.action.walk.walk",
            [HMCONST.MOVEACTION.WALK.JOG]: "HM.MOVEMENT.action.walk.jog",
            [HMCONST.MOVEACTION.WALK.RUN]: "HM.MOVEMENT.action.walk.run",
            [HMCONST.MOVEACTION.WALK.SPRINT]: "HM.MOVEMENT.action.walk.sprint",
            [HMCONST.MOVEACTION.WALK.OVER]: "HM.MOVEMENT.action.walk.over",
        },
    },
};

idx.moveSpd = {
    [HMCONST.MOVE.CRAWL]: "HM.moveSpds.crawl",
    [HMCONST.MOVE.WALK]: "HM.moveSpds.walk",
    [HMCONST.MOVE.JOG]: "HM.moveSpds.jog",
    [HMCONST.MOVE.RUN]: "HM.moveSpds.run",
    [HMCONST.MOVE.SPRINT]: "HM.moveSpds.sprint",
};

idx.special = {
    [HMCONST.SPECIAL.STANDARD]: "HM.specSelect.std",
    [HMCONST.SPECIAL.JAB]: "HM.specSelect.jab",
    [HMCONST.SPECIAL.BACKSTAB]: "HM.specSelect.stab",
    [HMCONST.SPECIAL.FLEEING]: "HM.specSelect.flee",
    [HMCONST.SPECIAL.SET4CHARGE]: "HM.specSelect.s4c",
    [HMCONST.SPECIAL.RESET]: "HM.specSelect.reset",
    [HMCONST.SPECIAL.RSTANDARD]: "HM.specSelect.rstd",
    [HMCONST.SPECIAL.SNAPSHOT]: "HM.specSelect.snap",
    [HMCONST.SPECIAL.LOAD]: "HM.specSelect.load",
    [HMCONST.SPECIAL.DRAW]: "HM.specSelect.draw",
    [HMCONST.SPECIAL.AIM]: "HM.specSelect.aim",
    [HMCONST.SPECIAL.DEFEND]: "HM.specSelect.def",
    [HMCONST.SPECIAL.RDEFEND]: "HM.specSelect.rdef",
    [HMCONST.SPECIAL.SCAMPER]: "HM.specSelect.sback",
    [HMCONST.SPECIAL.GGROUND]: "HM.specSelect.ggnd",
    [HMCONST.SPECIAL.FULLPARRY]: "HM.specSelect.fparry",
    [HMCONST.SPECIAL.AGGRESSIVE]: "HM.specSelect.agg",
    [HMCONST.SPECIAL.WITHDRAWL]: "HM.specSelect.wdrawl",
    [HMCONST.SPECIAL.CHARGE]: "HM.specSelect.charge",
};

idx.size = {
    tiny: "HM.sizeSelect.tiny",
    small: "HM.sizeSelect.small",
    medium: "HM.sizeSelect.medium",
    large: "HM.sizeSelect.large",
};

idx.spellMishap = {
    0: "HM.spellMishapList.none",
    1: "HM.spellMishapList.schedule",
    2: "HM.spellMishapList.failed",
    3: "HM.spellMishapList.tier1",
    4: "HM.spellMishapList.tier2",
    5: "HM.spellMishapList.tier3",
    6: "HM.spellMishapList.tier4",
    7: "HM.spellMishapList.tier5",
    8: "HM.spellMishapList.tier6",
    9: "HM.spellMishapList.tier7",
    10: "HM.spellMishapList.tier8",
};

idx.statbonus = {
    feat: "HM.feat",
    atk: "HM.statbonus.atk",
    def: "HM.statbonus.def",
    dmg: "HM.statbonus.dmg",
    init: "HM.statbonus.init",
    dodge: "HM.statbonus.dodge",
    mental: "HM.statbonus.mental",
    physical: "HM.statbonus.physical",
    turning: "HM.statbonus.turning",
    morale: "HM.statbonus.morale",
};

idx.thingState = {
    0: "HM.thingState.owned",
    1: "HM.thingState.carried",
    2: "HM.thingState.equipped",
    3: "HM.thingState.innate",
};

idx.qidx = {
    0: "HM.qualitySelect.worthless",
    1: "HM.qualitySelect.poor",
    2: "HM.qualitySelect.shoddy",
    3: "HM.qualitySelect.average",
    4: "HM.qualitySelect.professional",
    5: "HM.qualitySelect.extraordinary",
    6: "HM.qualitySelect.superlative",
};

idx.tenacity = {
    0: "HM.tenacitySelect.none",
    1: "HM.tenacitySelect.fearless",
    2: "HM.tenacitySelect.brave",
    3: "HM.tenacitySelect.steady",
    4: "HM.tenacitySelect.nervous",
    5: "HM.tenacitySelect.cowardly",
};

idx.armorSelect = {
    [HMCONST.ARMOR.TYPE.NONE]: "HM.armorSelect.none",
    [HMCONST.ARMOR.TYPE.SHIELD]: "HM.armorSelect.shield",
    [HMCONST.ARMOR.TYPE.LIGHT]: "HM.armorSelect.light",
    [HMCONST.ARMOR.TYPE.MEDIUM]: "HM.armorSelect.medium",
    [HMCONST.ARMOR.TYPE.HEAVY]: "HM.armorSelect.heavy",
};

idx.physdmgtype = {
    crushing: "HM.physDmgSelect.crushing",
    hacking: "HM.physDmgSelect.hacking",
    puncturing: "HM.physDmgSelect.puncturing",
};

idx.dmgType = {
    [HMCONST.DMGTYPE.CRUSHING]: "HM.dmgType.crushing",
    [HMCONST.DMGTYPE.HACKING]: "HM.dmgType.hacking",
    [HMCONST.DMGTYPE.PUNCTURING]: "HM.dmgType.puncturing",
};

idx.effectModes = {
    [CONST.ACTIVE_EFFECT_MODES.ADD]: "EFFECT.MODE_ADD",
    [CONST.ACTIVE_EFFECT_MODES.UPGRADE]: "EFFECT.MODE_UPGRADE",
    [CONST.ACTIVE_EFFECT_MODES.DOWNGRADE]: "EFFECT.MODE_DOWNGRADE",
    [CONST.ACTIVE_EFFECT_MODES.OVERRIDE]: "EFFECT.MODE_OVERRIDE",
    [CONST.ACTIVE_EFFECT_MODES.MULTIPLY]: "EFFECT.MODE_MULTIPLY",
    [CONST.ACTIVE_EFFECT_MODES.CUSTOM]: "EFFECT.MODE_CUSTOM",
};

idx.embedSelect = {
    [HMCONST.RANGED.EMBED.AUTO]: "HM.auto",
    [HMCONST.RANGED.EMBED.NONE]: "HM.embedSelect.none",
    [HMCONST.RANGED.EMBED.SUPER]: "HM.embedSelect.superficial",
    [HMCONST.RANGED.EMBED.EMBED]: "HM.embedSelect.embedded",
    [HMCONST.RANGED.EMBED.D_EMBED]: "HM.embedSelect.deeply",
};

idx.intelligenceSelect = {
    0: "HM.intelligenceSelect.non",
    1: "HM.intelligenceSelect.semi",
    2: "HM.intelligenceSelect.animallow",
    3: "HM.intelligenceSelect.animalhigh",
    4: "HM.intelligenceSelect.obtuse",
    5: "HM.intelligenceSelect.slow",
    6: "HM.intelligenceSelect.average",
    7: "HM.intelligenceSelect.bright",
    8: "HM.intelligenceSelect.smart",
    9: "HM.intelligenceSelect.brilliant",
    10: "HM.intelligenceSelect.genius",
    11: "HM.intelligenceSelect.sgenius",
    12: "HM.intelligenceSelect.gawd",
};

idx.weaponskill = {
    minimal: "HM.weaponskillSelect.minimal",
    low: "HM.weaponskillSelect.low",
    medium: "HM.weaponskillSelect.medium",
    high: "HM.weaponskillSelect.high",
};

idx.saveSelect = {
    [HMCONST.SAVE.TYPE.NONE]: "HM.saves.none",
    [HMCONST.SAVE.TYPE.SPECIAL]: "HM.saves.special",
    [HMCONST.SAVE.TYPE.PHYSICAL]: "HM.saves.physical",
    [HMCONST.SAVE.TYPE.MENTAL]: "HM.saves.mental",
    [HMCONST.SAVE.TYPE.DODGE]: "HM.saves.dodge",
};

idx.saveActionSelect = {
    [HMCONST.SAVE.ACTION.HALF]: "HM.saves.half",
    [HMCONST.SAVE.ACTION.NEGATE]: "HM.saves.negates",
    [HMCONST.SAVE.ACTION.EVADE]: "HM.saves.evades",
    [HMCONST.SAVE.ACTION.SPECIAL]: "HM.saves.special",
};

idx.saves = {
    dodge: "HM.saves.dodge",
    fatigue: "HM.saves.fatigue",
    foa: "HM.saves.foa",
    fos: "HM.saves.fos",
    mental: "HM.saves.mental",
    morale: "HM.saves.morale",
    poison: "HM.saves.poison",
    physical: "HM.saves.physical",
    tenacity: "HM.saves.tenacity",
    trauma: "HM.saves.trauma",
    turning: "HM.saves.turning",
    will: "HM.saves.will",
};

idx.sex = {
    [HMCONST.PRIORS.SEX.FEMALE]: "HM.female",
    [HMCONST.PRIORS.SEX.MALE]: "HM.male",
};

idx.skillLevel = {
    [HMCONST.SKILL.DIFF.AUTO]: "HM.auto",
    [HMCONST.SKILL.DIFF.TRIVIAL]: "HM.skillDiffSelect.trivial",
    [HMCONST.SKILL.DIFF.EASY]: "HM.skillDiffSelect.easy",
    [HMCONST.SKILL.DIFF.AVERAGE]: "HM.skillDiffSelect.average",
    [HMCONST.SKILL.DIFF.DIFFICULT]: "HM.skillDiffSelect.difficult",
    [HMCONST.SKILL.DIFF.VDIFFICULT]: "HM.skillDiffSelect.verydifficult",
};

idx.skillMastery = {
    [HMCONST.SKILL.MASTERY.UNSKILLED]: "HM.skillMastery.unskilled",
    [HMCONST.SKILL.MASTERY.NOVICE]: "HM.skillMastery.novice",
    [HMCONST.SKILL.MASTERY.AVERAGE]: "HM.skillMastery.average",
    [HMCONST.SKILL.MASTERY.ADVANCED]: "HM.skillMastery.advanced",
    [HMCONST.SKILL.MASTERY.EXPERT]: "HM.skillMastery.expert",
    [HMCONST.SKILL.MASTERY.MASTER]: "HM.skillMastery.master",
};

idx.spellVolatility = {
    [HMCONST.SVR.NORMAL]: "HM.spellVolatility.normal",
    [HMCONST.SVR.AMPED1]: "HM.spellVolatility.amped1",
    [HMCONST.SVR.AMPED2]: "HM.spellVolatility.amped2",
    [HMCONST.SVR.DANGER1]: "HM.spellVolatility.danger1",
    [HMCONST.SVR.DANGER1]: "HM.spellVolatility.danger1",
    [HMCONST.SVR.DANGER1]: "HM.spellVolatility.danger1",
    [HMCONST.SVR.DANGER2]: "HM.spellVolatility.danger2",
    [HMCONST.SVR.DANGER3]: "HM.spellVolatility.danger3",
    [HMCONST.SVR.DANGER4]: "HM.spellVolatility.danger4",
};

idx.talentSelect = {
    [HMCONST.TALENT.WEAPON]: "HM.talentSelect.weapon",
    [HMCONST.TALENT.EFFECT]: "HM.talentSelect.effect",
};

idx.itemTypes = {
    armor: "TYPES.Item.armor",
    weapon: "TYPES.Item.weapon",
    item: "TYPES.Item.item",
    container: "HM.itemTypes.container",
    currency: "TYPES.Item.currency",
};

idx.dice = {
    "1d20": "d20",
    "1d12": "d12",
    "1d10": "d10",
    "1d8": "d8",
    "1d6": "d6",
    "1d4": "d4",
    "1d3": "d3",
};

idx.chargeSpd = {
    [HMCONST.SPECIAL.CHARGE2]: "HM.slow",
    [HMCONST.SPECIAL.CHARGE4]: "HM.fast",
};

idx.defense = {
    [HMCONST.DEFENSE.DEFENSE0]: "HM.defenseSelect.defense0",
    [HMCONST.DEFENSE.DEFENSE1]: "HM.defenseSelect.defense1",
    [HMCONST.DEFENSE.DEFENSE2]: "HM.defenseSelect.defense2",
    [HMCONST.DEFENSE.DEFENSE3]: "HM.defenseSelect.defense3",
    [HMCONST.DEFENSE.DEFENSE4]: "HM.defenseSelect.defense4",
};

idx.defDie = {
    [HMCONST.DIE.D20P]: "d20p",
    [HMCONST.DIE.D20PM4]: "d20p - 4",
    [HMCONST.DIE.D12P]: "d12p",
    [HMCONST.DIE.D10P]: "d10p",
    [HMCONST.DIE.D8P]: "d8p",
};

idx.defDieRanged = {
    [HMCONST.DIE.D20P]: "HM.rangedDefSelect.moving",
    [HMCONST.DIE.D12P]: "HM.rangedDefSelect.stationary",
};

idx.encumbrance = {
    [HMCONST.ENCUMBRANCE.NONE]: "HM.encumbSelect.none",
    [HMCONST.ENCUMBRANCE.LIGHT]: "HM.encumbSelect.light",
    [HMCONST.ENCUMBRANCE.MEDIUM]: "HM.encumbSelect.medium",
    [HMCONST.ENCUMBRANCE.HEAVY]: "HM.encumbSelect.heavy",
    [HMCONST.ENCUMBRANCE.OVER]: "HM.encumbSelect.over",
};

idx.reach = {
    [HMCONST.RANGED.REACH.MINIMUM]: "HM.rangeSelect.minimum",
    [HMCONST.RANGED.REACH.SHORT]: "HM.rangeSelect.short",
    [HMCONST.RANGED.REACH.MEDIUM]: "HM.rangeSelect.medium",
    [HMCONST.RANGED.REACH.LONG]: "HM.rangeSelect.long",
    [HMCONST.RANGED.REACH.EXTREME]: "HM.rangeSelect.extreme",
};

idx.scale = {
    0: "HM.custom",
    1: "HM.scaleFull.tiny",
    2: "HM.scaleFull.small",
    3: "HM.scaleFull.medium",
    4: "HM.scaleFull.large",
    5: "HM.scaleFull.huge",
    6: "HM.scaleFull.gigantic",
    7: "HM.scaleFull.enormous",
    8: "HM.scaleFull.colossal",
};

idx.spellLevels = {
    0: "HM.spellLevels.0",
    1: "HM.spellLevels.1",
    2: "HM.spellLevels.2",
    3: "HM.spellLevels.3",
    4: "HM.spellLevels.4",
    5: "HM.spellLevels.5",
    6: "HM.spellLevels.6",
    7: "HM.spellLevels.7",
    8: "HM.spellLevels.8",
    9: "HM.spellLevels.9",
    10: "HM.spellLevels.10",
    11: "HM.spellLevels.11",
    12: "HM.spellLevels.12",
    13: "HM.spellLevels.13",
    14: "HM.spellLevels.14",
    15: "HM.spellLevels.15",
    16: "HM.spellLevels.16",
    17: "HM.spellLevels.17",
    18: "HM.spellLevels.18",
    19: "HM.spellLevels.19",
    20: "HM.spellLevels.20",
    21: "HM.spellLevels.21",
};

idx.spellHybrid = {
    0: "HM.SPELL.HYBRID.0",
    1: "HM.SPELL.HYBRID.1",
    2: "HM.SPELL.HYBRID.2",
    3: "HM.SPELL.HYBRID.3",
    4: "HM.SPELL.HYBRID.4",
    5: "HM.SPELL.HYBRID.5",
    6: "HM.SPELL.HYBRID.6",
    7: "HM.SPELL.HYBRID.7",
    8: "HM.SPELL.HYBRID.8",
    9: "HM.SPELL.HYBRID.9",
    10: "HM.SPELL.HYBRID.10",
    11: "HM.SPELL.HYBRID.11",
    12: "HM.SPELL.HYBRID.12",
    13: "HM.SPELL.HYBRID.13",
    14: "HM.SPELL.HYBRID.14",
    15: "HM.SPELL.HYBRID.15",
    16: "HM.SPELL.HYBRID.16",
    17: "HM.SPELL.HYBRID.17",
    18: "HM.SPELL.HYBRID.18",
    19: "HM.SPELL.HYBRID.19",
    20: "HM.SPELL.HYBRID.20",
    21: "HM.SPELL.HYBRID.21",
    22: "HM.SPELL.HYBRID.22",
};

// Images
idx.savesImg = {
    dodge: "icons/skills/movement/feet-winged-boots-brown.webp",
    fatigue: "icons/magic/symbols/question-stone-yellow.webp",
    foa: "icons/skills/movement/figure-running-gray.webp",
    fos: "icons/magic/control/buff-strength-muscle-damage.webp",
    mental: "icons/skills/wounds/anatomy-organ-brain-pink-red.webp",
    morale: "icons/sundries/flags/banner-flag-white.webp",
    poison: "icons/skills/toxins/poison-bottle-corked-fire-green.webp",
    physical: "icons/skills/wounds/anatomy-bone-joint.webp",
    tenacity: "icons/magic/control/fear-fright-white.webp",
    trauma: "icons/skills/wounds/injury-face-impact-orange.webp",
    turning: "icons/magic/holy/prayer-hands-glowing-yellow.webp",
    will: "icons/magic/death/undead-skeleton-rags-fire-green.webp",
};

idx.combatImg = {
    atk: "icons/weapons/swords/greatsword-blue.webp",
    ratk: "icons/weapons/bows/shortbow-recurve-blue.webp",
    dmg: "icons/skills/melee/strike-sword-blood-red.webp",
    rdmg: "icons/weapons/ammunition/arrow-head-war-flight.webp",
    def: "icons/equipment/shield/heater-crystal-blue.webp",
    cast: "icons/weapons/wands/wand-carved-pink.webp",
    prep: "icons/sundries/documents/document-symbol-lightning-brown.webp",
    unprep: "icons/sundries/documents/blueprint-magical-brown.webp",
};

idx.defaultImg = {
    item: "icons/magic/symbols/question-stone-yellow.webp",
    body: "icons/magic/control/buff-strength-muscle-damage-red.webp",
};

export default idx;

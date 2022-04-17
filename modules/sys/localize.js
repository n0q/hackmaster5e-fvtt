export const idx = {};

// Localization
idx.ability_short = {
    'str': 'HM.ability_short.str',
    'int': 'HM.ability_short.int',
    'wis': 'HM.ability_short.wis',
    'dex': 'HM.ability_short.dex',
    'con': 'HM.ability_short.con',
    'lks': 'HM.ability_short.lks',
    'cha': 'HM.ability_short.cha',
};

idx.ability_long = {
    'str': 'HM.ability.str',
    'int': 'HM.ability.int',
    'wis': 'HM.ability.wis',
    'dex': 'HM.ability.dex',
    'con': 'HM.ability.con',
    'lks': 'HM.ability.lks',
    'cha': 'HM.ability.cha',
};

idx.ability = {
    'str': 'HM.str',
    'int': 'HM.int',
    'wis': 'HM.wis',
    'dex': 'HM.dex',
    'con': 'HM.con',
    'lks': 'HM.lks',
    'cha': 'HM.cha',
};

idx.alignment = {
    'lg':  'HM.alignmentSelect.lg',
    'ng':  'HM.alignmentSelect.ng',
    'cg':  'HM.alignmentSelect.cg',
    'ln':  'HM.alignmentSelect.ln',
    'tn':  'HM.alignmentSelect.tn',
    'cn':  'HM.alignmentSelect.cn',
    'le':  'HM.alignmentSelect.le',
    'ne':  'HM.alignmentSelect.ne',
    'ce':  'HM.alignmentSelect.ce',
    'non': 'HM.alignmentSelect.non',
};

idx.handedness = {
    'right':        'HM.handednessSelect.right',
    'left':         'HM.handednessSelect.left',
    'ambidextrous': 'HM.handednessSelect.ambidextrous',
};

idx.size = {
    'tiny':   'HM.sizeSelect.tiny',
    'small':  'HM.sizeSelect.small',
    'medium': 'HM.sizeSelect.medium',
    'large':  'HM.sizeSelect.large',
};

idx.statbonus = {
    'feat':     'HM.feat',
    'atk':      'HM.statbonus.atk',
    'def':      'HM.statbonus.def',
    'dmg':      'HM.statbonus.dmg',
    'init':     'HM.statbonus.init',
    'dodge':    'HM.statbonus.dodge',
    'mental':   'HM.statbonus.mental',
    'physical': 'HM.statbonus.physical',
    'turning':  'HM.statbonus.turning',
    'morale':   'HM.statbonus.morale',
};

idx.thingState = {
    0: 'HM.thingState.owned',
    1: 'HM.thingState.carried',
    2: 'HM.thingState.equipped',
    3: 'HM.thingState.innate',
};

idx.qidx = {
    0: 'HM.qualitySelect.worthless',
    1: 'HM.qualitySelect.poor',
    2: 'HM.qualitySelect.shoddy',
    3: 'HM.qualitySelect.average',
    4: 'HM.qualitySelect.professional',
    5: 'HM.qualitySelect.extraordinary',
    6: 'HM.qualitySelect.superlative',
};

idx.tenacity = {
    0: 'HM.tenacitySelect.none',
    1: 'HM.tenacitySelect.fearless',
    2: 'HM.tenacitySelect.brave',
    3: 'HM.tenacitySelect.steady',
    4: 'HM.tenacitySelect.nervous',
    5: 'HM.tenacitySelect.cowardly',
};

idx.armortype = {
    'none':   'HM.armorSelect.none',
    'light':  'HM.armorSelect.light',
    'medium': 'HM.armorSelect.medium',
    'heavy':  'HM.armorSelect.heavy',
};

idx.physdmgtype = {
    'crushing':   'HM.physDmgSelect.crushing',
    'hacking':    'HM.physDmgSelect.hacking',
    'puncturing': 'HM.physDmgSelect.puncturing',
};

idx.weaponskill = {
    'minimal': 'HM.weaponskillSelect.minimal',
    'low':     'HM.weaponskillSelect.low',
    'medium':  'HM.weaponskillSelect.medium',
    'high':    'HM.weaponskillSelect.high',
};

idx.saves = {
    'dodge':    'HM.saves.dodge',
    'fatigue':  'HM.saves.fatigue',
    'foa':      'HM.saves.foa',
    'fos':      'HM.saves.fos',
    'mental':   'HM.saves.mental',
    'morale':   'HM.saves.morale',
    'poison':   'HM.saves.poison',
    'physical': 'HM.saves.physical',
    'tenacity': 'HM.saves.tenacity',
    'trauma':   'HM.saves.trauma',
    'turning':  'HM.saves.turning',
    'will':     'HM.saves.will',
};

idx.itemCClass = {
    'sp':   'HM.spellpoints',
    'init': 'HM.initbonus',
    'atk':  'HM.atkbonus',
    'spd':  'HM.spdbonus',
    'spdr': 'HM.spdrbonus',
    'spdm': 'HM.spdmbonus',
};

idx.itemTypes = {
    'armor':  'HM.itemTypes.armor',
    'item':   'HM.itemTypes.item',
    'weapon': 'HM.itemTypes.weapon',
};

idx.dice = {
    '1d20': 'd20',
    '1d12': 'd12',
    '1d10': 'd10',
    '1d8':  'd8',
    '1d6':  'd6',
    '1d4':  'd4',
    '1d3':  'd3',
};

// TODO: This table is backwards. Values should be keys, keys, should be localized.
idx.range = {
    'short':   'Short',
    'medium':  'Medium (-4)',
    'long':    'Long (-6)',
    'extreme': 'Extreme (-8)',
};

idx.scale = {
    0: 'HM.custom',
    1: 'HM.scaleFull.tiny',
    2: 'HM.scaleFull.small',
    3: 'HM.scaleFull.medium',
    4: 'HM.scaleFull.large',
    5: 'HM.scaleFull.huge',
    6: 'HM.scaleFull.gigantic',
    7: 'HM.scaleFull.enormous',
    8: 'HM.scaleFull.colossal',
};

idx.spellLevels = {
    '0':  'HM.spellLevels.0',
    '1':  'HM.spellLevels.1',
    '2':  'HM.spellLevels.2',
    '3':  'HM.spellLevels.3',
    '4':  'HM.spellLevels.4',
    '5':  'HM.spellLevels.5',
    '6':  'HM.spellLevels.6',
    '7':  'HM.spellLevels.7',
    '8':  'HM.spellLevels.8',
    '9':  'HM.spellLevels.9',
    '10': 'HM.spellLevels.10',
    '11': 'HM.spellLevels.11',
    '12': 'HM.spellLevels.12',
    '13': 'HM.spellLevels.13',
    '14': 'HM.spellLevels.14',
    '15': 'HM.spellLevels.15',
    '16': 'HM.spellLevels.16',
    '17': 'HM.spellLevels.17',
    '18': 'HM.spellLevels.18',
    '19': 'HM.spellLevels.19',
    '20': 'HM.spellLevels.20',
    '21': 'HM.spellLevels.21',
};

// Images
idx.savesImg = {
    'dodge':    'icons/skills/movement/feet-winged-boots-brown.webp',
    'fatigue':  'icons/magic/symbols/question-stone-yellow.webp',
    'foa':      'icons/skills/movement/figure-running-gray.webp',
    'fos':      'icons/magic/control/buff-strength-muscle-damage.webp',
    'mental':   'icons/skills/wounds/anatomy-organ-brain-pink-red.webp',
    'morale':   'icons/skills/social/wave-halt-stop.webp',
    'poison':   'icons/skills/toxins/poison-bottle-corked-fire-green.webp',
    'physical': 'icons/skills/wounds/anatomy-bone-joint.webp',
    'tenacity': 'icons/magic/control/fear-fright-white.webp',
    'trauma':   'icons/skills/wounds/injury-face-impact-orange.webp',
    'turning':  'icons/magic/holy/prayer-hands-glowing-yellow.webp',
    'will':     'icons/magic/death/undead-skeleton-rags-fire-green.webp',
};

idx.combatImg = {
    'atk':    'icons/weapons/swords/greatsword-blue.webp',
    'ratk':   'icons/weapons/bows/shortbow-recurve-blue.webp',
    'dmg':    'icons/skills/melee/strike-sword-blood-red.webp',
    'rdmg':   'icons/weapons/ammunition/arrow-head-war-flight.webp',
    'def':    'icons/equipment/shield/heater-crystal-blue.webp',
    'cast':   'icons/weapons/wands/wand-carved-pink.webp',
    'prep':   'icons/sundries/documents/document-symbol-lightning-brown.webp',
    'unprep': 'icons/sundries/documents/blueprint-magical-brown.webp',
};

idx.defaultImg = {
    'item': 'icons/magic/symbols/question-stone-yellow.webp',
    'body': 'icons/magic/control/buff-strength-muscle-damage-red.webp',
};

export default idx;

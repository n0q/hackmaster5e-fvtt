import { HMTABLES, HMCONST, SYSTEM_ID } from '../tables/constants.js';
import { CRITTABLE } from '../tables/crits.js';
import { idx } from '../tables/dictionary.js';
import { calculateArmorDamage } from '../sys/utils.js';

export class HMChatMgr {
    constructor() { this._user = game.user.id; }

    // This is out of control. We want: getCard(dataset, options)
    async getCard({cardtype=HMCONST.CARD_TYPE.ROLL, roll, dataset, dialogResp=null, options}) {
        let cData;
        if (cardtype === HMCONST.CARD_TYPE.ROLL) {
            switch (dataset.dialog) {
                case 'dmg':
                    cData = await createDamageCard(dataset);
                    break;
                case 'atk':
                    cData = await createAttackCard(dataset);
                    break;
                case 'def':
                    cData = await createDefenseCard(dataset);
                    break;
                case 'cast':
                    cData = await createSpellCard(dataset);
                    break;
                case 'skill':
                    cData = await createSkillCard(dataset);
                    break;
                case 'crit':
                    cData = await createCritCard(dataset);
                    break;
                case 'fumble':
                    cData = await createFumbleCard(dataset);
                    break;
                case 'save':
                    cData = await createSaveCard(roll, dataset, dialogResp);
                    break;
                case 'ability':
                    cData = dialogResp.resp.save
                        ? await createSaveCard(roll, dataset, dialogResp)
                        : await createAbilityCard(roll, dataset);
                    break;
                default:
            }
        } else if (cardtype === HMCONST.CARD_TYPE.ALERT) {
            cData = await createToPAlert(dataset);
        } else if (cardtype === HMCONST.CARD_TYPE.NOTE) {
            cData = await createInitNote(dataset);
        }

        const chatData = {
            user:    this._user,
            flavor:  cData?.flavor || dialogResp?.caller?.name,
            content: cData.content,
            type:    cData?.type || CONST.CHAT_MESSAGE_TYPES.OTHER,
            whisper: cData?.whisper,
        };

        if (roll || dataset?.roll) {
            chatData.rolls    = Array.isArray(roll) ? roll : [cData?.roll || roll];
            chatData.rollMode = cData.rollMode ? cData.rollMode : game.settings.get('core', 'rollMode');
            chatData.type     = CONST.CHAT_MESSAGE_TYPES.ROLL;
            chatData.sound    = CONFIG.sounds.dice;
        }

        return {...chatData, ...options};
    }
}

function getDiceSum(roll) {
    let sum = 0;
    for (let i = 0; i < roll.terms.length; i++) {
        for (let j = 0; j < roll.terms[i]?.results?.length; j++) {
            sum += roll.terms[i].results[j].result;
        }
    }
    return sum;
}

function getSpecialMoveFlavor(resp) {
    const mods = [];
    const {specialMove, shieldHit, defense} = resp;
    const {SPECIAL} = HMCONST;
    if (specialMove === SPECIAL.AGGRESSIVE) mods.push(game.i18n.localize('HM.aggressive'));
    if (specialMove === SPECIAL.BACKSTAB) mods.push(game.i18n.localize('HM.backstab'));
    if (specialMove === SPECIAL.CHARGE2) mods.push(`${game.i18n.localize('HM.charged')} +2`);
    if (specialMove === SPECIAL.CHARGE4) mods.push(`${game.i18n.localize('HM.charged')} +4`);
    if (specialMove === SPECIAL.FLEEING) mods.push(game.i18n.localize('HM.fleeing'));
    if (specialMove === SPECIAL.GGROUND) mods.push(game.i18n.localize('EFFECT.gground'));
    if (specialMove === SPECIAL.JAB) mods.push(game.i18n.localize('HM.jab'));
    if (specialMove === SPECIAL.RDEFEND) mods.push(game.i18n.localize('HM.ranged'));
    if (specialMove === SPECIAL.SCAMPER) mods.push(game.i18n.localize('EFFECT.scamper'));
    if (specialMove === SPECIAL.SET4CHARGE) mods.push(game.i18n.localize('HM.specSelect.s4c'));
    if (specialMove === SPECIAL.WITHDRAWL) mods.push(game.i18n.localize('HM.specSelect.wdrawl'));
    if (specialMove === SPECIAL.SNAPSHOT) mods.push(game.i18n.localize('HM.specSelect.snap'));
    if (specialMove === SPECIAL.LOAD) mods.push(game.i18n.localize('HM.loading'));
    if (specialMove === SPECIAL.DRAW) mods.push(game.i18n.localize('HM.drawing'));
    if (specialMove === SPECIAL.AIM) mods.push(game.i18n.localize('HM.aiming'));
    if (defense) mods.push(game.i18n.localize('HM.defensive'));
    if (shieldHit) mods.push(game.i18n.localize('HM.blocked'));
    if (resp.dodge) mods.push(game.i18n.localize('HM.dodged'));
    if (resp.strBonus) mods.push(game.i18n.localize('HM.ability.str'));
    return mods.length ? ` (${mods.join(', ')})` : '';
}

async function saveExtendedTrauma(content, roll) {
    const rolls = [roll];
    let exContent = content;
    const context = {
        'duration': Math.max(roll.total * 5, 0),
        'special': 'HM.passed',
        'forever': false,
    };

    if (roll.total > 0) {
        context.unit    = 'HM.seconds';
        context.status  = 'HM.incapacitated';
        context.special = 'HM.failed';

        if (getDiceSum(roll) > 19) {
            let newroll = await new Roll('5d6p').evaluate({async: true});
            rolls.push(newroll);
            let flavor = `${game.i18n.localize('HM.knockout')} ${game.i18n.localize('HM.duration')}`;
            exContent += `<br> ${await newroll.render({flavor})}`;
            context.duration = newroll.total;
            context.unit     = 'HM.minutes';
            context.status   = 'HM.knockedout';
            context.special  = 'HM.critical';

            newroll = await new Roll('d20').evaluate({async: true});
            rolls.push(newroll);
            flavor = `${game.i18n.localize('HM.comatose')} ${game.i18n.localize('HM.check')}`;
            exContent += `<br> ${await newroll.render({flavor})}`;

            if (newroll.total === 20) {
                context.duration = newroll.total;
                context.unit     = 'HM.days';
                context.status   = 'HM.comatose';
                context.special  = 'HM.doublecritical';

                newroll = await new Roll('d20').evaluate({async: true});
                rolls.push(newroll);
                flavor = `${game.i18n.localize('HM.comatose')} ${game.i18n.localize('HM.duration')}`;
                exContent += `<br> ${await newroll.render({flavor})}`;
                if (newroll.total === 20) {
                    context.forever = true;
                    context.special = 'HM.goodbye';
                    context.unit    = 'HM.indefinitely';
                }
            }
        }
    }

    const template = 'systems/hackmaster5e/templates/chat/trauma.hbs';
    const label = await renderTemplate(template, context);
    return {content: label + exContent, rolls};
}

function getGMs() {
    return game.users.reduce((arr, u) => {
        if (u.isGM) arr.push(u.id);
        return arr;
    }, []);
}

async function createInitNote(dataset) {
    const template = 'systems/hackmaster5e/templates/chat/initNote.hbs';

    const content = Array.isArray(dataset)
        ? await renderTemplate(template, dataset.sort((a, b) => a.name.localeCompare(b.name)))
        : await renderTemplate(template, [dataset]);

    const whisper = dataset[0]?.hidden ? getGMs() : undefined;
    return {content, whisper};
}

async function createFumbleCard(dataset) {
    const {roll, resp} = dataset;

    const template = 'systems/hackmaster5e/templates/chat/fumble.hbs';
    const resultContent = await renderTemplate(template, {resp});

    const typeStr = resp.type ? 'HM.chatCard.rfumble' : 'HM.chatCard.mfumble';
    let flavor = game.i18n.localize(typeStr);
    flavor += resp.innate ? ` (${game.i18n.localize('HM.innate')})` : '';
    let rollContent = await roll.render({flavor});

    if (resp.comp) {
        const compFlavor = game.i18n.localize('HM.chatCard.comproll');
        rollContent += await resp.compRoll.render({flavor: compFlavor});
    }

    const content = resultContent + rollContent;
    return {content, roll};
}

async function createCritCard(dataset) {
    const {caller, roll, resp} = dataset;

    const critHitString = game.i18n.localize('HM.chatCard.critHit');
    const dmgTypeString = game.i18n.localize(idx.dmgType[resp.dmgType]);
    const rollFlavor = `${critHitString} (${dmgTypeString})`;
    const rollContent = await roll.render({flavor: rollFlavor});

    const rollIdx = CRITTABLE.rollIdx.findIndex((x) => x >= roll.total);
    const sevIdx = CRITTABLE.sevIdx.findIndex((x) => x >= resp.severity);
    const critData = {
        result: CRITTABLE[rollIdx][resp.dmgType][sevIdx],
        location: CRITTABLE[rollIdx].label,
        side: roll.total % 2,
    };

    const template = 'systems/hackmaster5e/templates/chat/crit.hbs';
    const resultContent = await renderTemplate(template, {resp, critData});
    const content = resultContent + rollContent;

    const useArmorDegredation = game.settings.get(SYSTEM_ID, 'armorDegredation');
    if (useArmorDegredation) Hooks.callAll('armorDamage', 1, game.user.id);

    return {content, roll, flavor: caller?.name};
}

async function createAttackCard(dataset) {
    const {caller, context, roll, resp} = dataset;

    if (resp?.button === 'declare') {
        const {SPECIAL} = HMCONST;
        const specialFlavor = getSpecialMoveFlavor(resp);
        const template = 'systems/hackmaster5e/templates/chat/declare.hbs';
        const content = await renderTemplate(template, {context, resp, specialFlavor, SPECIAL});
        return {content, flavor: caller.name};
    }

    let flavor = context.system.ranged.checked
        ? game.i18n.localize('HM.CHAT.ratk')
        : game.i18n.localize('HM.CHAT.matk');

    flavor += getSpecialMoveFlavor(resp);
    const rollContent = await roll.render({flavor});

    let specialRow = '';
    const sumDice = getDiceSum(roll);
    if (sumDice >=  20) { specialRow += 'Critical!';        } else
    if (sumDice === 19) { specialRow += 'Near Perfect';     } else
    if (sumDice === 1)  { specialRow += 'Potential Fumble'; }

    const template = 'systems/hackmaster5e/templates/chat/attack.hbs';
    const shake = sumDice >= 20;
    const templateData = {resp, specialRow, context, shake};
    const resultContent = await renderTemplate(template, templateData);
    const content = resultContent + rollContent;
    return {content, roll, flavor: caller.name};
}

async function createDefenseCard(dataset) {
    const {caller, context, roll, resp} = dataset;

    const flavor = game.i18n.localize('HM.CHAT.def') + getSpecialMoveFlavor(resp);
    const rollContent = await roll.render({flavor});

    let specialRow = '';
    const sumDice = getDiceSum(roll);
    if (sumDice >=  20) { specialRow += 'Perfect!';     } else
    if (sumDice === 19) { specialRow += 'Near Perfect'; } else
    if (sumDice === 18) { specialRow += 'Superior';     } else
    if (sumDice === 1)  { specialRow += 'Fumble';       }

    const dr = caller.drObj;

    const template = 'systems/hackmaster5e/templates/chat/defend.hbs';
    const templateData = {resp, dr, specialRow, context};
    const resultContent = await renderTemplate(template, templateData);
    const content = resultContent + rollContent;
    return {content, roll, flavor: caller.name};
}

async function createSaveCard(roll, dataset, dialogResp) {
    const {rollMode} = dialogResp.resp;
    let saveType = (dataset.formulaType === 'fos' || dataset.formulaType === 'foa') ? 'Feat of ' : '';
    if (dataset.ability) {
        saveType = game.i18n.localize(`HM.abilityLong.${dataset.ability.toLowerCase()}`);
    } else {
        saveType += game.i18n.localize(`HM.saves.${dataset.formulaType}`);
    }
    const flavor = `${saveType} ${game.i18n.localize('HM.save')}`;
    let content = await roll.render({flavor});

    if (dataset.formulaType === 'trauma') {
        const extended = await saveExtendedTrauma(content, roll);
        content = extended.content;
        const pool = PoolTerm.fromRolls(extended.rolls);
        roll = Roll.fromTerms([pool]);
    }
    return {content, roll, rollMode};
}

async function createSpellCard(dataset) {
    const {caller, context, roll, resp} = dataset;
    const {system} = context;

    const components = [];
    if (system.component.verbal)   { components.push('V');  }
    if (system.component.somatic)  { components.push('S');  }
    if (system.component.material) { components.push('M');  }
    if (system.component.catalyst) { components.push('C');  }
    if (system.component.divine)   { components.push('DI'); }
    resp.components = components.join(', ');

    let whisper;
    if (resp.private) {
        whisper = game.users.reduce((arr, u) => {
            if (u.isGM) arr.push(u.id);
            return arr;
        }, []);
    }

    const sLevel = game.i18n.localize(`HM.spellLevels.${system.lidx}`);
    const sType = system.divine
        ? game.i18n.localize('HM.CHAT.cspell')
        : game.i18n.localize('HM.CHAT.mspell');
    const flavor = `${sLevel} ${game.i18n.localize('HM.level')} ${sType}`;
    const rollContent = roll ? await roll.render({flavor}) : undefined;

    roll ? resp.total = roll.total : resp.flavor = flavor;
    const template = resp.button === 'declare'
        ? 'systems/hackmaster5e/templates/chat/declare.hbs'
        : 'systems/hackmaster5e/templates/chat/spell.hbs';

    let content = await renderTemplate(template, dataset);
    if (rollContent) content += rollContent;
    return {content, whisper, roll, flavor: caller.name};
}

async function createAbilityCard(roll, dataset) {
    const saveType    = game.i18n.localize(`HM.abilityLong.${dataset.ability.toLowerCase()}`);
    const flavor      = `${saveType} ${game.i18n.localize('HM.check')}`;
    const rollContent = await roll.render({flavor});

    const sumDice       = getDiceSum(roll);
    const specialRow    = sumDice === 1 ? game.i18n.localize('HM.critfail') : undefined;
    const templateData  = {specialRow};
    const template      = 'systems/hackmaster5e/templates/chat/check.hbs';
    const resultContent = await renderTemplate(template, templateData);

    const content = resultContent + rollContent;
    return {content};
}

async function createToPAlert(dataset) {
    const template = 'systems/hackmaster5e/templates/chat/top.hbs';
    const content = await renderTemplate(template, dataset);
    const flavor = dataset.context.parent.name;
    const whisper = dataset?.hidden ? getGMs() : undefined;
    return {content, flavor, whisper};
}

async function createDamageCard(dataset) {
    const {caller, context, roll, resp} = dataset;

    let flavor = context.system.ranged.checked
        ? game.i18n.localize('HM.CHAT.rdmg')
        : game.i18n.localize('HM.CHAT.mdmg');

    flavor += getSpecialMoveFlavor(resp);
    const rollContent = await roll.render({flavor});

    const useArmorDegredation = game.settings.get(SYSTEM_ID, 'armorDegredation');
    const armorDamage = useArmorDegredation ? calculateArmorDamage(roll) : 0;
    const isBeast = caller.type === 'beast';
    if (armorDamage && isBeast) Hooks.callAll('armorDamage', armorDamage, game.user.id);

    const template = 'systems/hackmaster5e/templates/chat/damage.hbs';
    const templateData = {resp, context, caller, armorDamage};
    const resultContent = await renderTemplate(template, templateData);
    const content = resultContent + rollContent;
    return {content, roll, flavor: caller.name};
}

async function createSkillCard(dataset) {
    const {caller, context, roll, resp} = dataset;
    const {rollMode, formulaType, dc} = resp;
    const {TYPE} = HMCONST.SKILL;

    const isSkill = formulaType === TYPE.SKILL || formulaType === TYPE.OPPOSED;
    let flavor = formulaType === TYPE.OPPOSED ? `${game.i18n.localize('HM.opposed')} ` : '';
    flavor += isSkill
        ? ` ${game.i18n.localize('HM.skill')}`
        : ` ${game.i18n.localize(`HM.${formulaType}`)}`;
    flavor += ` ${game.i18n.localize('HM.check')}`;

    const rollContent = await roll.render({flavor});

    let specialRow;
    if (formulaType !== 'opposed') {
        const {difficulty} = HMTABLES.skill;
        const rollIdx = difficulty(roll.total);
        const isQualified = rollIdx === -1;

        if (dc === HMCONST.SKILL.DIFF.AUTO && !isQualified) {
            specialRow = `${game.i18n.localize(idx.skillLevel[rollIdx])}
                          ${game.i18n.localize('HM.success')}`;
        } else {
            const success = !isQualified && dc - rollIdx >= 0;
            specialRow = game.i18n.localize(success ? 'HM.passed' : 'HM.failed');
        }
    }

    const specname = context.specname;
    const level = context.level[isSkill ? TYPE.SKILL : formulaType];
    const mastery = context.mastery[isSkill ? TYPE.SKILL : formulaType];
    const templateData = {dc, specialRow, formulaType, mastery, level, specname};
    const template = 'systems/hackmaster5e/templates/chat/skill.hbs';

    let content = await renderTemplate(template, templateData);
    content += rollContent;
    return {content, roll, rollMode, flavor: caller.name};
}

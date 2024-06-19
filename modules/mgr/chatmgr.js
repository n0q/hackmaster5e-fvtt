/**
 * @file Deprecated.
 * @deprecated Use chat/chat-factory.js instead.
 * Abandon all hope, ye who enter here.
 */
import { HMCONST, SYSTEM_ID } from '../tables/constants.js';
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
                case 'fumble':
                    cData = await createFumbleCard(dataset);
                    break;
                case 'save':
                    cData = await createSaveCard(roll, dataset, dialogResp);
                    break;
                default:
            }
        } else if (cardtype === HMCONST.CARD_TYPE.ALERT) {
            cData = await createToPAlert(dataset);
        }

        const chatData = {
            user:    this._user,
            flavor:  cData?.flavor || dialogResp?.caller?.name,
            content: cData.content,
            type:    cData?.type || CONST.CHAT_MESSAGE_STYLES.OTHER,
            whisper: cData?.whisper,
        };

        if (!cData.squelch && (roll || dataset?.roll)) {
            chatData.rolls    = Array.isArray(roll) ? roll : [cData?.roll || roll];
            chatData.rollMode = cData.rollMode ? cData.rollMode : game.settings.get('core', 'rollMode');
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

function getGMs() {
    return game.users.reduce((arr, u) => {
        if (u.isGM) arr.push(u.id);
        return arr;
    }, []);
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
    const content = await roll.render({flavor});

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
    const rollContent = {flavor: `${sLevel} ${game.i18n.localize('HM.level')} ${sType}`};

    let squelch = false;
    system.save.type && resp.button === 'cast'
        ? rollContent.html = await roll.render({flavor: rollContent.flavor})
        : squelch = true;

    const template = resp.button === 'declare'
        ? 'systems/hackmaster5e/templates/chat/declare.hbs'
        : 'systems/hackmaster5e/templates/chat/spell.hbs';

    const content = await renderTemplate(template, {...dataset, rollContent});
    return {content, whisper, roll, squelch, flavor: caller.name};
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

import { HMTABLES, HMCONST } from '../sys/constants.js';
import { idx } from '../sys/dictionary.js';

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
    if (specialMove === SPECIAL.SCAMPER) mods.push(game.i18n.localize('EFFECT.scamper'));
    if (specialMove === SPECIAL.SET4CHARGE) mods.push(game.i18n.localize('HM.specSelect.s4c'));
    if (specialMove === SPECIAL.WITHDRAWL) mods.push(game.i18n.localize('HM.specSelect.wdrawl'));
    if (defense) mods.push(game.i18n.localize('HM.defensive'));
    if (shieldHit) mods.push(game.i18n.localize('HM.blocked'));
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

        if (getDiceSum(roll) === 20) {
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
    const content = await renderTemplate(template, dataset);
    const whisper = dataset?.hidden ? getGMs() : undefined;
    return {content, whisper};
}

async function createAttackCard(dataset) {
    const {caller, context, roll, resp} = dataset;

    if (resp?.button === 'declare') {
        const {SPECIAL} = HMCONST;
        const template = 'systems/hackmaster5e/templates/chat/declare.hbs';
        const content = await renderTemplate(template, {context, resp, SPECIAL});
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
    const templateData = {resp, specialRow, context};
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
    const {caller, resp, context} = dataset;
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

    const template = resp.button === 'declare'
        ? 'systems/hackmaster5e/templates/chat/declare.hbs'
        : 'systems/hackmaster5e/templates/chat/spell.hbs';
    const content = await renderTemplate(template, dataset);
    return {content, whisper, flavor: caller.name};
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

    const template = 'systems/hackmaster5e/templates/chat/damage.hbs';
    const templateData = {resp, context};
    const resultContent = await renderTemplate(template, templateData);
    const content = resultContent + rollContent;
    return {content, roll, flavor: caller.name};
}

async function createSkillCard(dataset) {
    const {context, roll} = dataset;
    const {rollMode, formulaType, dc} = dataset.resp;

    const skillname = context.specname;
    const flavor = formulaType === 'opposed'
        ? `${game.i18n.localize('HM.opposed')} ${skillname} ${game.i18n.localize('HM.skillcheck')}`
        : `${skillname} ${game.i18n.localize(`HM.${formulaType}`)} ${game.i18n.localize('HM.check')}`;
    const rollContent = await roll.render({flavor});

    let specialRow;
    if (formulaType !== 'opposed') {
        const {difficulty} = HMTABLES.skill;
        if (dc === 'auto') {
            for (const key in difficulty) {
                if (roll.total + difficulty[key] > 0) continue;
                specialRow = `${game.i18n.localize(idx.skillLevel[key])}
                              ${game.i18n.localize('HM.success')}`;
                break;
            }
        } else {
            const success = roll.total + difficulty[dc] < 1;
            specialRow = success
                ? game.i18n.localize('HM.passed')
                : game.i18n.localize('HM.failed');
        }
    }

    const templateData = {dc, specialRow, formulaType};
    const template = 'systems/hackmaster5e/templates/chat/skill.hbs';
    const resultContent = await renderTemplate(template, templateData);
    const content = `${resultContent}<p>${rollContent}`;
    return {content, roll, rollMode, flavor: dataset.caller.name};
}

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
            chatData.rolls     = [cData?.roll || roll];
            chatData.rollMode = cData.rollMode ? cData.rollMode : game.settings.get('core', 'rollMode');
            chatData.type     = CONST.CHAT_MESSAGE_TYPES.ROLL;
            chatData.sound    = CONFIG.sounds.dice;
        }

        return {...chatData, ...options};
    }

    static async renderChatMessage(_app, html) {
        if (!html.find('.hm-chat-note').length) return;

        html.css('padding', '0px');
        html.find('.message-sender').text('');
        html.find('.message-metadata')[0].style.display = 'none';
        html.find('.whisper-to').remove();
        if (!game.user.isGM) html.find('.message-delete').remove();
    }
}

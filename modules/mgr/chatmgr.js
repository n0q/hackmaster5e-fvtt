import { HMTABLES, HMCONST } from '../sys/constants.js';
import { idx } from '../sys/localize.js';

/* global PoolTerm */

function getDiceSum(roll) {
    let sum = 0;
    for (let i = 0; i < roll.terms.length; i++) {
        for (let j = 0; j < roll.terms[i]?.results?.length; j++) {
            sum += roll.terms[i].results[j].result;
        }
    }
    return sum;
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

async function createAbilityCard(roll, dataset) {
    const saveType = game.i18n.localize(`HM.abilityLong.${dataset.ability.toLowerCase()}`);
    const flavor = `${saveType} ${game.i18n.localize('HM.check')}`;
    const content = await roll.render({flavor});
    return {content};
}

async function createToPAlert(dataset) {
    const template = 'systems/hackmaster5e/templates/chat/top.hbs';
    const content = await renderTemplate(template, dataset);
    const flavor = dataset.context.parent.name;
    return {content, flavor};
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
                case 'atk':
                case 'ratk':
                case 'def':
                case 'dmg':
                    cData = await this._createWeaponCard(roll, dataset, dialogResp);
                    break;
                case 'cast':
                    cData = await this._createSpellCard(dataset, dialogResp);
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
        }

        const chatData = {
            user:    this._user,
            flavor:  cData?.flavor || dialogResp?.caller?.name,
            content: cData.content,
            type:    CONST.CHAT_MESSAGE_TYPES.IC,
        };

        if (roll || dataset?.roll) {
            chatData.roll     = cData?.roll || roll;
            chatData.rollMode = cData.rollMode ? cData.rollMode : game.settings.get('core', 'rollMode');
            chatData.type     = CONST.CHAT_MESSAGE_TYPES.ROLL;
            chatData.sound    = CONFIG.sounds.dice;
        }

        return {...chatData, ...options};
    }

    async _createWeaponCard(roll, dataset, dialogResp) {
        const {caller} = dialogResp;
        const item = dialogResp.context;

        switch (dataset.dialog) {
            case 'ratk': {
                const flavor = `${game.i18n.localize('HM.ranged')}
                                ${game.i18n.localize('HM.attack')}
                                ${game.i18n.localize('HM.roll')}`;
                let content = await roll.render({flavor});

                const weaponRow = `${game.i18n.localize('HM.weapon')}:
                                <b>${item.name}</b>`;
                const speedRow  = `${game.i18n.localize('HM.speed')}:
                                <b>${item.data.data.bonus.total.spd}</b>`;
                const rangeRow  = `${game.i18n.localize('HM.range')}:
                                <b>${game.i18n.localize(idx.range[dialogResp.resp.range])}</b>`;

                let specialRow = '';
                const sumDice = getDiceSum(roll);
                if (sumDice >=  20) { specialRow += '<b>Critical!</b>';        } else
                if (sumDice === 19) { specialRow += '<b>Near Perfect</b>';     } else
                if (sumDice === 1)  { specialRow += '<b>Potential Fumble</b>'; }

                content = `${weaponRow}<br>${speedRow}<br>${rangeRow}<br>${specialRow}<br>${content}`;
                return {content};
            }

            case 'atk': {
                const flavor = `${game.i18n.localize('HM.melee')}
                                ${game.i18n.localize('HM.attack')}
                                ${game.i18n.localize('HM.roll')}`;
                let content = await roll.render({flavor});

                const weaponRow = `${game.i18n.localize('HM.weapon')}:
                                <b>${item.name}</b>`;
                const speedRow  = `${game.i18n.localize('HM.speed')}:
                                <b>${item.data.data.bonus.total.spd}</b>`;

                let specialRow = '';
                const sumDice = getDiceSum(roll);
                if (sumDice >=  20) { specialRow += '<b>Critical!</b>';        } else
                if (sumDice === 19) { specialRow += '<b>Near Perfect</b>';     } else
                if (sumDice === 1)  { specialRow += '<b>Potential Fumble</b>'; }

                content = `${weaponRow}<br>${speedRow}<br>${specialRow}<br>${content}`;
                return {content};
            }

            case 'dmg': {
                let flavor =    `${game.i18n.localize('HM.damage')}
                                 ${game.i18n.localize('HM.roll')}`;
                if (dialogResp.resp.shieldhit) {
                    flavor += ` (${game.i18n.localize('HM.blocked')})`;
                }

                let content = await roll.render({flavor});

                const weaponRow = `${game.i18n.localize('HM.weapon')}:
                                <b>${item.name}</b>`;

                content = `${weaponRow}<p>${content}`;
                return {content};
            }

            case 'def': {
                const flavor = `${game.i18n.localize('HM.defense')}
                                ${game.i18n.localize('HM.roll')}`;
                let content = await roll.render({flavor});

                const weaponRow = `${game.i18n.localize('HM.weapon')}:
                                <b>${item.name}</b>`;

                let specialRow = '';
                const sumDice = getDiceSum(roll);
                if (sumDice >=  20) { specialRow += '<b>Perfect!</b>';     } else
                if (sumDice === 19) { specialRow += '<b>Near Perfect</b>'; } else
                if (sumDice === 18) { specialRow += '<b>Superior</b>';     } else
                if (sumDice === 1)  { specialRow += '<b>Fumble</b>';       }

                const faShield = '<i class="fas fa-shield-alt"></i>';
                const dr = caller.drObj;
                const drRow = `DR: <b>${dr.armor} + ${faShield}${dr.shield}</b>`;
                content = `${weaponRow}<br>${drRow}<br>${specialRow}<br>${content}`;
                return {content};
            }
            default:
        }
    }

    async _createSpellCard(_dataset, dialogResp) {
        const {caller} = dialogResp;
        const item     = dialogResp.context;
        const {data}   = item.data;

        // Spell Components
        const components = [];
        if (data.component.verbal)   { components.push('V');  }
        if (data.component.somatic)  { components.push('S');  }
        if (data.component.material) { components.push('M');  }
        if (data.component.catalyst) { components.push('C');  }
        if (data.component.divine)   { components.push('DI'); }
        dialogResp.resp.components = components.join(', ');

        if (data.divine) {
            const prepped = Math.max(data.prepped - 1, 0);
            await item.update({'data.prepped': prepped});
        } else {
            // Spell Point Calculation
            let base = 30 + 10 * data.lidx;
            if (data.prepped < 1) { base *= 2; }
            const schedule = Math.max(0, dialogResp.resp.mod || 0);
            const sum = base + schedule;
            dialogResp.resp.sp = {value: sum, base, schedule};
            const spNew = caller.data.data.sp.value - sum;
            await caller.update({'data.sp.value': spNew});
        }

        const template = 'systems/hackmaster5e/templates/chat/spell.hbs';
        const content = await renderTemplate(template, dialogResp);
        return {content};
    }
}

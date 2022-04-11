import { HMTABLES } from '../sys/constants.js';

export default class HMChatMgr {
    constructor() { this._user = game.user.id; }

    async getCard(roll, dataset, dialogResp=null) {
        let cData;
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
                cData = await this._createSkillCard(roll, dialogResp);
                break;
            case 'save':
                cData = await this._createSaveCard(roll, dataset);
                break;
            case 'ability':
                cData = dialogResp.resp.save
                    ? await this._createSaveCard(roll, dataset)
                    : await this._createAbilityCard(roll, dataset);
                break;
            default:
        }

        const chatData = {
            user:    this._user,
            flavor:  dialogResp.caller.name,
            content: cData.content,
            type:    CONST.CHAT_MESSAGE_TYPES.IC,
        };

        if (roll) {
            chatData.roll     = roll;
            chatData.rollMode = game.settings.get('core', 'rollMode');
            chatData.type     = CONST.CHAT_MESSAGE_TYPES.ROLL;
            chatData.sound    = CONFIG.sounds.dice;
        }
        return chatData;
    }

    getDiceSum(roll) {
        let sum = 0;
        for (let i = 0; i < roll.terms.length; i++) {
            for (let j = 0; j < roll.terms[i]?.results?.length; j++) {
                sum += roll.terms[i].results[j].result;
            }
        }
        return sum;
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
                                <b>${game.i18n.localize(`HM.${dialogResp.resp.rangestr}`)}</b>`;

                let specialRow = '';
                const sumDice = this.getDiceSum(roll);
                if (sumDice >=  20) { specialRow += '<b>Critical!</b>';         } else
                if (sumDice === 19) { specialRow += '<b>Near Perfect!</b>';     } else
                if (sumDice === 1)  { specialRow += '<b>Potential Fumble!</b>'; }

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
                const sumDice = this.getDiceSum(roll);
                if (sumDice >=  20) { specialRow += '<b>Critical!</b>';         } else
                if (sumDice === 19) { specialRow += '<b>Near Perfect!</b>';     } else
                if (sumDice === 1)  { specialRow += '<b>Potential Fumble!</b>'; }

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
                const sumDice = this.getDiceSum(roll);
                if (sumDice >=  20) { specialRow += '<b>Perfect!</b>';            } else
                if (sumDice === 19) { specialRow += '<b>Near Perfect!</b>';       } else
                if (sumDice === 18) { specialRow += '<b>Superior!</b>';           } else
                if (sumDice === 1)  { specialRow += '<b>Free Second Attack!</b>'; }

                const faShield = '<i class="fas fa-shield-alt"></i>';
                const dr = caller.drObj;
                const drRow = `DR: <b>${dr.armor} + ${faShield}${dr.shield}</b>`;
                content = `${weaponRow}<br>${drRow}<br>${specialRow}<br>${content}`;
                return {content};
            }
            default:
        }
    }

    async _createSkillCard(roll, dialogResp) {
        const item = dialogResp.context;
        const {data} = item.data;

        let skillname = game.i18n.localize(item.name);
        if (data.specialty.checked && data.specialty.value) {
            skillname += ` (${data.specialty.value})`;
        }

        let flavor = `${skillname} ${game.i18n.localize('HM.skillcheck')}`;
        if (dialogResp.resp.opposed) flavor = `${game.i18n.localize('HM.opposed')} ${flavor}`;
        let content = await roll.render({flavor});

        if (!dialogResp.resp.opposed) {
            const {difficulty} = HMTABLES.skill;
            for (const key in difficulty) {
                if (roll.total + difficulty[key] > 0) continue;
                content = `${game.i18n.localize(key)} ${game.i18n.localize('HM.success')} <p>${content}`;
                break;
            }
        }
        return {content};
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

    async _createSaveCard(roll, dataset) {
        let saveType = (dataset.formulaType === 'fos' || dataset.formulaType === 'foa') ? 'Feat of ' : '';
        if (dataset.ability) {
            saveType = game.i18n.localize(`HM.abilityLong.${dataset.ability.toLowerCase()}`);
        } else {
            saveType += game.i18n.localize(`HM.saves.${dataset.formulaType}`);
        }
        const flavor = `${saveType} ${game.i18n.localize('HM.save')}`;
        const content = await roll.render({flavor});
        return {content};
    }

    async _createAbilityCard(roll, dataset) {
        const saveType = game.i18n.localize(`HM.abilityLong.${dataset.ability.toLowerCase()}`);
        const flavor = `${saveType} ${game.i18n.localize('HM.check')}`;
        const content = await roll.render({flavor});
        return {content};
    }
}

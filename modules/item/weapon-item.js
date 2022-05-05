import { HMTABLES, HMCONST } from '../sys/constants.js';
import { HMItem } from './item.js';
import { HMChatMgr } from '../mgr/chatmgr.js';
import { HMDialogMgr } from '../mgr/dialogmgr.js';
import { HMRollMgr } from '../mgr/rollmgr.js';

export class HMWeaponItem extends HMItem {
    prepareBaseData() {
        super.prepareBaseData();
    }

    prepareDerivedData() {
        super.prepareDerivedData();
        if (!this.actor?.data) return;

        const actorData   = this.actor.data;
        const itemData    = this.data.data;

        const {jab, ranged} = itemData;
        const isCharacter = actorData.type === 'character';
        const armors      = [];
        const shields     = [];
        const armor       = {};
        const shield      = {};
        const defItems    = actorData.items.filter((a) => a.type === 'armor'
                                                       && a.invstate === 'equipped');

        if (itemData.innate) itemData.state = HMCONST.ITEM_STATE.INNATE;
        // HACK: This belongs in item-sheet.js, which needs a refactor.
        const {reach} = this.data.data;
        const offset = this.parent.data.data.bonus.total.reach || 0;
        itemData.adjReach = Math.max(reach + offset, 0) || 0;

        // Splitting armor and shields for now, so we can manage stances later.
        for (let i = 0; i < defItems.length; i++) {
            const defItem = defItems[i];
            const defData = defItem.data.data;
            // Without having finer control over prepData order, we must force a prep here.
            defItem.prepareData({setBonus: false});
            defData.shield.checked ? shields.push(defItem) : armors.push(defItem);
        }

        const {bonus}   = itemData;

        // Migration target.
        const qual      = this.quality;
        bonus.base.atk  = qual.atk;
        bonus.base.def  = qual.def;
        bonus.base.dmg  = qual.dmg;
        delete bonus.qual;

        const cclass    = {};
        const misc      = {};
        const race      = {};
        const stats     = {};
        const classData = actorData.data.bonus.class;
        const miscData  = actorData.data.bonus.misc;
        const statsData = actorData.data.bonus.stats;
        const raceData  = actorData.data.bonus.race;

        const spec      = {};
        const profTable = HMTABLES.weapons.noprof;
        const wSkill    = itemData.skill;
        const profItem  = actorData.items.find((a) => {
            return a.type === 'proficiency' && a.name === itemData.proficiency;
        });

        let j = 0;
        for (const key in bonus.total) {
            const profBonus = profItem ? profItem.data.data.bonus?.[key] || 0
                                       : profTable.table[wSkill] * profTable.vector[j++];
            spec[key]   = profBonus || 0;
            cclass[key] = classData?.[key] || 0;
            misc[key]   = miscData?.[key] || 0;
            race[key]   = raceData?.[key] || 0;
            stats[key]  = statsData?.[key] || 0;

            // Explicitly allowing multiple armor/shields because we don't support accesories yet.
            for (let i = 0; i < armors.length; i++)  {
                const armorData = armors[i].data.data.bonus.total;
                armor[key] = (armor[key] || 0) + (armorData[key] || 0);
            }
            for (let i = 0; i < shields.length; i++)  {
                const shieldData = shields[i].data.data.bonus.total;
                shield[key] = (shield[key] || 0) + (shieldData[key] || 0);
            }
        }

        if (ranged.checked) {
            // TODO: Provide flag to use strength damage or not.
            stats.dmg = 0;
            cclass.spd = Math.min(cclass.spd, classData?.spdr || cclass.spd);
        } else {
            cclass.spd = Math.min(cclass.spd, classData?.spdm || cclass.spd);
        }

        // TODO: Build a new data.data.bonus rather than clean the old one.
        Object.values(armor).every((a) => a === 0)  ? delete bonus.armor  : bonus.armor  = armor;
        Object.values(shield).every((a) => a === 0) ? delete bonus.shield : bonus.shield = shield;
        Object.values(misc).every((a) => a === 0)   ? delete bonus.misc   : bonus.misc   = misc;

        if (isCharacter) {
            Object.values(stats).every((a) => a === 0)  ? delete bonus.stats : bonus.stats = stats;
            Object.values(cclass).every((a) => a === 0) ? delete bonus.class : bonus.class = cclass;
            Object.values(race).every((a) => a === 0)   ? delete bonus.race  : bonus.race  = race;
            Object.values(spec).every((a) => a === 0)   ? delete bonus.spec  : bonus.spec  = spec;
        }

        Object.keys(bonus.total).forEach((key) => {
            let sum = -bonus.total[key];
            for (const state in bonus) { sum += bonus[state][key]; }
            bonus.total[key] = sum;
        });
        const {maxspd} = HMTABLES.weapons.scale[itemData.scale];
        bonus.total.spd = Math.max(maxspd, bonus.total.spd);
        if (jab.checked) {
            const jspd = bonus.total.spd + (bonus.base.jspd - bonus.base.spd);
            bonus.total.jspd = Math.max(maxspd, jspd);
        }
    }

    get capabilities() {
        const {data} = this.data;
        const capList = [HMCONST.SPECIAL.STANDARD];
        if (data.jab.checked) capList.push(HMCONST.SPECIAL.JAB);
        return capList;
    }

    // TODO: This needs a refactor, but it's too soon to do so. We should
    // give this a second look after combat variants are introduced.
    static async rollAttack({weapon, caller}={}) {
        let actor;
        let token;
        if (!caller) {
            [token] = canvas.tokens.controlled;
            actor   = token.actor;
        } else if (caller.isToken) {
            actor   = caller;
            token   = caller.token;
        } else {
            actor = caller;
        }
        if (!token && !actor) return;

        const opt = {isCombatant: false};
        const comData = {};
        const {active} = game.combats;
        if (active) {
            comData.round = active.round;
            comData.combatant = token
                ? active.getCombatantByToken(token.id)
                : active.getCombatantByActor(actor.id);
            comData.initiative = comData.combatant?.initiative;
            opt.isCombatant    = Number.isInteger(comData.initiative) && comData.round > 0;
        }

        const dialog = 'atk';
        const formulaType = 'standard';
        const dataset = {dialog, formulaType, itemId: weapon};

        const dialogMgr = new HMDialogMgr();
        const dialogResp = await dialogMgr.getDialog(dataset, actor, opt);

        const ranged = dialogResp.context.data.data.ranged.checked;
        if (ranged) dataset.dialog = 'ratk';

        const rollMgr = new HMRollMgr();
        const roll = await rollMgr.getRoll(dataset, dialogResp);

        if (dialogResp.resp.advance) {
            const spd = Number(dialogResp.resp.advance);
            const newInit = comData.initiative > comData.round
                ? comData.initiative + spd
                : comData.round + spd;
            active.setInitiative(comData.combatant.id, newInit);
        }

        const chatMgr = new HMChatMgr();
        const card = await chatMgr.getCard({roll, dataset, dialogResp});
        await ChatMessage.create(card);
    }
}

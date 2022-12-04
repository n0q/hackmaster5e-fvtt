import { MODULE_ID, HMCONST, HMTABLES } from '../sys/constants.js';
import { CRITTABLE } from '../sys/crits.js';
import { HMItem, advanceClock, setStatusEffectOnToken, unsetStatusEffectOnToken } from './item.js';
import { HMChatMgr } from '../mgr/chatmgr.js';
import { HMDialogMgr } from '../mgr/dialogmgr.js';
import { HMRollMgr } from '../mgr/rollmgr.js';

function getCaller(caller=null) {
    let actor;
    let token;
    if (!caller) {
        [token] = canvas.tokens.controlled;
        actor   = token?.actor;
    } else if (caller.isToken) {
        actor   = caller;
        token   = caller.token;
    } else {
        actor = caller;
    }
    return {actor, token};
}

export class HMWeaponItem extends HMItem {
    get minspd() {
        const {system} = this;
        const ranged = system.ranged.checked;
        if (ranged) return HMTABLES.weapons.ranged.minspd(system.ranged.timing);
        return HMTABLES.weapons.scale[system.scale].minspd;
    }

    prepareBaseData() {
        super.prepareBaseData();
    }

    prepareDerivedData() {
        super.prepareDerivedData();
        if (!this.actor?.system) return;

        const actorData   = this.actor.system;
        const itemData    = this.system;

        const {jab, ranged} = itemData;
        const isCharacter = this.actor.type === 'character';
        const armors      = [];
        const shields     = [];
        const armor       = {};
        const shield      = {};
        const defItems    = this.actor.items.filter((a) => a.type === 'armor'
                                                    && a.invstate === 'equipped');

        if (itemData.innate) itemData.state = HMCONST.ITEM_STATE.INNATE;
        // TODO: Some of this can be relocated to weapon-item-sheet.js.
        const {reach} = this.system;
        const offset = this.parent.system.bonus.total.reach || 0;
        itemData.adjReach = Math.max(reach + offset, 0) || 0;

        // Splitting armor and shields for now, so we can manage stances later.
        for (let i = 0; i < defItems.length; i++) {
            const defItem = defItems[i];
            const defData = defItem.system;
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
        const encumb    = {};
        const misc      = {};
        const race      = {};
        const stats     = {};
        const state     = {};
        const classData  = actorData.bonus.class;
        const encumbData = actorData.bonus.encumb;
        const miscData   = actorData.bonus.misc;
        const statsData  = actorData.bonus.stats;
        const raceData   = actorData.bonus.race;
        const stateData  = actorData.bonus.state;

        const spec      = {};
        const profTable = HMTABLES.weapons.noprof;
        const wSkill    = itemData.skill;
        const profItem  = this.actor.items.find((a) => {
            return a.type === 'proficiency' && a.name === itemData.proficiency;
        });

        const talent = {};
        const talentItem = this.actor.itemTypes.talent.find(
            (a) => a.system.type === HMCONST.TALENT.WEAPON && a.name === itemData.proficiency,
        );
        const talentData = talentItem ? talentItem.system.bonus : undefined;

        let j = 0;
        for (const key in bonus.total) {
            const profBonus = profItem ? profItem.system.bonus?.[key] || 0
                                       : profTable.table[wSkill] * profTable.vector[j++];
            spec[key]   = profBonus || 0;
            cclass[key] = classData?.[key] || 0;
            encumb[key]  = encumbData?.[key] || 0;
            misc[key]   = miscData?.[key] || 0;
            race[key]   = raceData?.[key] || 0;
            stats[key]  = statsData?.[key] || 0;
            state[key]  = stateData?.[key] || 0;
            talent[key] = talentData?.[key] || 0;

            // Explicitly allowing multiple armor/shields because we don't support accesories yet.
            for (let i = 0; i < armors.length; i++)  {
                const armorData = armors[i].system.bonus.total;
                armor[key] = (armor[key] || 0) + (armorData[key] || 0);
            }
            for (let i = 0; i < shields.length; i++)  {
                const shieldData = shields[i].system.bonus.total;
                shield[key] = (shield[key] || 0) + (shieldData[key] || 0);
            }
        }

        if (ranged.checked) {
            stats.dmg = 0;
            cclass.spd = Math.min(cclass.spd, classData?.spdr || cclass.spd);
        } else {
            cclass.spd = Math.min(cclass.spd, classData?.spdm || cclass.spd);
        }

        // TODO: Build a new system.bonus rather than clean the old one.
        Object.values(armor).every((a) => a === 0)  ? delete bonus.armor  : bonus.armor  = armor;
        Object.values(shield).every((a) => a === 0) ? delete bonus.shield : bonus.shield = shield;
        Object.values(misc).every((a) => a === 0)   ? delete bonus.misc   : bonus.misc   = misc;
        Object.values(state).every((a) => a === 0)   ? delete bonus.state : bonus.state  = state;

        if (isCharacter) {
            Object.values(stats).every((a) => a === 0)  ? delete bonus.stats  : bonus.stats = stats;
            Object.values(encumb).every((a) => a === 0) ? delete bonus.encumb : bonus.encumb = encumb;
            Object.values(cclass).every((a) => a === 0) ? delete bonus.class  : bonus.class = cclass;
            Object.values(race).every((a) => a === 0)   ? delete bonus.race   : bonus.race = race;
            Object.values(spec).every((a) => a === 0)   ? delete bonus.spec   : bonus.spec = spec;
            Object.values(talent).every((a) => a === 0) ? delete bonus.talent : bonus.talent = talent;
        }

        Object.keys(bonus.total).forEach((key) => {
            let sum = -bonus.total[key];
            for (const state in bonus) { sum += bonus[state][key]; }
            bonus.total[key] = sum;
        });

        bonus.total.spd = Math.max(this.minspd, bonus.total.spd);
        if (jab.checked) {
            const jspd = bonus.total.spd + (bonus.base.jspd - bonus.base.spd);
            bonus.total.jspd = Math.max(this.minspd, jspd);
        }
    }

    get capabilities() {
        const {SPECIAL} = HMCONST;
        const {caps, jab, ranged} = this.system;
        const capsArr = Object.keys(caps).filter((key) => caps[key].checked).map((x) => Number(x));
        capsArr.push(...HMTABLES.weapons.caps.std);
        if (jab.checked) capsArr.push(SPECIAL.JAB);
        ranged.checked ? capsArr.push(...HMTABLES.weapons.caps.ranged)
                       : capsArr.push(...HMTABLES.weapons.caps.melee);

        return capsArr.sort();
    }

    get canBackstab() {
        const {SPECIAL} = HMCONST;
        const {system} = this;
        return system.caps?.[SPECIAL.BACKSTAB]?.checked || false;
    }

    async onClick(ev) {
        ev.preventDefault();
        const {dataset} = ev.currentTarget;
        if (dataset.op === 'setFlag') await this.actor.setFlag(MODULE_ID, dataset.key, dataset.value);
        if (dataset.op === 'setProperty') {
            const {key} = dataset;
            const value = dataset.dtype === 'Number' ? Number(dataset.value) : dataset.value;
            this.update({[key]: value});
        }
        if (dataset.redraw) this.actor.getActiveTokens().forEach((t) => t.drawReach());
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
        const dataset = {dialog, itemId: weapon};
        const dialogMgr = new HMDialogMgr();
        const dialogResp = await dialogMgr.getDialog(dataset, actor, opt);

        const {specialMove, defense} = dialogResp.resp;
        const {atk} = HMTABLES.formula;
        dataset.formula = specialMove < 16 ? atk[HMCONST.SPECIAL.STANDARD] : atk[specialMove];

        const {SPECIAL} = HMCONST;

        if (active && opt.isCombatant) {
            // Full Parry, Defensive Fighting exclusivity.
            specialMove === SPECIAL.FULLPARRY
                ? setStatusEffectOnToken(comData, 'fullparry', dialogResp.resp.advance)
                : await unsetStatusEffectOnToken(comData, 'fullparry');

            const dList = Object.values(HMTABLES.effects.defense);
            if (defense) dList.splice(defense -1, 1);
            for (let i=0; i < dList.length; i++) await unsetStatusEffectOnToken(comData, dList[i]);
            if (defense) await setStatusEffectOnToken(comData, HMTABLES.effects.defense[defense]);
        }

        if (dialogResp.resp.button !== 'declare') {
            const rollMgr = new HMRollMgr();
            dataset.roll = await rollMgr.getRoll(dataset, dialogResp);
        }

        dataset.resp = dialogResp.resp;
        dataset.context = dialogResp.context;
        dataset.caller = actor;

        const chatMgr = new HMChatMgr();
        const card = await chatMgr.getCard({dataset});
        await ChatMessage.create(card);

        if (dialogResp.resp.advance) await advanceClock(comData, dialogResp, true);

        if (opt.isCombatant) {
            unsetStatusEffectOnToken(comData, 'gground');
            unsetStatusEffectOnToken(comData, 'scamper');

            if (specialMove === SPECIAL.AGGRESSIVE) {
                setStatusEffectOnToken(comData, 'aggressive');
            }

            if (specialMove === SPECIAL.CHARGE2 || specialMove === SPECIAL.CHARGE4) {
                setStatusEffectOnToken(comData, 'charge', 5);
            }
        }
    }

    static async rollDamage({weapon, caller}={}) {
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

        const dialog = 'dmg';
        const dataset = {dialog, itemId: weapon};

        const dialogMgr = new HMDialogMgr();
        const dialogResp = await dialogMgr.getDialog(dataset, actor);

        const rollMgr = new HMRollMgr();
        dataset.roll = await rollMgr.getRoll(dataset, dialogResp);
        dataset.resp = dialogResp.resp;
        dataset.context = dialogResp.context;
        dataset.caller = actor;

        const chatMgr = new HMChatMgr();
        const card = await chatMgr.getCard({dataset});
        await ChatMessage.create(card);
    }

    static async rollCrit({caller} = {}) {
        const {actor} = getCaller(caller);

        const dataset = {dialog : 'crit', caller: actor};
        const dialogMgr = new HMDialogMgr();
        const dialogResp = await dialogMgr.getDialog(dataset, actor);
        const {resp} = dialogResp;

        dataset.formula = CRITTABLE.formula(resp.atkSize, resp.defSize);
        dataset.resp = resp;

        const rollMgr = new HMRollMgr();
        dataset.roll = await rollMgr.getRoll(dataset, dialogResp);

        const chatMgr = new HMChatMgr();
        const card = await chatMgr.getCard({dataset});
        await ChatMessage.create(card);
    }

    static async rollDefend({weapon, caller}={}) {
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

        const dialog = 'def';
        const dataset = {dialog, itemId: weapon};

        const dialogMgr = new HMDialogMgr();
        const dialogResp = await dialogMgr.getDialog(dataset, actor);
        dataset.formula = HMTABLES.formula.def[dialogResp.resp.specialMove];
        const {resp} = dialogResp;

        if (resp.dodge) {
            resp.dodge = resp.specialMove === HMCONST.SPECIAL.RDEFEND
                ? Math.max(actor.getAbilityBonus('dex', 'def'), 0)
                : 1;
        }

        const rollMgr = new HMRollMgr();
        dataset.roll = await rollMgr.getRoll(dataset, dialogResp);
        dataset.resp = dialogResp.resp;
        dataset.context = dialogResp.context;
        dataset.caller = actor;

        const chatMgr = new HMChatMgr();
        const card = await chatMgr.getCard({dataset});
        await ChatMessage.create(card);

        if (opt.isCombatant) {
            unsetStatusEffectOnToken(comData, 'aggressive');

            if (dialogResp.resp.specialMove === HMCONST.SPECIAL.GGROUND) {
                setStatusEffectOnToken(comData, 'gground');
            }

            if (dialogResp.resp.specialMove === HMCONST.SPECIAL.SCAMPER) {
                setStatusEffectOnToken(comData, 'scamper');
            }
        }
    }

    static updateItem(...args) {
        const item = args[0];
        if (item.type !== 'weapon' || !item.actor) return;
        item.actor.getActiveTokens().forEach((x) => x.drawReach());
    }
}

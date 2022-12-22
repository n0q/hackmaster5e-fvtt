import { MODULE_ID, HMCONST, HMTABLES } from '../tables/constants.js';
import { CRITTABLE } from '../tables/crits.js';
import { HMItem, advanceClock, setStatusEffectOnToken, unsetStatusEffectOnToken } from './item.js';
import { HMChatMgr } from '../mgr/chatmgr.js';
import { HMDialogFactory } from '../dialog/dialog-factory.js';
import { transformDamageFormula } from '../sys/utils.js';
import { HMSocket, SOCKET_TYPES } from '../sys/sockets.js';

function fromCaller(caller=null) {
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

    // Last resort
    const smartSelect = game.settings.get(MODULE_ID, 'smartSelect');
    if (!actor && !game.user.isGM && game.user.character && smartSelect) {
        actor = game.user.character;
        [token] = actor.getActiveTokens();
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
        const {mod} = this.system.bonus;
        Object.keys(mod).forEach((key) => { if (!mod[key]) mod[key] = 0; });
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
        const talentItem  = this.actor.itemTypes.talent.find(
            (a) => a.system.type === HMCONST.TALENT.WEAPON && a.name === itemData.proficiency,
        );

        if (itemData.innate) itemData.state = HMCONST.ITEM_STATE.INNATE;
        // TODO: Some of this can be relocated to weapon-item-sheet.js.
        const {reach} = this.system;
        let offset = this.parent.system.bonus.total.reach || 0;
        if (talentItem) offset += (talentItem.system.bonus.reach || 0);
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

        if (dataset.redraw) {
            this.actor.getActiveTokens().forEach((t) => {
                t.drawReach();
                HMSocket.emit(SOCKET_TYPES.DRAW_REACH, t.id);
            });
        }
    }

    // TODO: This needs a refactor, but it's too soon to do so. We should
    // give this a second look after combat variants are introduced.
    static async rollAttack({weapon, caller}={}) {
        const {actor, token} = fromCaller(caller);
        if (!actor && !token) return;

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
        const dialogResp = await HMDialogFactory(dataset, actor, opt);
        const {context, resp} = dialogResp;

        const {SPECIAL} = HMCONST;
        const {specialMove, defense} = resp;

        // Full Parry, Defensive Fighting exclusivity.
        if (active && opt.isCombatant) {
            specialMove === SPECIAL.FULLPARRY
                ? setStatusEffectOnToken(comData, 'fullparry', resp.advance)
                : await unsetStatusEffectOnToken(comData, 'fullparry');

            const dList = Object.values(HMTABLES.effects.defense);
            if (defense) dList.splice(defense -1, 1);
            dList.map((sfx) => unsetStatusEffectOnToken(comData, sfx));
            if (defense) setStatusEffectOnToken(comData, HMTABLES.effects.defense[defense]);
        }

        if (dialogResp.resp.button !== 'declare') {
            const {atk} = HMTABLES.formula;
            const formula = specialMove < 16 ? atk[SPECIAL.STANDARD] : atk[specialMove];
            const rollContext = {resp, ...context.system};
            dataset.roll = await new Roll(formula, rollContext).evaluate({async: true});
        }

        dataset.resp = resp;
        dataset.context = context;
        dataset.caller = actor;

        const chatMgr = new HMChatMgr();
        const card = await chatMgr.getCard({dataset});
        await ChatMessage.create(card);
        if (resp.advance) await advanceClock(comData, dialogResp, true);

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
        const {actor} = fromCaller(caller);
        if (!actor) return;

        const dialog = 'dmg';
        const dataset = {dialog, itemId: weapon};
        const dialogResp = await HMDialogFactory(dataset, actor);
        const {context, resp} = dialogResp;

        const {SPECIAL, FORMULA_MOD} = HMCONST;
        const {autoFormula, defense, formulaType, specialMove} = resp;
        const formula = HMTABLES.formula.dmg[formulaType];

        // Formula transform
        const opSet = new Set();
        if (specialMove === SPECIAL.JAB && autoFormula) opSet.add(FORMULA_MOD.HALVE);    else
        if (specialMove === SPECIAL.BACKSTAB)           opSet.add(FORMULA_MOD.BACKSTAB); else
        if (specialMove === SPECIAL.FLEEING)            opSet.add(FORMULA_MOD.BACKSTAB); else
        if (specialMove === SPECIAL.SET4CHARGE)         opSet.add(FORMULA_MOD.DOUBLE);
        if (defense)                                    opSet.add(FORMULA_MOD.NOPENETRATE);

        const rollContext = {resp, ...context.system};
        rollContext.bonus.total.back = actor.system.bonus.total.back;

        const r = new Roll(formula, rollContext);
        const terms = transformDamageFormula(r.terms, opSet);
        dataset.roll = await Roll.fromTerms(terms).evaluate({async: true});

        dataset.resp = resp;
        dataset.context = context;
        dataset.caller = actor;

        const chatMgr = new HMChatMgr();
        const card = await chatMgr.getCard({dataset});
        await ChatMessage.create(card);
    }

    static async rollCrit({caller} = {}) {
        const {actor} = fromCaller(caller);

        const dataset = {dialog : 'crit', caller: actor};
        const dialogResp = await HMDialogFactory(dataset, actor);
        const {resp} = dialogResp;
        dataset.resp = resp;

        const formula = CRITTABLE.formula(resp.atkSize, resp.defSize);
        dataset.roll = await new Roll(formula).evaluate({async: true});

        const chatMgr = new HMChatMgr();
        const card = await chatMgr.getCard({dataset});
        await ChatMessage.create(card);
    }

    static async rollDefend({weapon, caller}={}) {
        const {actor, token} = fromCaller(caller);
        if (!actor && !token) return;

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
        const dialogResp = await HMDialogFactory(dataset, actor);
        const {context, resp} = dialogResp;

        if (resp.dodge) {
            resp.dodge = resp.specialMove === HMCONST.SPECIAL.RDEFEND
                ? Math.max(actor.getAbilityBonus('dex', 'def'), 0)
                : 1;
        }

        const formula = HMTABLES.formula.def[resp.specialMove];
        const rollContext = {resp, ...context.system};
        dataset.roll = await new Roll(formula, rollContext).evaluate({async: true});

        dataset.resp = resp;
        dataset.context = context;
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

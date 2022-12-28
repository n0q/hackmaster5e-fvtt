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
    prepareBaseData() {
        super.prepareBaseData();
        const {total, base, mod} = this.system.bonus;

        const {quality} = this;
        Object.assign(base, {atk: 0, def: 0, dmg: 0});
        Object.keys(mod).forEach((key) => { if (!mod[key]) mod[key] = 0; });
        this.system.bonus = {total, base, quality, mod};
        const {INNATE} = HMCONST.ITEM_STATE;
        if (this.system.state !== INNATE && this.system.innate) this.update({'system.state': INNATE});
    }

    prepareDerivedData() {
        super.prepareDerivedData();
        if (!this.actor?.system) return;

        const {bonus} = this.system;
        const {total} = bonus;
        Object.keys(total).forEach((stat) => {
            total[stat] = Object.keys(bonus)
                                .filter((vector) => vector !== 'mod')
                                .reduce((sum, vector) => sum + (bonus[vector][stat] || 0),
                                    -total[stat] || 0);
        });
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
        const {addStrBonus, autoFormula, defense, formulaType, specialMove} = resp;
        const formula = HMTABLES.formula.dmg[formulaType];

        const getDerivedDamageBonus = (strDmg, totalDmg, checked) => {
            if (checked && strDmg < 0)  return {dmg: totalDmg - strDmg};
            if (!checked && strDmg > 0) return {dmg: totalDmg - strDmg};
            return {dmg: totalDmg};
        };

        const wDmg = context.system.bonus.total.dmg;
        const actorDmg = actor.getAbilityBonus('str', 'dmg');
        const derived = getDerivedDamageBonus(actorDmg, wDmg, addStrBonus);

        // Formula transform
        const opSet = new Set();
        if (specialMove === SPECIAL.JAB && autoFormula) opSet.add(FORMULA_MOD.HALVE);    else
        if (specialMove === SPECIAL.BACKSTAB)           opSet.add(FORMULA_MOD.BACKSTAB); else
        if (specialMove === SPECIAL.FLEEING)            opSet.add(FORMULA_MOD.BACKSTAB); else
        if (specialMove === SPECIAL.SET4CHARGE)         opSet.add(FORMULA_MOD.DOUBLE);
        if (defense)                                    opSet.add(FORMULA_MOD.NOPENETRATE);

        const rollContext = {resp, derived, ...context.system};
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

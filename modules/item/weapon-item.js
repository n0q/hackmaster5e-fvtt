import { SYSTEM_ID, HMCONST, HMTABLES } from '../tables/constants.js';
import { CRITTABLE } from '../tables/crits.js';
import { FUMBLETABLE } from '../tables/fumbles.js';
import { HMItem, advanceClock, setStatusEffectOnToken, unsetStatusEffectOnToken } from './item.js';
import { HMChatMgr } from '../mgr/chatmgr.js';
import { HMChatFactory, CHAT_TYPE } from '../chat/chat-factory.js';
import { HMDialogFactory } from '../dialog/dialog-factory.js';
import { transformDamageFormula } from '../sys/utils.js';
import { HMSocket, SOCKET_TYPES } from '../sys/sockets.js';

function fromCaller(caller = null) {
    let actor;
    let token;
    if (!caller) {
        [token] = canvas.tokens.controlled;
        actor = token?.actor;
    } else if (caller.isToken) {
        actor = caller;
        token = caller.token;
    } else {
        actor = caller;
    }

    // Last resort
    const smartSelect = game.settings.get(SYSTEM_ID, 'smartSelect');
    if (!actor && !game.user.isGM && game.user.character && smartSelect) {
        actor = game.user.character;
        [token] = actor.getActiveTokens();
    }
    return { actor, token };
}

function getDerivedDamageBonus(actor, context, running) {
    const wBonus = context.system.bonus.total.dmg;
    const { mechanical } = context.system.ranged;
    if (mechanical) return { dmg: wBonus };

    const strBonus = actor.getAbilityBonus('str', 'dmg');
    if (running && strBonus < 0) return { dmg: wBonus - strBonus };
    if (!running && strBonus > 0) return { dmg: wBonus - strBonus };
    return { dmg: wBonus };
}

export class HMWeaponItem extends HMItem {
    prepareBaseData() {
        super.prepareBaseData();
        const { total, base, mod } = this.system.bonus;

        const { quality } = this;
        Object.assign(base, { atk: 0, def: 0, dmg: 0 });
        Object.keys(mod).forEach((key) => { if (!mod[key]) mod[key] = 0; });
        this.system.bonus = { total, base, quality, mod };
    }

    prepareDerivedData() {
        super.prepareDerivedData();
        if (!this.actor?.system) return;

        const { bonus } = this.system;
        const { total } = bonus;
        Object.keys(total).forEach((stat) => {
            total[stat] = Object.keys(bonus)
                .filter((vector) => vector !== 'mod')
                .reduce((sum, vector) => sum + (bonus[vector][stat] || 0),
                    -total[stat] || 0);
        });
    }

    get capabilities() {
        const { SPECIAL } = HMCONST;
        const { caps, jab, ranged } = this.system;
        const capsArr = Object.keys(caps).filter((key) => caps[key].checked).map((x) => Number(x));
        capsArr.push(...HMTABLES.weapons.caps.std);
        if (jab.checked) capsArr.push(SPECIAL.JAB);
        ranged.checked ? capsArr.push(...HMTABLES.weapons.caps.ranged)
            : capsArr.push(...HMTABLES.weapons.caps.melee);

        return capsArr.sort();
    }

    get canBackstab() {
        const { SPECIAL } = HMCONST;
        const { system } = this;
        return system.caps?.[SPECIAL.BACKSTAB]?.checked || false;
    }

    async onClick(ev) {
        ev.preventDefault();
        const { dataset } = ev.currentTarget;
        if (dataset.op === 'setFlag') await this.actor.setFlag(SYSTEM_ID, dataset.key, dataset.value);
        if (dataset.op === 'setProperty') {
            const { key } = dataset;
            const value = dataset.dtype === 'Number' ? Number(dataset.value) : dataset.value;
            this.update({ [key]: value });
        }

        if (dataset.redraw) {
            this.actor.getActiveTokens().forEach((t) => {
                t.drawReach();
                HMSocket.emit(SOCKET_TYPES.DRAW_REACH, t.id);
            });
        }
    }

    // TODO: Refactor
    static async rollAttack({ weapon, caller } = {}) {
        const { actor, token } = fromCaller(caller);
        if (!actor && !token) return;

        const opt = { isCombatant: false };
        const comData = {};
        const { active } = game.combats;
        if (active) {
            comData.round = active.round;
            comData.combatant = token
                ? active.getCombatantByToken(token.id)
                : active.getCombatantByActor(actor.id);
            comData.initiative = comData.combatant?.initiative;
            opt.isCombatant = Number.isInteger(comData.initiative) && comData.round > 0;
        }

        const dialog = 'atk';
        const dataset = { dialog, itemId: weapon };
        const dialogResp = await HMDialogFactory(dataset, actor, opt);
        const { context, resp } = dialogResp;

        const { SPECIAL } = HMCONST;
        const { specialMove, button, defense } = resp;

        if (active && opt.isCombatant) {
            if (specialMove === SPECIAL.RESET) {
                await advanceClock(comData, dialogResp, true);
                return;
            }

            // Full Parry, Defensive Fighting exclusivity.
            specialMove === SPECIAL.FULLPARRY
                ? setStatusEffectOnToken(comData, 'fullparry', resp.advance)
                : await unsetStatusEffectOnToken(comData, 'fullparry');

            const dList = Object.values(HMTABLES.effects.defense);
            if (defense) dList.splice(defense - 1, 1);
            dList.map((sfx) => unsetStatusEffectOnToken(comData, sfx));
            if (defense) setStatusEffectOnToken(comData, HMTABLES.effects.defense[defense]);
        }

        if (button !== 'declare') {
            const { atk } = HMTABLES.formula;
            const formula = specialMove < 16 ? atk[SPECIAL.STANDARD] : atk[specialMove];
            const rollContext = { resp, ...context.system };
            dataset.roll = await new Roll(formula, rollContext).evaluate();
        }

        dataset.resp = resp;
        dataset.context = context;
        dataset.caller = actor;

        const chatMgr = new HMChatMgr();
        const card = await chatMgr.getCard({ dataset });
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

    static async rollDamage({ weapon, caller } = {}) {
        const { actor } = fromCaller(caller);
        if (!actor) return;

        const dialog = 'dmg';
        const dataset = { dialog, itemId: weapon };
        const dialogResp = await HMDialogFactory(dataset, actor);
        const { context, resp } = dialogResp;

        const { SPECIAL, DMGFORM, FORMULA_MOD } = HMCONST;
        const { addStrBonus, autoFormula, defense, formulaType, specialMove } = resp;
        const formula = HMTABLES.formula.dmg[formulaType];

        const derived = formulaType & DMGFORM.RSTD
            ? getDerivedDamageBonus(actor, context, addStrBonus)
            : undefined;

        const contextSystem = foundry.utils.deepClone(context.system);
        contextSystem.bonus.total.back = actor.system.bonus.total.back;
        const rollContext = { resp, derived, ...contextSystem };

        // Formula transform
        const opSet = new Set();
        if (specialMove === SPECIAL.JAB && autoFormula) opSet.add(FORMULA_MOD.HALVE); else
            if (specialMove === SPECIAL.BACKSTAB) opSet.add(FORMULA_MOD.BACKSTAB); else
                if (specialMove === SPECIAL.FLEEING) opSet.add(FORMULA_MOD.BACKSTAB); else
                    if (specialMove === SPECIAL.SET4CHARGE) opSet.add(FORMULA_MOD.DOUBLE);
        if (defense) opSet.add(FORMULA_MOD.NOPENETRATE);

        const r = new Roll(formula, rollContext);
        const terms = transformDamageFormula(r.terms, opSet);
        dataset.roll = await Roll.fromTerms(terms).evaluate();

        dataset.resp = resp;
        dataset.context = context;
        dataset.caller = actor;

        const chatMgr = new HMChatMgr();
        const card = await chatMgr.getCard({ dataset });
        await ChatMessage.create(card);
    }

    static async rollFumble({ caller } = {}) {
        const { actor } = fromCaller(caller);

        const dataset = { dialog: 'fumble', caller: actor };
        const dialogResp = await HMDialogFactory(dataset, actor);
        dataset.resp = dialogResp.resp;

        const { atk, def, innate, type } = dataset.resp;
        const formula = FUMBLETABLE.formula(atk, def);
        const results = await FUMBLETABLE.evaluate(formula, type, innate);
        if (!results) return;

        dataset.roll = results.roll;
        dataset.resp.rollIdx = results.rollIdx;
        dataset.resp.typeIdx = results.typeIdx;
        dataset.resp.comp = results.comp;
        dataset.resp.freeAttack = !!(dataset.roll.total % 2);

        if (dataset.resp.comp) {
            dataset.resp.compRoll = await new Roll('d6').evaluate();
        }

        const chatMgr = new HMChatMgr();
        const card = await chatMgr.getCard({ dataset });
        await ChatMessage.create(card);
    }

    /**
     * Initiates a critical roll. Shows dialog for a crit, processes the response, then
     * creates and displays a chat message.
     *
     * @param {Object} [options] - The options object.
     * @param {HMActor} [options.caller] - The calling context.
     * @returns {Promise<void>}
     * @static
     * @async
     */
    static async rollCrit({ caller } = {}) {
        const { actor } = fromCaller(caller);
        const dataset = { dialog: 'crit', caller: actor };
        const dialogResp = await HMDialogFactory(dataset, actor);
        const { resp } = dialogResp;

        const formula = CRITTABLE.formula(resp.atkSize, resp.defSize);
        const roll = (resp.atkRoll <= resp.defRoll) ? false : await new Roll(formula).evaluate();

        const bData = {
            caller: caller?.uuid,
            resp,
            roll: roll.toJSON(),
        };
        const builder = await HMChatFactory.create(CHAT_TYPE.CRITICAL, bData);
        builder.createChatMessage();
    }

    static async rollDefend({ weapon, caller } = {}) {
        const { actor, token } = fromCaller(caller);
        if (!actor && !token) return;

        const opt = { isCombatant: false };
        const comData = {};
        const { active } = game.combats;
        if (active) {
            comData.round = active.round;
            comData.combatant = token
                ? active.getCombatantByToken(token.id)
                : active.getCombatantByActor(actor.id);
            comData.initiative = comData.combatant?.initiative;
            opt.isCombatant = Number.isInteger(comData.initiative) && comData.round > 0;
        }

        const dialog = 'def';
        const dataset = { dialog, itemId: weapon };
        const dialogResp = await HMDialogFactory(dataset, actor);
        const { resp } = dialogResp;
        const context = resp.context;

        if (resp.dodge) {
            resp.dodge = resp.specialMove === HMCONST.SPECIAL.RDEFEND
                ? Math.max(actor.getAbilityBonus('dex', 'def'), 0)
                : 1;
        }

        const formula = HMTABLES.formula.def[resp.specialMove];
        const rollContext = { resp, ...context.system };
        const roll = await new Roll(formula, rollContext).evaluate();

        const bData = {
            caller: actor.uuid,
            context,
            resp,
            roll: roll.toJSON(),
        };
        const builder = await HMChatFactory.create(CHAT_TYPE.DEFENSE, bData);
        builder.createChatMessage();

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
}

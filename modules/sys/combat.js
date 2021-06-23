import HMDialogMgr from '../mgr/dialogmgr.js'

export class HMCombat extends Combat {
    nextTurn() { return this.nextRound() }
    _sortCombatants(a, b) { return -super._sortCombatants(a, b) }

    async _HM_setInitiative(ids) {
        const caller = ids.length ? this.combatants.get(ids[0]).actor : null;
        const dialogMgr = new HMDialogMgr();
        const dialogResp = await dialogMgr.getDialog({dialog: "setinit"}, caller);
        const formula = dialogResp.resp.value;
        const messageOptions = {sound: null, flavor: "Initiative shift"};
        return this.rollInitiative(ids, {formula, messageOptions});
    }

    async _getInitiativeDie(ids) {
        const caller = ids.length ? this.combatants.get(ids[0]).actor : null;
        const dialogMgr = new HMDialogMgr();
        const dialogResp = await dialogMgr.getDialog({dialog: "initdie"}, caller);
        return dialogResp.resp.die;
    }

    async rollInitiative(ids, {formula=null, updateTurn=true, messageOptions={}}={}) {
        let initFormula = formula;
        if (!initFormula) {
            const initDie = await this._getInitiativeDie(ids);
            initFormula = initDie + game.system.data.initiative;
        }

        const rollData = {formula: initFormula, updateTurn, messageOptions};
        return await super.rollInitiative(ids, rollData);
    }
};

export class HMCombatTracker extends CombatTracker {
    static get defaultOptions() {
        const opt = super.defaultOptions;
        opt.title = "Count Up";
        return opt;
    }

    _getEntryContextOptions() {
        const context = super._getEntryContextOptions();
        context.push({
            name: "Set Initiative",
            icon: '<i class="fas fa-clock"></i>',
            callback: li => {
                const combatant = this.viewed.combatants.get(li.data("combatant-id"));
                if (combatant) return this.viewed._HM_setInitiative([combatant.id]);
            }
        });
        return context;
    }
};

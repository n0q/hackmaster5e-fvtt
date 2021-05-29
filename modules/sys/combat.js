export class HMCombat extends Combat {
    async nextTurn() {
        let turn = this.turn;
        let skip = this.settings.skipDefeated;

        // Determine the next turn number
        let next = null;
        if ( skip ) {
            for ( let [i, t] of this.turns.entries() ) {
                if ( i <= turn ) continue;
                if ( t.defeated ) continue;
                if ( t.actor?.effects.find(e => e.getFlag("core", "statusId") === CONFIG.Combat.defeatedStatusId ) ) continue;
                next = i;
                break;
            }
        }
        else next = turn + 1;

        // HACK: Just shorting out the next round logic.
        return this.nextRound();

        // Update the encounter
        const advanceTime = CONFIG.time.turnTime;
        return this.update({round: round, turn: next}, {advanceTime});
    }

    _sortCombatants(a, b) {
         const ia = Number.isNumeric(a.initiative) ? a.initiative : -9999;
         const ib = Number.isNumeric(b.initiative) ? b.initiative : -9999;
         let ci = ia - ib;
         if ( ci !== 0 ) return ci;
         let cn = a.name.localeCompare(b.name);
         if ( cn !== 0 ) return cn;
         return a.id - b.id;
    }
};

export class HMCombatTracker extends CombatTracker {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: "combat",
            template: "systems/hackmaster5e/templates/sidebar/combat-tracker.hbs",
            title: "Count Up",
            scrollY: [".directory-list"]
        });
    }

    async _onCombatantControl(event) {
        event.preventDefault();
        event.stopPropagation();
        const btn = event.currentTarget;
        const li = btn.closest(".combatant");
        const combat = this.viewed;
        const c = combat.combatants.get(li.dataset.combatantId);

        // Switch control action
        switch (btn.dataset.control) {

        // Toggle combatant visibility
        case "toggleHidden":
            return c.update({hidden: !c.hidden});

        // Toggle combatant defeated flag
        case "toggleDefeated":
            return this._onToggleDefeatedStatus(c);

        // Roll combatant initiative
        case "rollInitiative":
            const initDie = await this._getInitiativeDie();
            const initFormula = initDie;
            console.warn(initDie);
            return combat.rollInitiative([c.id], {formula: initFormula});
        }
    }

    async _getInitiativeDie() {
        return await new Promise(async resolve => {
            new Dialog({
                title: game.i18n.localize("HM.dialog.initTitle"),
                content: await renderTemplate("systems/hackmaster5e/templates/dialog/getinitdie.hbs"),
                buttons: {
                    getdie: {
                        label: "Roll",
                        callback: () => { resolve(document.getElementById("choices").value) }
                    }
                },
                default:"getdie"
            }).render(true);
        });
    }
};

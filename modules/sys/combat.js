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
};

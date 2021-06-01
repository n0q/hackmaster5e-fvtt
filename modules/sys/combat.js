export class HMCombat extends Combat {
    async nextTurn() {
        console.warn("nextTurn was called, somehow.");
        return this.nextRound();
    }

    _sortCombatants(a, b) { return -super._sortCombatants(a, b) };

    async rollAll(options={}) {
        const ids = this.combatants.reduce((ids, c) => {
            if ( c.isOwner && !c.initiative) ids.push(c.id);
            return ids;
        }, []);
        const initDie = await this._getInitiativeDie();
        const initFormula = initDie;
        options.formula = initFormula;
        return this.rollInitiative(ids, options);
    }

    async rollNPC(options={}) {
        const ids = this.combatants.reduce((ids, c) => {
        if ( c.isOwner && c.isNPC && !c.initiative) ids.push(c.id);
            return ids;
        }, []);
        const initDie = await this._getInitiativeDie();
        const initFormula = initDie;
        options.formula = initFormula;
        return this.rollInitiative(ids, options);
    }

    async _HM_setInitiative(cid) {
        const newInit = await new Promise(async resolve => {
            new Dialog({
                title: game.i18n.localize("HM.dialog.setinitTitle"),
                content: await renderTemplate("systems/hackmaster5e/templates/dialog/setinit.hbs"),
                buttons: {
                    setinit: {
                        label: "Set Init",
                        callback: () => { resolve(document.getElementById("choices").value) }
                    }
                },
                default:"setinit",
                render: () => { document.getElementById("choices").focus() }
            }).render(true);
        });
        if (!newInit) return newInit;
        const messageOptions = {sound: null, flavor: "Initiative shift"};
        return this.rollInitiative(cid, {formula: newInit, messageOptions: messageOptions});
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
            const initDie = await combat._getInitiativeDie();
            const initFormula = initDie;
            return combat.rollInitiative([c.id], {formula: initFormula});
        }
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

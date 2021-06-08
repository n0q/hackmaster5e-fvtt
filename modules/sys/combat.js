export class HMCombat extends Combat {
    async nextTurn() {
        console.warn("nextTurn was called, somehow.");
        return this.nextRound();
    }

    _sortCombatants(a, b) { return -super._sortCombatants(a, b) };

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

    async rollInitiative(ids, {formula=null, updateTurn=true, messageOptions={}}={}) {
        const initDie = await this._getInitiativeDie();
        const initFormula = initDie;
        const rollData = {formula: initFormula, updateTurn: updateTurn, messageOptions: messageOptions};
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

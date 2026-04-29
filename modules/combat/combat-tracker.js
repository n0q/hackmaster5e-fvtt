export class HMCombatTracker extends foundry.applications.sidebar.tabs.CombatTracker {
    static get defaultOptions() {
        const opt = super.defaultOptions;
        opt.title = game.i18n.localize('HM.countup');
        return opt;
    }

}

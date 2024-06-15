import { HMTABLES } from '../tables/constants.js';
import { HMActor } from './actor.js';
import { HMChatMgr } from '../mgr/chatmgr.js';

export class HMBeastActor extends HMActor {
    prepareBaseData() {
        super.prepareBaseData();
    }

    prepareDerivedData() {
        super.prepareDerivedData();
        this.setExtras();
        this.setBonusTotal();
        this.setSP();
        this.setHP();
        this.prepareWeaponProfiles();
    }

    get movespd() {
        let movespd = Object.values(this.system.movespd.gnd);
        const armorMove = this.system.bonus.armor?.move || 1;

        if (armorMove !== 1) {
            const armorPenalty = [1, 1, armorMove, armorMove, armorMove];
            movespd = movespd.map((move, i) => move * armorPenalty[i]);
        }
        return movespd;
    }

    setExtras() {
        const {bonus} = this.system;
        if (bonus.stats === undefined) bonus.stats = {};
        const {misc, stats} = this.system.bonus;
        stats.poison = (misc.trauma || 0) * 2;
        misc.slvl = parseInt(this.system.level, 10) || 0;
    }

    setSP() {
        const {bonus, sp} = this.system;
        if (bonus.stats === undefined) bonus.stats = {};
        sp.max = bonus.total?.sp || 0;
    }

    setHP() {
        super.setHP();
        const {bonus, hp} = this.system;
        const tenacity = Math.ceil(hp.max * bonus.total.tenacityCf || 0);
        delete hp.tenacity;
        if (tenacity > 0) hp.tenacity = tenacity;
    }

    // Placeholder value.
    getAbilityBonus() { return 2; } // eslint-disable-line

    async addWound(...args) {
        const {woundData, cardData} = await super.addWound(...args);
        if (cardData) {
            cardData.dataset.hidden = true;
            const chatmgr = new HMChatMgr();
            const card = await chatmgr.getCard(cardData);
            await ChatMessage.create(card);

            const formula = HMTABLES.formula.save.trauma;
            const {system, hackmaster5e} = this;
            const rollContext = {...system, talent: hackmaster5e.talent};
            const roll = await new Roll(formula, rollContext).evaluate();

            const resp = {rollMode: CONST.DICE_ROLL_MODES.PRIVATE};
            const dialogResp = {resp};

            cardData.dialog = 'save';
            cardData.formulaType = 'trauma';

            const topcard = await chatmgr.getCard({dataset: cardData, roll, dialogResp});
            await ChatMessage.create(topcard);
        }
        return woundData;
    }
}

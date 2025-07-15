import { diceSoNiceRollStartHandler } from '../integrations/dice-so-nice.js';
import { tokenHPAttribute, HM_ER_SPEED } from '../integrations/elevationruler.js';

export class HMSupportHooks {
    static registerSupportModules() {
        if (CONFIG.elevationruler) {
            const {SPEED} = CONFIG.elevationruler;
            CONFIG.elevationruler.tokenHPAttribute = tokenHPAttribute;
            CONFIG.elevationruler.SPEED = foundry.utils.mergeObject(SPEED, HM_ER_SPEED);
        }
    }

    static diceSoNiceRollStart(...args) {
        return diceSoNiceRollStartHandler(...args);
    }
}

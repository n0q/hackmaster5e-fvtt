/* global dragRuler */
import { SYSTEM_ID } from '../tables/constants.js';
import { diceSoNiceRollStartHandler } from '../integrations/dice-so-nice.js';
import { dragRulerHandler } from '../integrations/drag-ruler.js';
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

    static dragRulerReady(...args) {
        const HMSpeedProvider = dragRulerHandler(...args);
        dragRuler.registerSystem(SYSTEM_ID, HMSpeedProvider);
    }
}

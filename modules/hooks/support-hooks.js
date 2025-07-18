import { diceSoNiceRollStartHandler } from '../integrations/dice-so-nice.js';

export class HMSupportHooks {
    static registerSupportModules() {
    }

    static diceSoNiceRollStart(...args) {
        return diceSoNiceRollStartHandler(...args);
    }
}

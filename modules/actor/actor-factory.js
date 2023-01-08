import { HMActor } from './actor.js';
import { HMBeastActor } from './beast-actor.js';
import { HMCharacterActor } from './character-actor.js';
import { SYSTEM_ID } from '../tables/constants.js';

const handler = {
    construct(_actor, args) {
        if (args[0]?.type === 'character') return new HMCharacterActor(...args);
        if (args[0]?.type === 'beast') return new HMBeastActor(...args);
        throw new Error(SYSTEM_ID, {type: args[0]?.type});
    },
};

export const HMActorFactory = new Proxy(HMActor, handler);

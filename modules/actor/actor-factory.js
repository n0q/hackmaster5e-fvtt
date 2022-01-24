/* eslint-disable */
import { HMBeastActor } from './beast-actor.js';
import { HMCharacterActor } from './character-actor.js';

const actorMappings = {
    'beast':     HMBeastActor,
    'character': HMCharacterActor,
};

// From Numenera FVTT system.
export const HMActorFactory = new Proxy(function () {}, {
    construct: function (_target, args) {
        const [data] = args;

        if (!actorMappings.hasOwnProperty(data.type)) {
            throw new Error(`Unsupported Entity type for create(): ${data.type}`);
        }

        return new actorMappings[data.type](...args);
    },

    get: function (_target, prop, _receiver) {
        switch (prop) {
            case 'create':
            case 'createDocuments':
                return function (data, options) {
                    if (data.constructor === Array) {
                        return data.map(i => HMActorFactory.create(i, options));
                    }

                if (!actorMappings.hasOwnProperty(data.type)) {
                    throw new Error(`Unsupported Entity type for create(): ${data.type}`);
                }

                return actorMappings[data.type].create(data, options);
            };

            case Symbol.hasInstance:
                return function (instance) {
                    return Object.values(actorMappings).some((i) => instance instanceof i);
                };

            default:
                return Actor[prop];
        }
    },
});

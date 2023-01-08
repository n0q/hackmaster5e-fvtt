import { SYSTEM_ID } from '../tables/constants.js';

export const registerSystemSettings = () => {
    game.settings.register(SYSTEM_ID, 'reachOpacity', {
        name: 'SETTINGS.reachOpacity',
        hint: 'SETTINGS.reachOpacityHint',
        scope: 'client',
        config: true,
        type: Number,
        default: 0.1,
        range: {min: 0, max: 1, step: 0.05},
        onChange: () => canvas.tokens.placeables.forEach((t) => t.drawReach()),
    });

    game.settings.register(SYSTEM_ID, 'smartSelect', {
        name: 'SETTINGS.smartSelect',
        hint: 'SETTINGS.smartSelectHint',
        scope: 'client',
        config: true,
        type: Boolean,
        default: true,
    });

    game.settings.register(SYSTEM_ID, 'playerNewItems', {
        name: 'SETTINGS.playerNewItems',
        hint: 'SETTINGS.playerNewItemsHint',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true,
    });
};

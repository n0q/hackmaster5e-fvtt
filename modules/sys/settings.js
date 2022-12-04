import { MODULE_ID } from '../tables/constants.js';

export const registerSystemSettings = () => {
    game.settings.register(MODULE_ID, 'reachOpacity', {
        name: 'SETTINGS.reachOpacity',
        hint: 'SETTINGS.reachOpacityHint',
        scope: 'client',
        config: true,
        type: Number,
        default: 0.1,
        range: {min: 0, max: 1, step: 0.05},
        onChange: () => canvas.tokens.placeables.forEach((t) => t.drawReach()),
    });
};

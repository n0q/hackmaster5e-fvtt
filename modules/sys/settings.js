import { SYSTEM_ID } from '../tables/constants.js';

export const registerSystemSettings = () => {
    game.settings.register(SYSTEM_ID, 'showReach', {
        name: 'SETTINGS.showReach',
        hint: 'SETTINGS.showReachHint',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true,
        onChange: () => canvas.tokens.placeables.forEach((t) => t.drawReach()),
    });

    game.settings.register(SYSTEM_ID, 'reachOpacity', {
        name: 'SETTINGS.reachOpacity',
        hint: 'SETTINGS.reachOpacityHint',
        scope: 'client',
        config: true,
        type: Number,
        default: 0.2,
        range: {min: 0, max: 1, step: 0.05},
        onChange: () => canvas.tokens.placeables.forEach((t) => t.refresh()),
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

    game.settings.register(SYSTEM_ID, 'autoEncumbrance', {
        name: 'SETTINGS.autoEncumbrance',
        hint: 'SETTINGS.autoEncumbranceHint',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true,
        onChange: renderApps,
    });

    game.settings.register(SYSTEM_ID, 'currencyWeight', {
        name: 'SETTINGS.currencyWeight',
        hint: 'SETTINGS.currencyWeightHint',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true,
        onChange: renderApps,
    });

    game.settings.register(SYSTEM_ID, 'armorDegredation', {
        name: 'SETTINGS.armorDegredation',
        hint: 'SETTINGS.armorDegredationHint',
        scope: 'world',
        config: true,
        type: Boolean,
        default: false,
        onChange: renderApps,
    });
};

function renderApps() {
    const apps = game.actors.reduce((acc, actor) => ({...acc, ...actor.apps}), {});
    Object.keys(apps).forEach((key) => {
        apps[key].document.prepareData();
        apps[key].render();
    });
}

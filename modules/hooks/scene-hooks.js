import { HMTokenHooks } from './token-hooks.js';

export class HMSceneControlHooks {
    static getSceneControlButtons(controls) {
        const tools = controls.find((a) => a.name === 'token').tools;
        const reachControl = {
            icon: 'far fa-circle-dot',
            name: 'reachview',
            title: 'CONTROLS.reachview',
            toggle: true,
            active: false,
            onClick: (active) => { game.user.showAllThreats = active; },
        };
        tools.push(reachControl);
    }

    static renderSceneControls() {
        if (!canvas.tokens) return;
        const {placeables} = canvas.tokens;
        if (placeables.length) placeables.forEach((t) => HMTokenHooks.drawToken(t));
    }
}

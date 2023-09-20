import { FILL_TYPE } from '../sys/token.js';

export class HMTokenHooks {
    static async createToken(token, _options, userId) {
        if (game.user.id !== userId) return;
        const {actor} = token;

        // Populate hp.max for beast tokens.
        if (actor.type !== 'beast' || actor.system.hp.max || userId !== game.user.id) return;

        const {formula} = actor.system.hp;
        if (Roll.validate(formula)) {
            const r = await new Roll(formula).evaluate({'async': true});
            const tokenHp = {value: r.total, max: r.total};
            // TODO: v13
            game.release.generation < 11
                ? await actor.update({'system.hp': tokenHp})
                : await token.update({'delta.system.hp': tokenHp});
        }
    }

    static destroyToken(token) {
        token.reach?.destroy();
    }

    static drawToken(token) {
        // eslint-disable-next-line no-param-reassign
        token.reach ??= canvas.grid.reach.addChild(new PIXI.Graphics());
        const {reach, interactionState} = token;
        const {INTERACTION_STATES} = MouseInteractionManager;
        const isDragged = interactionState === INTERACTION_STATES.DRAG;
        reach.visible = !!token.combatant && (token.visibleByDefault() || isDragged);
        token.drawReach();
    }

    static hoverToken(token, hover) {
        /* eslint-disable no-param-reassign */
        if (!token.combatant) return;
        token.drawReach(FILL_TYPE.REACH | FILL_TYPE.BASE);
        const {reach} = token;
        reach.visible = hover ? true : token.visibleByDefault();

        const otherTokens = canvas.tokens.placeables.filter((t) => t.id !== token.id);
        otherTokens.forEach((t) => {
            let fillType = FILL_TYPE.BASE;
            if (hover) {
                if (t.reach.visible) fillType |= FILL_TYPE.REACH;
                if (t.isVisible) t.reach.visible = true;
            } else {
                fillType = FILL_TYPE.REACH;
                t.reach.visible = t.visibleByDefault();
            }
            t.drawReach(fillType);
        });
        /* eslint-enable-line no-param-reassign */
    }

    static refreshToken(token) {
        const {reach} = token;
        reach.position = token.center;
    }
}

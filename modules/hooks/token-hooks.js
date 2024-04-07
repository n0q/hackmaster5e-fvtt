import { FILL_TYPE } from '../sys/token.js';

export class HMTokenHooks {
    /**
     * Creates a token with additional processing for HMBeastActors.
     * Calculates maximum HP based on defined formula and updates actor's HP.
     *
     * @static
     * @async
     * @param {HMToken} token - The token instance to process.
     * @param {object} _options - Unused options parameter, present for compatability.
     * @param {string} userId - User id of the calling user to check against client user id.
     * @returns {Promise<void>} - Returns early if user id does not match or token.actor
     * is not HMBeastActor.
    */
    static async createToken(token, _options, userId) {
        if (game.user.id !== userId) return;
        const {actor} = token;

        // Populate hp.max for beast tokens.
        if (actor.type !== 'beast' || actor.system.hp.max) return;

        const {formula} = actor.system.hp;
        if (Roll.validate(formula)) {
            const r = await new Roll(formula).evaluate({'async': true});
            const tokenHp = {value: r.total, max: r.total};
            await actor.update({'system.hp': tokenHp});
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
        if (token.__isSecret) return;
        /* eslint-disable no-param-reassign */
        if (!token.combatant) return;
        token.drawReach(hover ? FILL_TYPE.FULL : FILL_TYPE.REACH);
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
                t.reach.visible = t.isVisible && t.visibleByDefault();
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

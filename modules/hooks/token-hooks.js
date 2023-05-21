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

    static drawToken(token) {
        token.reach ??= canvas.grid.reach.addChild(new PIXI.Graphics()); // eslint-disable-line
        const {reach} = token;
        reach.filters ??= [new PIXI.filters.ColorMatrixFilter()];
        reach.visible = !!token.combatant && token.visibleByDefault();
        token.drawReach();
    }

    static hoverToken(token, hover) {
        if (!token.combatant) return;
        token.drawReach();
        const {reach} = token;
        reach.visible = hover ? true : token.visibleByDefault();
    }

    static refreshToken(token) {
        const {reach} = token;
        reach.position = token.center;
        reach.filters[0].brightness(1);
    }

    static destroyToken(token) {
        token.reach?.destroy();
    }
}

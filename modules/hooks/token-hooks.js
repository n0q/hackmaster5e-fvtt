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
        token.reach.visible = !!token.combatant && visibleByDefault(token);
        token.drawReach();
    }

    static controlToken(token, active) {
        // active ? token.reach.clear() : token.refresh();
        // active ? token.reach.clear() : drawReach(token);
        // const {reach} = token;
        // reach.visible = !active;
    }

    static hoverToken(token, hover) {
        if (!token.combatant) return;
        const {reach} = token;
        token.drawReach();
        reach.visible = hover ? true : visibleByDefault(token);
    }

    static refreshToken(token) {
        const {reach} = token;
        reach.position = token.center;
    }

    static destroyToken(token) {
        token.reach?.destroy();
    }
}

function visibleByDefault(token) {
    const {actor} = token;
    const {isGM, showAllThreats} = game.user;

    if (!actor) return false;
    if (showAllThreats) return true;
    if (isGM && !actor.hasPlayerOwner) return true;

    let owner = game.users.find((a) => a.character?.id === actor.id);
    if (!owner) {
        const {'default': _, ...ownership} = actor.ownership;
        const userId = Object.keys(ownership).find((a) => {
            const isOwner = ownership[a] === CONST.DOCUMENT_PERMISSION_LEVELS.OWNER;
            const isPlayer = !game.users.get(a)?.isGM;
            return isOwner && isPlayer;
        });
        owner = userId ? game.users.get(userId) : undefined;
    }

    return game.userId === owner?.id;
}

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
}

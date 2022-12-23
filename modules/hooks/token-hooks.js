export class HMTokenHooks {
    static async createToken(token, _options, userId) {
        if (game.user.id !== userId) return;
        const {actor} = token;

        // Populate hp.max for beast tokens.
        if (actor.type !== 'beast' || actor.system.hp.max || userId !== game.user.id) return;

        const {hp} = actor.system;
        const {formula} = hp;
        if (Roll.validate(formula)) {
            const r = new Roll(formula);
            await r.evaluate({'async': true});
            hp.value = r.total;
            hp.max = r.total;
            await actor.update({'data.hp': hp});
        }
    }
}

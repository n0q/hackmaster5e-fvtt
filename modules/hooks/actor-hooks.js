import { SYSTEM_ID } from '../tables/constants.js';

export class HMActorHooks {
    static async createActor(actor, _options, userId) {
        if (game.user.id !== userId) return;
        if (actor.items.size || actor.type !== 'character') return;

        const hmbasic = game.packs.get(`${SYSTEM_ID}.hm5ebasic`);
        const itemList = await hmbasic.getDocuments({type: 'skill', system: {universal: true}});
        const unarmed = await hmbasic.getDocuments({type: 'weapon', name: 'Unarmed', system: {innate: true}});
        await actor.createEmbeddedDocuments('Item', [...itemList, ...unarmed]);
    }
}

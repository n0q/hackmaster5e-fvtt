export class HMActorHooks {
    static async createActor(actor, _options, userId) {
        if (game.user.id !== userId) return;
        if (actor.items.size || actor.type !== 'character') return;

        const skillPack = game.packs.get('hackmaster5e.uskills');
        const itemList = await skillPack.getDocuments();

        const innatePack = game.packs.get('hackmaster5e.hmbinnate');
        const innateIndex = await innatePack.getIndex();

        const itemId = innateIndex.getName('Unarmed')._id;
        const unarmed = await innatePack.getDocument(itemId);
        itemList.push(unarmed);

        await actor.createEmbeddedDocuments('Item', itemList);
    }
}

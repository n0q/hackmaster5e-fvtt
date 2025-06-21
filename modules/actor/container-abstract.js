export class HMItemContainer extends foundry.abstract.DataModel {
    static defineSchema() {
        const {fields} = foundry.data;
        return {
            actor: new fields.DocumentUUIDField({blank: false, required: true, readonly: true}),
        };
    }

    get items() {
        const actor = foundry.utils.fromUuidSync(this.actor);
        const icItems = new foundry.utils.Collection(actor.items.entries());
        const stack = icItems.filter((item) => item.system?.container?.enabled);

        while (stack.length) {
            const container = stack.pop();
            container.items.forEach((i) => {
                icItems.set(i.id, i);
                if (i.system?.container?.enabled) stack.push(i);
            });
        }
        return icItems;
    }

    get itemTypes() {
        const types = Object.fromEntries(game.documentTypes.Item.map((t) => [t, []]));
        this.items.contents.forEach((item) => types[item.type].push(item));
        return types;
    }
}

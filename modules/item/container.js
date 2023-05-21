export const HMContainer = {
    getContainers: (actor) => {
        const stack = actor.itemTypes.item.filter((a) => a.system.container.enabled);
        for (let i = 0; i < stack.length; i++) {
            const node = stack[i];
            const children = node.items.filter((a) => a.type === 'item'
                && a.system.container.enabled);
            if (children) stack.push(...children);
        }
        return stack;
    },

    getMap: (root) => {
        const getChildNodes = (node) => node.filter((a) => a.type === 'item'
            && a.system.container.enabled);

        const stack = getChildNodes(root);
        const cMap = new Map();

        let i = 0;
        while (i < stack.length) {
            const node = stack[i++];
            const children = getChildNodes(node.items);
            if (children.length) stack.push(...children);
            cMap.set(node._id, [node._id]);
        }

        while (stack.length) {
            const node = stack.pop();
            const {container, _id} = node;
            if (container) {
                const nodeMap = cMap.get(_id);
                const containerMap = cMap.get(container._id);
                cMap.set(container._id, containerMap.concat(nodeMap));
            }
        }

        return cMap;
    },

    find: (actor, id, rootId=undefined) => {
        const stack = rootId ? [actor.items.get(rootId)] : [actor];
        while (stack.length > 0) {
            const node = stack.pop();
            if (node._id === id) return node;
            if (node.items) stack.push(...node.items);
        }

        return undefined;
    },

    pull: (container, id) => {
        const idx = container.items.contents.findIndex((a) => a._id === id);
        const {_manifest} = container.system.container;
        const [itemString] = _manifest.splice(idx, 1);
        container.update({'system.container._manifest': _manifest});
        return itemString;
    },

    push: (container, itemString) => {
        const {_manifest} = container.system.container;
        _manifest.push(itemString);
        container.update({'system.container._manifest': _manifest});
    },

    serialize: (actor, id) => {
        const item = actor.items.get(id);
        const itemString = JSON.stringify(item);
        item.delete();
        return itemString;
    },

    deserialize: (actor, itemString) => {
        const itemJson = JSON.parse(itemString);
        actor.createEmbeddedDocuments('Item', [itemJson], {keepId: true});
    },

    moveToContainer: (actor, currentTarget) => {
        const li = $(currentTarget).parents('.card');
        const itemId = li.data('itemId');
        const destId = currentTarget.value;
        const sourceId = li.data('containerId');

        const conList = HMContainer.getContainers(actor);

        const sourceCon = conList.find((a) => a._id === sourceId);
        const destCon = conList.find((a) => a._id === destId);

        const item = sourceCon
            ? HMContainer.pull(sourceCon, itemId)
            : HMContainer.serialize(actor, itemId);

        destCon
            ? HMContainer.push(destCon, item)
            : HMContainer.deserialize(actor, item);
    },
};

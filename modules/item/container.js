import { HMCONST } from '../tables/constants.js';

export const HMContainer = {
    getContainers: (actor) => {
        const {item} = actor.itemTypes;
        const {MAX_DEPTH} = HMCONST.CONTAINER;

        const search = (root, r=MAX_DEPTH) => {
            if (r < 0) return [];

            const nodes = root.filter((a) => a.system?.container?.enabled);
            return nodes.reduce((acc, node) => {
                const children = search(node.items, r - 1);
                return acc.concat(children);
            }, nodes);
        };
        return search(item);
    },

    getContainerMap: (containers) => {
        const {MAX_DEPTH} = HMCONST.CONTAINER;
        const preOrder = (rootNodes, cList={}, r=MAX_DEPTH) => {
            if (r < 0) return cList;

            rootNodes.forEach((node) => {
                const {items} = node;
                const children = items.filter((a) => a.system?.container?.enabled);

                preOrder(children, cList, r - 1);

                if (children.length) {
                    cList[node._id] = children.reduce((acc, child) => (
                        cList[child._id]
                            ? acc.concat(cList[child._id])
                            : acc
                        ), children.map((a) => a._id));
                }
            });
            return cList;
        };

        const roots = containers.filter((a) => !a.container);
        return preOrder(roots);
    },

    getChildContainer: (rootId, containerId, actor) => {
        const BFS = (rootNode, targetId) => {
            const {items} = rootNode;
            let child = items.find((node) => node._id === targetId);
            if (child) return child;

            for (let i = 0; i < items.length; i++) {
                child = BFS(items[i], targetId);
                if (child) break;
            }
            return child;
        };

        const root = actor.items.get(rootId);
        return BFS(root, containerId);
    },

    pull: (container, id) => {
        const idx = container.items.findIndex((a) => a._id === id);
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
        actor.createEmbeddedDocuments('Item', [itemJson]);
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

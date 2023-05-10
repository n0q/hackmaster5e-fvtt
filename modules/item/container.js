import { HMCONST } from '../tables/constants.js';

export const HMContainer = {
    getContainers: (actor) => {
        const {item} = actor.itemTypes;
        const {MAX_DEPTH, TYPE} = HMCONST.CONTAINER;

        const search = (root, r=MAX_DEPTH) => {
            if (r < 0) return [];

            const nodes = root.filter((a) => Number(a.system?.type) > TYPE.NONE);
            return nodes.reduce((acc, node) => {
                const children = search(node.hmContents, r - 1);
                return acc.concat(children);
            }, nodes);
        };
        return search(item);
    },

    getContainerMap: (containers) => {
        // const {MAX_DEPTH, TYPE} = HMCONST.CONTAINER;
        const {TYPE} = HMCONST.CONTAINER;

        const preOrder = (rootNodes, cList={}) => {
            rootNodes.forEach((node) => {
                const {hmContents} = node;
                const children = hmContents.filter((a) => a.type === 'item' && Number(a.system.type) > TYPE.NONE);

                preOrder(children, cList);

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
            const {hmContents} = rootNode;
            let child = hmContents.find((node) => node._id === targetId);
            if (child) return child;

            for (let i = 0; i < hmContents.length; i++) {
                child = BFS(hmContents[i], targetId);
                if (child) break;
            }
            return child;
        };

        const root = actor.items.get(rootId);
        return BFS(root, containerId);
    },

    pull: (container, id) => {
        const idx = container.hmContents.findIndex((a) => a._id === id);
        const {manifest} = container.system;
        const [itemString] = manifest.splice(idx, 1);
        container.update({'system.manifest': manifest});
        return itemString;
    },

    push: (container, itemString) => {
        const {manifest} = container.system;
        manifest.push(itemString);
        container.update({'system.manifest': manifest});
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

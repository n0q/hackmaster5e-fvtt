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
};

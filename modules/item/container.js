export const HMContainer = {
    /**
     * Takes an actor and returns an array with all container items and serialized containers.
     * @param {HMActor} actor - HMActor to search.
     * @return {Array} The array with all containers and container descendents from the actor.
     */
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

    /**
     * Randomizes the ids of a container and all its descendents. Generally called when a container
     * is copied or moved around.
     * @param {Object} root - Root container, which may have items to randomize.
     * @todo Function presently uses recursion. Would prefer to do this with a stack, instead.
     */
    randomizeChildIDs: (root) => {
        const {_manifest} = root.system.container;

        const updateIdsRecursive = (item) => {
            item._id = foundry.utils.randomID(); // eslint-disable-line

            if (item.system?.container?.enabled) {
                const stack = item.system.container._manifest;
                for (let j = 0; j < stack.length; j++) {
                    const childSerialized = stack[j];
                    const childJson = JSON.parse(childSerialized);
                    updateIdsRecursive(childJson);
                    stack[j] = JSON.stringify(childJson);
                }
            }
        };

        for (let i = 0; i < _manifest.length; i++) {
            const itemSerialized = _manifest[i];
            const itemJson = JSON.parse(itemSerialized);
            updateIdsRecursive(itemJson);
            _manifest[i] = JSON.stringify(itemJson);
        }

        root.update({'system.container._manifest': _manifest});
    },

    /**
     * Generates a map of containers with their corresponding descendant containers. This is used
     * to forbid introducing a cycle in the ancestry.
     * @param {Object} root - Root container.
     * @returns {Map<Object, Object[]>} A map where each key is a container, and the value is an
     * array of all descendent containers.
     */
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

    /**
     * Searches for a node with a specified ID within the hierarchy of nodes starting from either
     * the provided root node or the actor.
     * @param {HMActor} actor - The initial node to start the search from if rootId is not provided.
     * @param {string} id - The unique identifier of the node to find.
     * @param {string} [rootId=undefined] - Optional ID of the root node from where the search
     * should start.
     * @returns {HMItem|undefined} The node with the matching ID, or undefined if the node is not
     * found.
     */
    find: (actor, id, rootId=undefined) => {
        const stack = rootId ? [actor.items.get(rootId)] : [actor];
        while (stack.length > 0) {
            const node = stack.pop();
            if (node._id === id) return node;
            if (node.items) stack.push(...node.items);
        }

        return undefined;
    },

    /**
     * Removes and returns a serialized item from a container.
     * @param {Object} container - Container with item to remove.
     * @param {string} id - id of item to remove from container.
     * @return {string} Serialized item from container.
     */
    pull: (container, id) => {
        const idx = container.items.contents.findIndex((a) => a._id === id);
        const {_manifest} = container.system.container;
        const [itemString] = _manifest.splice(idx, 1);
        container.update({'system.container._manifest': _manifest});
        return itemString;
    },

    /**
     * Pushes a serialized object to a container.
     * @param {Object} container - Container to receive serialized object.
     * @param {string} itemString - Serialized object to be stored.
     */
    push: (container, itemString) => {
        const {_manifest} = container.system.container;
        _manifest.push(itemString);
        container.update({'system.container._manifest': _manifest});
    },

    /**
     * Serializes an item document embedded in an actor, and then deletes it.
     * @param {HMActor} actor - Actor which has an item to serialize.
     * @param {string} id - id of item to serialize.
     * @return {string} serialized item.
     */
    serialize: (actor, id) => {
        const item = actor.items.get(id);
        const itemString = JSON.stringify(item);
        item.delete();
        return itemString;
    },

    /**
     * Deserializes a provided item string into an item and embeds it in an actor.
     * @param {HMActor} actor - Actor to receive item.
     * @param {string} itemString - Serialized item to embed on actor.
     */
    deserialize: (actor, itemString) => {
        const itemJson = JSON.parse(itemString);
        actor.createEmbeddedDocuments('Item', [itemJson], {keepId: true});
    },

    /**
     * Moves a (possibly serialized) item into or out of a container.
     * @param {HMActor} actor - The actor object to operate upon.
     * @param {jQuery} currentTarget - The jQuery object representing the element
     * that triggered the move action.
     */
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

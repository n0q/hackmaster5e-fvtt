export class HMCanvasHooks {
    // Adapted from pf2e, licensed under the Apache License 2.0
    static dropCanvasData(_canvas, data) {
        const dropTarget = [...canvas.tokens.placeables]
            .sort((a, b) => b.document.sort - a.document.sort)
            .sort((a, b) => b.document.elevation - a.document.elevation)
            .find((t) => t.bounds.contains(data.x, data.y));

        const actor = dropTarget?.actor;
        if (actor && data.type === 'Item') {
            const dataTransfer = new DataTransfer();
            dataTransfer.setData('text/plain', JSON.stringify(data));
            const event = new DragEvent('drop', {dataTransfer});
            actor.sheet._onDrop(event);
            return false; // Prevent modules from doing anything further
        }

        return true;
    }
}

import { HMCONST } from './constants.js';

function newReach(distance, color, visible) {
    return {
        distance,
        color,
        visible,
        opacity: 0.1,
        id: randomID(),
    };
}

function getReach(actor) {
    const weapon = actor.itemTypes.weapon
        .find((a) => a.system.state === HMCONST.ITEM_STATE.EQUIPPED);

    if (!weapon || weapon.system.ranged.checked) return [];

    const reach = (weapon.system.reach || 0) + (actor.system.bonus.total.reach || 0);
    const distance = Math.max(reach, 0) + (game.canvas.scene.grid.distance / 2);

    let color;
    let visible;

    if (actor.hasPlayerOwner) {
        const owner = game.users.find((a) => a.character?.id === actor.id);
        color = owner.color;
        visible = game.userId === owner.id;
    } else {
        color = '#ffffff';
        visible = game.user.isGM;
    }

    return newReach(distance, color, visible);
}

export class HMToken extends Token {
    async draw(...args) {
        const rv = super.draw(...args);
        this.reach = this.addChildAt(new PIXI.Container(), 0);
        this.drawReach();
        return rv;
    }

    async drawReach(hovered=false) {
        this.reach.removeChildren().forEach((c) => c.destroy());
        const reach = getReach(this.actor);
        if (!hovered && !reach.visible && !game.user.showAllThreats) return;
        if (!this.combatant) return;

        if (reach) {
            const gfx = this.reach.addChild(new PIXI.Graphics());
            if (canvas.interface.reverseMaskfilter) {
                gfx.filters = [canvas.interface.reverseMaskfilter];
            }

            const squareGrid = canvas.scene.grid.type === CONST.GRID_TYPES.SQUARE;
            const dim = canvas.dimensions;
            const unit = dim.size / dim.distance;
            const [cx, cy] = [this.w / 2, this.h / 2];
            const {width, height} = this.document;

            let [w, h] = [reach.distance, reach.distance];

            if (squareGrid) {
                w += (width  * dim.distance) / 2;
                h += (height * dim.distance) / 2;
            } else {
                w += ((width - 1)  * dim.distance) / 2;
                h += ((height - 1) * dim.distance) / 2;
            }

            const [w2, h2] = [(w + 5) * unit, (h + 5) * unit];
            w *= unit;
            h *= unit;

            const color = Color.from(reach.color);

            gfx.beginFill(color, reach.opacity)
                .lineStyle(1, color, reach.opacity * 2)
                .drawEllipse(cx, cy, w, h)
                .drawEllipse(cx, cy, w2, h2)
                .endFill();
        }
    }

    static getSceneControlButtons(controls) {
        const tools = controls.find((a) => a.name === 'token').tools;
        const reachControl = {
            icon: 'far fa-circle-dot',
            name: 'reachview',
            title: 'CONTROLS.reachview',
            toggle: true,
            active: false,
            onClick: (active) => { game.user.showAllThreats = active; },
        };
        tools.push(reachControl);
    }

    static renderSceneControls() {
        if (!canvas.tokens) return;
        const {placeables} = canvas.tokens;
        if (placeables.length) placeables.forEach((t) => t.drawReach());
    }
}

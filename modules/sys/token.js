import { SYSTEM_ID, HMCONST } from '../tables/constants.js';
import { actorHasEffects } from './effects.js';

function newReach(distance, color, visible) {
    return {
        distance,
        color,
        foo: 'bar',
        visible,
        opacity: game.settings.get(SYSTEM_ID, 'reachOpacity'),
        id: randomID(),
    };
}

function getReach(actor) {
    if (!actor) return null;

    const reachHint = actor.getFlag(SYSTEM_ID, 'reachHint');
    const weapons = actor.itemTypes.weapon.filter((a) => !a.system.ranged.checked);
    const {ITEM_STATE} = HMCONST;

    const weapon = weapons.find((a) => a.system.state >=  ITEM_STATE.EQUIPPED && a.id === reachHint)
                ?? weapons.find((a) => a.system.state === ITEM_STATE.EQUIPPED)
                ?? weapons.find((a) => a.system.innate);
    if (!weapon) return null;
    if (weapon.id !== reachHint && actor.isOwner) actor.setFlag(SYSTEM_ID, 'reachHint', weapon.id);

    const wProfile = actor.wprofiles.get(weapon.profileId);
    const reach = (wProfile.system.reach || 0);

    // TODO: This works okay for gridless and square. Falls flat on hex grids.
    let distance = Math.max(reach, 0);
    const isGridless = canvas.scene.grid.type === CONST.GRID_TYPES.GRIDLESS;
    if (isGridless) distance += (game.canvas.scene.grid.distance / 2);

    let color;
    let visible;
    const defaultColor = '#ffffff';

    if (actor.hasPlayerOwner) {
        let owner = game.users.find((a) => a.character?.id === actor.id);
        if (!owner) {
            const userId = Object.entries(actor.ownership).find((a) => {
                const [uid, pl] = a;
                const isOwner = pl === CONST.DOCUMENT_PERMISSION_LEVELS.OWNER;
                const isGM = game.users.get(uid)?.isGM;
                return isOwner && !isGM && uid !== 'default';
            })?.[0];
            owner = userId ? game.users.get(userId) : undefined;
        }

        color = owner?.color ?? defaultColor;
        visible = game.userId === owner?.id;
    } else {
        color = defaultColor;
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
        if (!this.combatant) return;

        const eList = ['dead', 'incap', 'unconscious', 'sfatigue', 'sleep'];
        if (actorHasEffects(this.actor, eList)) return;

        const reach = getReach(this.actor);
        if (!reach) return;
        if (!hovered && !reach.visible && !game.user.showAllThreats) return;

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
        const hoverOpacity = hovered ? reach.opacity * 4 : reach.opacity * 2;
        gfx.beginFill(color, reach.opacity)
            .lineStyle(1, color, hoverOpacity)
            .drawEllipse(cx, cy, w, h)
            .drawEllipse(cx, cy, w2, h2)
            .endFill();
    }

    async addWound(amount) {
        if (!this.actor) return false;
        return this.actor.addWound(amount);
    }
}

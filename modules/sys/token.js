import { SYSTEM_ID, HMCONST } from '../tables/constants.js';
import { actorHasEffects } from './effects.js';

export class HMToken extends Token {
    drawReach() {
        const {center, hover, reach} = this;
        reach.clear();

        reach.position = center;
        const geometry = this.getGeometry();
        const color = this.getColor();
        if (!geometry || !color) return;

        const [w, h, w2, h2, op] = geometry;
        const op2 = hover ? op * 2 : op;
        reach.beginFill(color, op)
            .lineStyle(1, color, op2)
            .drawEllipse(0, 0, w, h)
            .drawEllipse(0, 0, w2, h2)
            .endFill();
    }

    getColor() {
        const {actor} = this;
        if (!actor) return false;

        const defaultColor = '#ffffff';
        if (!actor.hasPlayerOwner) return Color.from(defaultColor);

        let owner = game.users.find((a) => a.character?.id === actor.id);
        if (!owner) {
            const {'default': _, ...ownership} = actor.ownership;
            const userId = Object.keys(ownership).find((a) => {
                const isOwner = ownership[a] === CONST.DOCUMENT_PERMISSION_LEVELS.OWNER;
                const isPlayer = !game.users.get(a)?.isGM;
                return isOwner && isPlayer;
            });
            owner = userId ? game.users.get(userId) : undefined;
        }

        const colorCode = owner?.color ?? defaultColor;
        return Color.from(colorCode);
    }

    getGeometry() {
        if (!this.combatant) return false;

        const eList = ['dead', 'incap', 'unconscious', 'sfatigue', 'sleep'];
        if (actorHasEffects(this.actor, eList)) return false;

        const reach = this.getReach();
        if (!reach) return false;

        const squareGrid = canvas.scene.grid.type === CONST.GRID_TYPES.SQUARE;
        const dim = canvas.dimensions;
        const unit = dim.size / dim.distance;
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

        const op = reach.opacity;
        return [w, h, w2, h2, op];
    }

    getReach() {
        const {actor} = this;
        if (!actor) return null;

        const reachHint = actor.getFlag(SYSTEM_ID, 'reachHint');
        const weapons = actor.itemTypes.weapon.filter((a) => !a.system.ranged.checked);
        const STATE = HMCONST.ITEM_STATE;

        const weapon = weapons.find((a) => a.system.state >=  STATE.EQUIPPED && a.id === reachHint)
                    ?? weapons.find((a) => a.system.state === STATE.EQUIPPED)
                    ?? weapons.find((a) => a.system.innate);
        if (!weapon) return null;
        if (weapon.id !== reachHint && actor.isOwner) actor.setFlag(SYSTEM_ID, 'reachHint', weapon.id);

        const wProfile = actor.wprofiles.get(weapon.profileId);
        const reach = (wProfile.system.reach || 0);

        let distance = Math.max(reach, 0);
        const isGridless = canvas.scene.grid.type === CONST.GRID_TYPES.GRIDLESS;
        if (isGridless) distance += (game.canvas.scene.grid.distance / 2);

        const opacity = game.settings.get(SYSTEM_ID, 'reachOpacity');
        return {distance, opacity};
    }

    animReachOpen() {
        const {reach} = this;
        reach.visible = !!this.combatant && this.visibleByDefault();
        const ease = 'elastic.out(1, 0.3)';
        reach.scale.set(1, 1);
        game.gsap.from(reach.scale, {
            x: 0,
            y: 0,
            duration: 2,
            ease,
            onStart: () => this.drawReach(),
            onComplete: () => this.drawReach(),
        });
    }

    animReachClose() {
        const {reach} = this;
        game.gsap.to(reach.scale, {
            yoyo: true,
            repeat: 1,
            x: 0,
            y: 0,
            ease: 'back.in(1)',
            onRepeat: () => { reach.visible = false; },
        });
    }

    visibleByDefault() {
        const {actor} = this;
        const {isGM, showAllThreats} = game.user;

        if (!actor) return false;
        if (showAllThreats) return true;
        if (isGM && !actor.hasPlayerOwner) return true;

        let owner = game.users.find((a) => a.character?.id === actor.id);
        if (!owner) {
            const {'default': _, ...ownership} = actor.ownership;
            const userId = Object.keys(ownership).find((a) => {
                const isOwner = ownership[a] === CONST.DOCUMENT_PERMISSION_LEVELS.OWNER;
                const isPlayer = !game.users.get(a)?.isGM;
                return isOwner && isPlayer;
            });
            owner = userId ? game.users.get(userId) : undefined;
        }

        return game.userId === owner?.id;
    }

    async addWound(amount) {
        if (!this.actor) return false;
        return this.actor.addWound(amount);
    }
}

import { SYSTEM_ID, HMCONST, HMTABLES } from '../tables/constants.js';
import { actorHasEffects } from './effects.js';

export const FILL_TYPE = {
    ZERO:       0b00,
    DEFAULT:    0b01,
    REACH:      0b01,
    BASE:       0b10,
    FULL:       0b11,
};

export class HMToken extends Token {
    get __isSecret() {
        return this.document.disposition === CONST.TOKEN_DISPOSITIONS.SECRET && !this.isOwner;
    }

    drawReach(renderMode = FILL_TYPE.DEFAULT) {
        if (this.__isSecret) return;
        const showReach = game.settings.get(SYSTEM_ID, 'showReach');

        const {center, hover, reach, interactionState} = this;
        const isDragged = interactionState === MouseInteractionManager.INTERACTION_STATES.DRAG;

        reach.clear();
        if (!showReach) return;
        reach.position = center;
        const geometry = this.getGeometry();
        const color = this.getColor();
        if (!geometry || !color) return;

        let mode = renderMode;
        if (hover || isDragged) mode |= FILL_TYPE.BASE;
        renderGeometry(reach, mode, hover, geometry, color);
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
        if (!this.combatant || !this.actor) return false;
        const {actor} = this;
        const {system} = actor;

        const eList = ['dead', 'incap', 'unconscious', 'sfatigue', 'sleep'];
        if (actorHasEffects(actor, eList)) return false;

        const reach = this.getReach();
        if (!reach) return false;

        const dim = canvas.dimensions;
        const unit = dim.size / dim.distance;

        const [race] = actor.itemTypes.race;
        const defaultBaseDiameter = HMTABLES.scale[HMCONST.SCALE.MEDIUM].token;
        let tokenBaseDiameter = defaultBaseDiameter;
        if (race)         { tokenBaseDiameter = Number(race.system.bonus.token);            } else
        if (system.scale) { tokenBaseDiameter = HMTABLES.scale[Number(system.scale)].token; }
        tokenBaseDiameter ??= defaultBaseDiameter;

        const r1 = (tokenBaseDiameter / 2) * unit;
        const r2 = r1 + (reach.distance * unit);
        const r3 = r2 + (5 * unit);

        const op = reach.opacity;
        return [r1, r2, r3, op];
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

        const distance = Math.max(reach, 0);
        const opacity = game.settings.get(SYSTEM_ID, 'reachOpacity');

        return {distance, opacity};
    }

    animReachOpen() {
        const {reach} = this;
        reach.visible = !!this.combatant && this.visibleByDefault();
        if (!reach.visible) return;

        const ease = 'elastic.out(1, 0.3)';
        reach.scale.set(1, 1);
        game.gsap.from(reach.scale, {
            x: 0,
            y: 0,
            duration: 1.5,
            ease,
            onStart: () => this.drawReach(),
            onComplete: () => this.drawReach(),
        });
    }

    animReachClose() {
        const {reach} = this;
        if (!reach.visible) return;

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

function renderGeometry(reach, mode, isHovered, geometry, color) {
    const [r1, r2, r3, op] = geometry;

    const fillTypeOps = {
        [FILL_TYPE.BASE | FILL_TYPE.REACH]: (solid) => {
            reach.lineStyle(1, color, 1)
                .drawCircle(0, 0, r1)
                .lineStyle(1, color, solid ? 1 : op)
                .drawCircle(0, 0, r2)
                .drawCircle(0, 0, r3);
        },
        [FILL_TYPE.REACH]: () => {
            reach.lineStyle(1, color, op)
                .drawCircle(0, 0, r2)
                .drawCircle(0, 0, r3);
        },
        [FILL_TYPE.BASE]: () => {
            reach.lineStyle(1, color, 1)
                .drawCircle(0, 0, r1);
        },
    };

    reach.beginFill(color, op);
    if (Object.prototype.hasOwnProperty.call(fillTypeOps, mode)) fillTypeOps[mode](isHovered);
    reach.endFill();
}

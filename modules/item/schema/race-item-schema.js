/**
 * @fileoverview Sets data model for HMRaceItem.
 */
import { HMCONST, HMTABLES } from '../../tables/constants.js';

export class HMRaceSchema extends foundry.abstract.DataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        const bonusInitial = HMTABLES.scale[HMCONST.SCALE.MEDIUM];

        const scaleKeys = Object.keys(bonusInitial);
        const scaleOpts = {required: true, initial: HMCONST.SCALE.MEDIUM, integer: true};
        const scaleEntries = scaleKeys.map((k) => [k, new fields.NumberField(scaleOpts)]);
        const scaleInner = Object.fromEntries(scaleEntries);

        const bonusKeys = [...scaleKeys, 'def', 'sfc'];
        const bonusOpts = {required: false, integer: false, nullable: true};
        const bonusEntries = bonusKeys.map((k) => [
            k, new fields.NumberField({...bonusOpts, initial: bonusInitial[k] || 0})]);
        const bonusInner = Object.fromEntries(bonusEntries);

        const abilityKeys = Object.keys(HMTABLES.abilitymods.clamp);
        const abilityOpts = {required: false, initial: {value: 0}, integer: true};
        const abilityEntries = abilityKeys.map((k) => [k, new fields.ObjectField(abilityOpts)]);
        const abilityInner = Object.fromEntries(abilityEntries);

        return {
            description: new fields.HTMLField({required: false, initial: undefined}),
            adj: new fields.StringField({required: false, initial: undefined}),
            scale: new fields.SchemaField(scaleInner),
            bonus: new fields.SchemaField(bonusInner),
            abilities: new fields.SchemaField(abilityInner),
        };
    }

    static migrateData(source) {
        /* eslint-disable no-param-reassign */
        // 0.4.6 - Enforce scale and bonus values as numbers.
        if ('scale' in source) {
            const {scale} = source;
            const scaleEntries = Object.entries(scale).map(([k, v]) => [k, parseInt(v, 10) || 0]);
            source.scale = Object.fromEntries(scaleEntries);
        }

        if ('bonus' in source) {
            if (!Number.isFinite(source.bonus.move)) {
                source.bonus.move = 1;
            }
        }
        /* eslint-enable no-param-reassign */
        return super.migrateData(source);
    }
}

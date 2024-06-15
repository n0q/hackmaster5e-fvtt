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
            bmi: new fields.SchemaField({
                [HMCONST.PRIORS.BMI.OVER]: getBmiSchema(),
                [HMCONST.PRIORS.BMI.OBESE]: getBmiSchema(),
            }),
        };
    }

    /* eslint-disable no-param-reassign */
    static migrateData(source) {
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

        // 0.4.11 - Enforce value and fvalue as numbers.
        if ('abilities' in source) {
            const {abilities} = source;
            const abilitiesEntries = Object.entries(abilities).map(([k, v]) => [
                k,
                {value: v.value || 0, fvalue: v.fvalue || 0},
            ]);
            source.abilities = Object.fromEntries(abilitiesEntries);
        }

        return super.migrateData(source);
    }
    /* eslint-enable no-param-reassign */
}

function getBmiSchema() {
    const fields = foundry.data.fields;
    const bmiOpts = {required: false, integer: false, initial: undefined};

    return new fields.SchemaField({
        [HMCONST.PRIORS.SEX.FEMALE]: new fields.NumberField(bmiOpts),
        [HMCONST.PRIORS.SEX.MALE]: new fields.NumberField(bmiOpts),
    });
}

import { ThingSchema } from './parts/thing-schema.js';

export class HMArmorSchema extends foundry.abstract.DataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        return {
            ...new ThingSchema(),
            description: new fields.HTMLField({required: false, initial: undefined}),
            armortype: new fields.StringField({required: false, initial: null}),
            proficiency: new fields.StringField({required: false, initial: null}),
            damage: new fields.NumberField({required: false, initial: 0, integer: true}),
            bonus: new fields.SchemaField({
                total: getVectorSchema(),
                base: getVectorSchema(),
                mod: getVectorSchema({move: 0}),
            }),
            qn: new fields.NumberField({required: false, initial: 0, integer: true}),
            shield: new fields.SchemaField({
                checked: new fields.BooleanField({required: false, initial: false}),
            }),
        };
    }

    /* eslint-disable no-param-reassign */
    static migrateData(source) {
        if (source?.damage == null) source.damage = 0;
    }
    /* eslint-enable no-param-reassign */
}

function getVectorSchema({move = 1.0} = {}) {
    const fields = foundry.data.fields;
    const integerOpts = {required: false, initial: 0, integer: true};
    const floatOpts = {required: false, initial: move, integer: false};

    return new fields.SchemaField({
        dr: new fields.NumberField(integerOpts),
        def: new fields.NumberField(integerOpts),
        init: new fields.NumberField(integerOpts),
        spd: new fields.NumberField(integerOpts),
        move: new fields.NumberField(floatOpts),
    });
}

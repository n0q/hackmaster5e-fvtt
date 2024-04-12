import { HMCONST } from '../../tables/constants.js';

export class HMSpellSchema extends foundry.abstract.DataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        const stringOpts = {required: false, initial: undefined};
        const numberOpts = {required: false, initial: 0, integer: true};
        const booleanOpts = {required: false, initial: false};

        return {
            description: new fields.HTMLField(stringOpts),
            divine: new fields.BooleanField(booleanOpts),
            component: new fields.SchemaField({
                verbal: new fields.BooleanField(booleanOpts),
                somatic: new fields.BooleanField(booleanOpts),
                material: new fields.BooleanField(booleanOpts),
                catalyst: new fields.BooleanField(booleanOpts),
                divine: new fields.BooleanField(booleanOpts),
            }),
            save: new fields.SchemaField({
                type: new fields.NumberField({...numberOpts, initial: HMCONST.SAVE.TYPE.NONE}),
                action: new fields.NumberField({...numberOpts, initial: HMCONST.SAVE.ACTION.NONE}),
            }),
            speed: new fields.NumberField({...numberOpts, initial: 1}),
            prepped: new fields.NumberField(numberOpts),
            lidx: new fields.NumberField({...numberOpts, initial: 2}),
        };
    }
}

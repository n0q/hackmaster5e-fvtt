import { HMCONST } from '../../tables/constants.js';

export class HMWoundSchema extends foundry.abstract.DataModel {
    static defineSchema() {
        const {EMBED} = HMCONST.RANGED;
        const fields = foundry.data.fields;
        return {
            embed: new fields.NumberField({required: false, initial: EMBED.NONE, integer: true}),
            isEmbedded: new fields.BooleanField({required: false, initial: false}),
            hp: new fields.NumberField({required: true, initial: 0, integer: true}),
            note: new fields.StringField({required: false, initial: undefined, trim: true}),
            timer: new fields.NumberField({required: true, initial: 0, integer: true}),
            treated: new fields.BooleanField({required: false, initial: false}),
        };
    }
}

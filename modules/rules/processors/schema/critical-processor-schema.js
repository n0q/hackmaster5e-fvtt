import { HMCONST } from "../../../tables/constants.js";

export class CriticalProcessorSchema extends foundry.abstract.DataModel {
    static defineSchema() {
        const fields = foundry.data.fields;

        const { DMGTYPE, SCALE } = HMCONST;
        const scaleValues = Object.values(SCALE);
        const dmgTypeValues = Object.values(DMGTYPE);

        const numberOpts = { required: true, initial: 0, integer: true };
        const scaleOpts = {
            ...numberOpts,
            min: Math.min(...scaleValues),
            max: Math.max(...scaleValues),
        };
        const dmgTypeOpts = {
            ...numberOpts,
            min: Math.min(...dmgTypeValues),
            max: Math.max(...dmgTypeValues),
        };

        return {
            atkRoll: new fields.NumberField(numberOpts),
            defRoll: new fields.NumberField(numberOpts),
            atkSize: new fields.NumberField(scaleOpts),
            defSize: new fields.NumberField(scaleOpts),
            dmg: new fields.NumberField({ ...numberOpts, min: 0 }),
            dmgType: new fields.NumberField(dmgTypeOpts),
            dr: new fields.NumberField({ ...numberOpts, min: 0 }),
            bonus: new fields.NumberField(numberOpts),
        };
    }
}

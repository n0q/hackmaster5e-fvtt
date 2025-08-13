import { HMCONST, HMTABLES } from "../../tables/constants.js";
import { BasicAliasField } from "../../data/fields.js";

export class HMSkillSchema extends foundry.abstract.DataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        const numberOpts = { required: false, initial: 0, integer: true };
        const booleanOpts = { required: false, initial: false };
        const stringOpts = { required: false, initial: undefined };

        const abilityKeys = ["str", "int", "wis", "dex", "con", "lks", "cha"];
        const abilityEntries = abilityKeys.map(k => [k, new fields.BooleanField(booleanOpts)]);
        const abilityInner = Object.fromEntries(abilityEntries);

        return {
            description: new fields.HTMLField(stringOpts),
            bonus: new fields.SchemaField({
                total: new fields.SchemaField({
                    value: new fields.NumberField(numberOpts),
                    literacy: new fields.NumberField(numberOpts),
                    verbal: new fields.NumberField(numberOpts),
                }),
                mastery: new fields.SchemaField({
                    value: new fields.NumberField(numberOpts),
                    literacy: new fields.NumberField(numberOpts),
                    verbal: new fields.NumberField(numberOpts),
                }),
            }),
            bp: new fields.NumberField(numberOpts),
            specialty: new fields.SchemaField({
                checked: new fields.BooleanField(booleanOpts),
                value: new fields.StringField(stringOpts),
            }),
            universal: new fields.BooleanField(booleanOpts),
            tools: new fields.BooleanField(booleanOpts),
            language: new fields.BooleanField(booleanOpts),
            relevant: new fields.SchemaField(abilityInner),
            ba: new BasicAliasField(stringOpts),
        };
    }

    get mastery() {
        const { bonus } = this;
        const { MASTERY } = HMCONST.SKILL;

        return Object.keys(bonus.total).reduce((acc, type) => {
            const isUnskilled = !bonus.mastery[type];
            const mValue = parseInt(bonus.total[type], 10);
            acc[type] = isUnskilled ? MASTERY.UNSKILLED : HMTABLES.skill.mastery(mValue);
            return acc;
        }, {});
    }

    get level() {
        return this.bonus.total;
    }
}

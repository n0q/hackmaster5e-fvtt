import { BasicObjectBindingSchema } from "../../data/bob-schema.js";

export const SKILL_TYPES = ["value", "literacy", "verbal"];

export class HMSkillSchema extends foundry.abstract.DataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        const numberOpts = { required: false, initial: 0, integer: true, null: false };
        const booleanOpts = { required: false, initial: false };
        const stringOpts = { required: false, initial: undefined };

        const abilityKeys = ["str", "int", "wis", "dex", "con", "lks", "cha"];
        const abilityEntries = abilityKeys.map(k => [k, new fields.BooleanField(booleanOpts)]);
        const abilityInner = Object.fromEntries(abilityEntries);

        const createSkillTypeFields = () => {
            return Object.fromEntries(
                SKILL_TYPES.map(type => [type, new fields.NumberField(numberOpts)])
            );
        };

        return {
            description: new fields.HTMLField(stringOpts),
            bonus: new fields.SchemaField({
                mastery: new fields.SchemaField(createSkillTypeFields()),
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
            bob: new fields.EmbeddedDataField(BasicObjectBindingSchema),
        };
    }

    get SKILL_TYPES() {
        return SKILL_TYPES;
    }

    static migrateData(source) {
        const migrated = super.migrateData(source);

        if (migrated.bonus?.mastery) {
            for (const skillType of SKILL_TYPES) {
                if (migrated.bonus.mastery[skillType] == null) {
                    migrated.bonus.mastery[skillType] = 0;
                }
            }
        }
        return migrated;
    }
}


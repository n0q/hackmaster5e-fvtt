import { HMItem } from "./item.js";
import { HMCONST, SYSTEM_ID } from "../tables/constants.js";
import { sanitizeForBasicObjectBinding, isValidBasicObjectBinding } from "../data/data-utils.js";
import { SkillPrompt } from "../apps/skill-application.js";
import { SkillProcessor } from "../rules/processors/skill-processor.js";
import { HMChatFactory, CHAT_TYPE } from "../chat/chat-factory.js";
import { HMAggregator } from "../rules/aggregator.js";
import { HMUnit } from "../rules/hmunit.js";

export class HMSkillItem extends HMItem {

    bonus = null;

    prepareBaseData() {
        super.prepareBaseData();
    }

    prepareDerivedData() {
        super.prepareDerivedData();
        this.bonus = new HMAggregator({ parent: this }, { noprop: true });
    }

    /**
     * Custom bonus aggregation handler for skills.
     *
     * Handles untrained universal skills by creating an 'untrained' vector
     * with values based on the lowest relevant ability score.
     * @param {HMAggregator} aggregator - The bonus aggregator instance
     */
    _postAggregation(aggregator) {
        const isUniversal = this.system.universal;
        const masteryUnits = aggregator.getUnitsForVector("mastery");
        const isUntrained = masteryUnits.length === 0 || masteryUnits.every(u => u.value === 0);
        if (!isUniversal || !isUntrained) return;

        const abilities = this.parent?.system?.abilities;
        if (!abilities) return;

        const relevantAbilities = Object.entries(this.system.relevant)
            .filter(([_, isRelevant]) => isRelevant)
            .map(([ability, _]) => ability);

        if (relevantAbilities.length > 0) {
            const abilityScores = relevantAbilities.map(ability =>
                abilities.total[ability]?.value || 10
            );

            const lowestScore = Math.min(...abilityScores);

            const hmUnitData = {
                value: lowestScore,
                vector: "untrained",
                source: this,
                label: "Untrained Universal",
                path: null,
            };

            aggregator.addUnit(new HMUnit({ ...hmUnitData, unit: "value" }));
            aggregator.addUnit(new HMUnit({ ...hmUnitData, unit: "literacy" }));
            aggregator.addUnit(new HMUnit({ ...hmUnitData, unit: "verbal" }));
        }
    }

    createSyntheticSkill() {
        const baseUnitData = {
            value: 0,
            vector: "untrained",
            // source: this,
            source: null,
            label: "Untrained Universal",
            path: null,
        };

        const unitTypes = ["value", "literacy", "verbal"];

        const mapData = unitTypes.map(unitType => {
            const unit = new HMUnit({ ...baseUnitData, unit: unitType });
            return [`untrained.${unitType}`, [unit]];
        });

        return new Map(mapData);
    }

    /**
     * Processes a skill check roll, creating prompts and chat messages.
     *
     * @param {Object} appData - Application data containing actor and mastery information
     * @param {string} masteryType - The mastery type for the skill check
     * @param {Object[]|undefined} participants - Optional array of participants for survey checks.
     * @param {HMActor} participants[].actor - An actor making the survey check.
     * @param {HMSkillItem} participants[].skill - A skill associated with the actor's survey check.
     * @returns {Promise<void>}
     */
    async process(masteryType, participants = null) {
        const processList = participants
            ? participants
            : [{ actor: this.parent, skill: this }];

        const subject = {
            actor: processList[0].actor,
            skill: {
                data: processList[0].skill.bonus.toMap(),
                name: processList[0].skill.specname,
                masteryType,
            },
        };

        const result = await SkillPrompt.create({}, { subject });
        if (!result) return;

        const { rollMode, ...promptData } = result;

        const results = await Promise.all(
            processList.map(async ({ actor, skill }) => {
                const processorData = {
                    resp: promptData,
                    skillAggregatorMap: skill.bonus.toMap(),
                };

                const bData = await SkillProcessor.process(processorData);
                bData.caller = actor.uuid;
                bData.mdata.name = skill.specname;
                return bData;
            })
        );

        const validResults = results.filter(r => r !== null);

        if (validResults.length === 0) return;

        if (validResults.length === 1) {
            // Single token roll.
            const builder = await HMChatFactory.create(
                CHAT_TYPE.SKILL_CHECK,
                validResults[0],
                { rollMode }
            );
            builder.createChatMessage();
        } else {
            // Multi token survey report.
            const builder = await HMChatFactory.create(
                CHAT_TYPE.SKILL_SURVEY_CHECK,
                { batch: validResults },
                { rollMode },
            );
            builder.createChatMessage();
        }
    }

    static createSyntheticSkill(skillName, bob) {
        // Create minimal skill data structure
        const syntheticData = {
            name: skillName,
            type: "skill",
            system: {
                bob: { value: bob, auto: false },
                universal: true,
            },
        };

        const syntheticSkill = new HMSkillItem(syntheticData);
        syntheticSkill.prepareDerivedData();
        return syntheticSkill;
    }

    /**
     * Rolls a skill check for controlled actors via bob.
     * Falls back to user's assigned character if no tokens are controlled and smart select is enabled.
     *
     * @param {BasicObjectBinding} bob - The bob to look up and roll.
     * @param {string} name - The skill name for synthetic skills.
     * @param {string} masteryType - The type of skill to check for.
     * @static
     */
    static rollByBob({ bob, name, masteryType = HMCONST.SKILL.TYPE.SKILL }) {
        if (!isValidBasicObjectBinding(bob, this.type)) {
            throw new Error(`Invalid Bob: '${bob}'.`);
        }

        let actors = canvas.tokens.controlled.map(token => token.actor);
        if (!actors.length && !game.user.isGM) {
            const smartSelect = game.settings.get(SYSTEM_ID, "smartSelect");
            const { character } = game.user;
            if (smartSelect && character) actors.push(character);
        }

        const hookResult = Hooks.call("hm5e.getSkillActors", actors, { bob, name, masteryType });

        if (Array.isArray(hookResult)) {
            actors = hookResult;
        }

        if (actors.length < 1) {
            ui.notifications.warn("No actors selected");
            return;
        }

        const participants = [];
        let skillToUse = null;

        for (const actor of actors) {
            const skill = actor.getByBob(bob);

            if (skill) {
                participants.push({ actor, skill });
                if (!skillToUse) skillToUse = skill;
            } else if (actor.validSyntheticBobs?.includes(bob)) {
                const syntheticSkill = HMSkillItem.createSyntheticSkill(name, bob);
                participants.push({ actor, skill: syntheticSkill });
                if (!skillToUse) skillToUse = syntheticSkill;
            }
        }

        if (participants.length === 0) {
            ui.notifications.warn("No actors can use this skill");
            return;
        }

        skillToUse.process(masteryType, participants);
    }

    /**
     * Generates a bob for a skill item.
     *
     * @override
     * @returns {string} The generated bob.
     * @throws {Error} If the gnereated bob is invalid.
     */
    _generateBasicObjectBinding() {
        const superBob = super._generateBasicObjectBinding();

        const { specialty } = this.system;
        const hasSpecialty = specialty.checked && specialty.value;

        if (!hasSpecialty) {
            return superBob;
        }

        const subname = sanitizeForBasicObjectBinding(specialty.value);
        const bob = `${superBob}_${subname}`;

        if (isValidBasicObjectBinding(bob, this.type)) {
            return bob;
        }

        throw new Error(`Invalid Bob: '${bob}'.`);
    }
}


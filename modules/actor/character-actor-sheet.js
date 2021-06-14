import { HMActorSheet } from './actor-sheet.js';

export class HMCharacterActorSheet extends HMActorSheet {

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["hackmaster", "sheet", "actor"],
            template: "systems/hackmaster5e/templates/actor/actor-base.hbs",
            width: 820,
            height: 750,
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "skills" }]
        });
    }

    /* -------------------------------------------- */

    /** @override */
    getData() {
        const data = super.getData();
        data.dtypes = ["String", "Number", "Boolean"];

        // Prepare items.
        if (this.actor.data.type == 'character') {
            this._prepareCharacterItems(data);
        }

        return data;
    }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
    async _prepareCharacterItems(sheetData) {
        const actorData = sheetData.actor;

        // Initialize containers.
        const armors = [];
        const uskills = [];
        const skills = [];
        const gear = [];
        const spells = [];
        const wounds = [];
        const weapons = [];
        const profs = [];
        const features = [];
        let race = null;
        const character_classes = [];

        // Iterate through items, allocating to containers
        for (let i of sheetData.items) {
            i.img = i.img || DEFAULT_TOKEN;
            switch(i.type) {
                case "armor":
                    gear.push(i);
                    armors.push(i);
                    break;
                case "character_class":
                    character_classes.push(i);
                    break;
                case "item":
                    gear.push(i);
                    break;
                case "proficiency":
                    profs.push(i);
                    break;
                case "skill":
                    if (i.data.universal.checked) {
                        uskills.push(i);
                    } else {
                        skills.push(i);
                    }
                    break;
                case "features":
                    features.push(i);
                    break;
                case "spell":
                    spells.push(i);
                    break;
                case "race":

                    // Swap race objects.
                    // TODO: Is this the best place to make this check?
                    if (race) {
                        const oldId = race._id;
                        const oldRace = this.actor.items.get(oldId);
                        await oldRace.delete();
                    }
                    race = i;
                    break;
                case "weapon":
                    gear.push(i);
                    weapons.push(i);
                    break;
                case "wound":
                    wounds.push(i);
                    break;
            }
        }

        // Assign and return
        actorData.armors = armors;
        actorData.gear = gear;
        actorData.skills = skills;
        actorData.uskills = uskills;
        actorData.features = features;
        actorData.spells = spells;
        actorData.wounds = wounds;
        actorData.weapons = weapons;
        actorData.profs = profs;
        actorData.race = race;
        actorData.character_classes = character_classes.sort((a, b) => { return a.data._ord - b.data._ord });

        if (actorData.character_classes) {
            const cclength = actorData.character_classes.length;
            actorData.curr_class = actorData.character_classes[cclength -1];
        }
    }
}

import { HMActorSheet } from './actor-sheet.js';

export class HMCharacterActorSheet extends HMActorSheet {
    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['hackmaster', 'sheet', 'actor'],
            template: 'systems/hackmaster5e/templates/actor/actor-base.hbs',
            width: 820,
            height: 950,
            tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'skills' }]
        });
    }

    /* -------------------------------------------- */

    /** @override */
    getData() {
        const data = super.getData();
        data.dtypes = ['String', 'Number', 'Boolean'];

        // Prepare items.
        if (this.actor.data.type === 'character') {
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
        const langs = [];
        const gear = [];
        const spells = [];
        const wounds = [];
        const weapons = [];
        const profs = [];
        const features = [];
        let race = null;
        let cclass = null;

        // Iterate through items, allocating to containers
        for (const i of sheetData.items) {
            i.img = i.img || DEFAULT_TOKEN;
            if (i.type === 'armor') {
                gear.push(i);
                armors.push(i);
            } else
            if (i.type === 'cclass')      { cclass = i;    } else
            if (i.type === 'item')        { gear.push(i);  } else
            if (i.type === 'proficiency') { profs.push(i); } else
            if (i.type === 'skill') {
                if (i.data.language.checked) { langs.push(i); } else
                    i.data.universal.checked ? uskills.push(i) : skills.push(i);
            } else
            if (i.type === 'spell')  { spells.push(i);     } else
            if (i.type === 'race')   { race = i;           } else
            if (i.type === 'weapon') {
                gear.push(i);
                weapons.push(i);
            } else
            if (i.type === 'wound')  { wounds.push(i);     }
        }

        // Assign and return
        actorData.armors = armors;
        actorData.gear = gear;
        actorData.skills = {skills, uskills, langs};
        actorData.features = features;
        actorData.spells = spells;
        actorData.wounds = wounds;
        actorData.weapons = weapons;
        actorData.profs = profs;
        actorData.race = race;
        actorData.cclass = cclass;
    }
}

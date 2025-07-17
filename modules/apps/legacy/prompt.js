/* eslint class-methods-use-this: ['error', {'exceptMethods': ['dialogResp', 'getCapList']}] */
import { idx } from '../../tables/dictionary.js';
import { HMCONST, SYSTEM_ID } from '../../tables/constants.js';

export class HMPrompt extends Application {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['form', 'dialog'],
      popOut: true,
      minimizable: false,
      width: 400,
    });
  }

  constructor(dialogData, options) {
    super();
    foundry.utils.mergeObject(this.options, options);
    this.dialogData = dialogData;
  }

  /**
   * Transforms an array into an object with keys as the index and a
   * property as the array elements.
   * This is suitable for the selectOptions handlebar helper.
   *
   * @param {Array} arr - The array to be transformed.
   * @param {string} prop - The property to be used as a key.
   * @returns {Object} An object with the array indices as keys and
   * the array elements as values.
   */
  static getSelectFromProperty(arr, prop) {
    return arr.reduce((obj, element, i) => {
      const value = foundry.utils.getProperty(element, prop);
      return { ...obj, [i]: value };
    }, {});
  }

  /*
   * Retrieves the id of the last weapon used by this actor. Returns 0 if this weapon
   * is no longer present in the provided list of weapons.
   * @param {Object} data - Data containing caller and weapons list.
   * @param {HMActor} data.caller - The actor making the attack.
   * @param {HMWeaponProfile[]} data.weapons - List of weapons.
   * @returns {number} Index of the last weapon, or 0 if not found.
   */
  static getLastWeaponIndex(data) {
    const { caller, weapons } = data;
    const lastWeaponId = caller.getFlag(SYSTEM_ID, 'lastWeapon');
    const wIdx = weapons.findIndex((w) => w.weapon.id === lastWeaponId);
    return wIdx === -1 ? 0 : wIdx;
  }

  getCapList(weapon, actor = null, inCombat = true) {
    const isDefend = this.constructor.name === 'DefendPrompt';
    const isRanged = weapon.system.ranged.checked;

    const capsArr = isDefend
      ? weapon.capabilities.filter((x) => x >= 64)
      : weapon.capabilities.filter((x) => x < 64);

    const { special } = idx;
    const capsObj = Object.fromEntries(capsArr.map((x) => [x, special[x]]));

    if (actor.canBackstab && !isRanged && !isDefend) {
      capsObj[HMCONST.SPECIAL.FLEEING] = special[HMCONST.SPECIAL.FLEEING];
    }
    if (!inCombat) delete capsObj[HMCONST.SPECIAL.RESET];
    return capsObj;
  }

  getData() {
    return this.dialogData;
  }

  update({ render }) {
    if (render) this.render();
  }

  get dialogResp() {
    return {};
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.ready(() => html.find('.focus').focus());

    html.on('click', '.dialog-button', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      const { dataset } = ev.currentTarget;
      const { prop, value, button } = dataset;

      if (prop) this.dialogData[prop] = value;
      if (button) this.dialogData.button = button;
      this.update({ render: false });
      this.options.resolve(this.dialogResp);
      this.close();
    });

    // TODO: Better types handling
    html.on('change', '.bind', async (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      const { dataset } = ev.currentTarget;
      const { checked, type, value } = ev.target;
      const { render, prop } = dataset;
      this.dialogData[prop] = type === 'checkbox' ? checked : value;
      this.update({ render });
    });
  }
}

/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Witch Iron system.
 * @extends {Actor}
 */
export class WitchIronActor extends Actor {

  /** @override */
  prepareData() {
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
  }

  /** @override */
  prepareDerivedData() {
    const actorData = this.data; // Fix here
    const systemData = this.data.data; // Fix here

    // Prepare data for each Actor type
    if (actorData.type === 'descendant') {
      this._prepareDescendantData(systemData);
    } else if (actorData.type === 'npc') {
      this._prepareNpcData(systemData);
    }
  }

  /**
   * Prepare Descendant type specific data
   */
  _prepareDescendantData(systemData) {
    // Make modifications to data here. For example:
    const abilities = systemData.attributes.abilities;

    // Loop through abilities, and calculate their modifiers.
    for (const key in abilities) {
      abilities[key].mod = Math.floor((abilities[key].value - 10) / 2);
    }
  }

  /**
   * Prepare NPC type specific data.
   */
  _prepareNpcData(systemData) {
    // Make modifications to data here. For example:
    const HD = systemData.HD;
    systemData.xp = (HD * HD) * 100;
  }

  /**
   * Override getRollData() that's supplied to rolls.
   */
  getRollData() {
    const data = super.getRollData();

    // Prepare character roll data.
    this._getDescendantRollData(data);
    this._getNpcRollData(data);

    return data;
  }

  /**
   * Prepare descendant roll data.
   */
  _getDescendantRollData(data) {
    if (this.type !== 'descendant') return;

    // Copy the ability scores to the top level, so that rolls can use
    // formulas like `@str.mod + 4`.
    if (data.attributes.abilities) {
      for (let [k, v] of Object.entries(data.attributes.abilities)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }

    // Add level for easier access, or fall back to 0.
    if (data.attributes.level) {
      data.lvl = data.attributes.level.value ?? 0;
    }
  }

  /**
   * Prepare NPC roll data.
   */
  _getNpcRollData(data) {
    if (this.type !== 'npc') return;

    // Process additional NPC data here.
  }

}

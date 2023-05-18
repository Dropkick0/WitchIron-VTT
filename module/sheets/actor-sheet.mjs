import { onManageActiveEffect, prepareActiveEffectCategories } from "../helpers/effects.mjs";

export class WitchIronActorSheet extends ActorSheet {

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["witchiron", "sheet", "actor"],
      template: "systems/witchiron/templates/actor/actor-sheet.html",
      width: 600,
      height: 600,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "features" }]
    });
  }

  get template() {
    const templateName = this.actor.type === 'descendant' ? 'actor-descendant-sheet' : 'actor-npc-sheet';
    return `systems/witchiron/templates/actor/${templateName}.html`;
  }

  getData() {
    const context = super.getData();
    const actorData = this.actor.toObject(false);

    context.system = actorData.system;
    context.flags = actorData.flags;

    if (actorData.type == 'descendant') {
      this._prepareItems(context);
      this._prepareDescendantData(context);
    }

    if (actorData.type == 'npc') {
      this._prepareItems(context);
    }

    context.rollData = context.actor.getRollData();
    context.effects = prepareActiveEffectCategories(this.actor.effects);

    return context;
  }

_prepareDescendantData(context) {
  if (context.system && context.system.abilities) {
    for (let [k, v] of Object.entries(context.system.abilities)) {
      v.label = game.i18n.localize(CONFIG.WITCHIRON.abilities[k]) ?? k;
    }
    // Add fields for Lineages, Genetic Traits, and Demonic Influence
    context.system.lineages = context.system.lineages || [];
    context.system.geneticTraits = context.system.geneticTraits || [];
    context.system.demonicInfluence = context.system.demonicInfluence || 0;
  } else {
    console.warn("Actor abilities are undefined or context.system is not defined.");
  }
}

  _prepareItems(context) {
    const gear = [];
    const features = [];
    const spells = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
      8: [],
      9: []
    };
    const genetic_traits = [];
    const lineages = [];
  const alchemy = [];
  const inventing = [];
  const spellWriting = [];
  const miracleWorking = [];

  for (let i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;
      if (i.type === 'item') {
        gear.push(i);
      }
      else if (i.type === 'talent') {
        features.push(i);
      }
      else if (i.type === 'spell') {
        if (i.system.spellLevel != undefined) {
          spells[i.system.spellLevel].push(i);
        }
      }
      else if (i.type === 'genetic_trait') {
        genetic_traits.push(i);
      }
      else if (i.type === 'lineage') {
        lineages.push(i);
      }
    else if (i.type === 'alchemy') {
      alchemy.push(i);
    }
    else if (i.type === 'inventing') {
      inventing.push(i);
    }
    else if (i.type === 'spellWriting') {
      spellWriting.push(i);
    }
    else if (i.type === 'miracleWorking') {
      miracleWorking.push(i);
    }
  }

    context.gear = gear;
    context.features = features;
    context.spells = spells;
    context.genetic_traits = genetic_traits;
    context.lineages = lineages;
  context.alchemy = alchemy;
  context.inventing = inventing;
  context.spellWriting = spellWriting;
  context.miracleWorking = miracleWorking;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    if (!this.isEditable) return;

    html.find('.item-create').click(this._onItemCreate.bind(this));

    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    // Active Effect management
    html.find(".effect-control").click(ev => onManageActiveEffect(ev, this.actor));

    // Rollable abilities.
    html.find('.rollable').click(this._onRoll.bind(this));

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = ev => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }
  }

  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    const type = header.dataset.type;
    const data = duplicate(header.dataset);
    const name = `New ${type.capitalize()}`;
    const itemData = {
      name: name,
      type: type,
      system: data
    };
    delete itemData.system["type"];
    return await Item.create(itemData, {parent: this.actor});
  }
}

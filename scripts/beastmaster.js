import { log, moduleName } from './common.js';

const getBeastMaster = (item) => {
  const bmName = item?.actor?.getFlag(moduleName, 'beastmaster');
  if (!bmName) {
    return null;
  }
  const bm = game.actors.filter((a) => a.name === bmName)[0];
  if (bm) {
    log('beastmaster found', bm);
    return bm;
  }
  return null;
};

// Used in wrapper.js
export const getSaveDC = (item, dc) => {
  const bm = getBeastMaster(item);
  if (bm) {
    return bm.data.data.attributes.spelldc;
  }
  return dc;
};

// Used in wrapper.js
export const getAttackToHit = (item, roll) => {
  const bm = getBeastMaster(item);
  if (bm) {
    const wis = bm.data.data.abilities.wis.mod;
    roll.parts = roll.parts.map((p) => (p === '@mod' ? wis : p));
  }

  return roll;
};

// Conversions to other forms

const beastData = {
  land: {
    abilities: {
      str: { value: 14 },
      dex: { value: 14 },
      con: { value: 15 },
    },
    attributes: {
      movement: {
        climb: 40,
        fly: null,
        swim: null,
        walk: 40,
      },
    },
    traits: {
      size: 'med',
    },
  },

  sea: {
    abilities: {
      str: { value: 14 },
      dex: { value: 14 },
      con: { value: 15 },
    },
    attributes: {
      movement: {
        climb: null,
        fly: null,
        swim: 60,
        walk: 5,
      },
    },
    traits: {
      size: 'med',
    },
  },

  sky: {
    abilities: {
      str: { value: 6 },
      dex: { value: 16 },
      con: { value: 13 },
    },
    attributes: {
      movement: {
        climb: null,
        fly: 60,
        swim: null,
        walk: 10,
      },
    },
    traits: {
      size: 'sm',
    },
  },
};

const updateItems = async (document, beastType) => {
  await document.items.forEach(async (item) => {
    const req = (item.data.data.requirements || item.data.data.activation?.condition || '').toLowerCase();
    if (req.startsWith('beast of the ')) {
      const shouldFav = req.endsWith(beastType);
      const isFav = item.data.flags.favtab?.isFavorite || false;
      if (isFav !== shouldFav) {
        await item.update({ 'flags.favtab.isFavorite': shouldFav });
      }
    }
  });
};

const updateHitDice = async (document, beastType) => {
  const hd = beastType === 'sky' ? 'd6' : 'd8';
  await document.classes['beastmaster-companion'].update({ 'data.hitDice': hd });
};

const getMeta = (document) => document.getFlag(moduleName, 'beastmasterMeta') || {};

const saveMeta = async (document, newBeastType) => {
  if (!['sea', 'land', 'sky'].includes(newBeastType)) {
    return;
  }
  log(`save meta for Beast of the ${newBeastType}`);

  const oldBeastType = document.data.data.details.background.toLowerCase();
  const oldMeta = getMeta(document);
  const meta = {
    sea: {
      img: oldMeta?.sea?.img,
      tokenImg: oldMeta?.sea?.tokenImg,
    },
    land: {
      img: oldMeta?.land?.img,
      tokenImg: oldMeta?.land?.tokenImg,
    },
    sky: {
      img: oldMeta?.sky?.img,
      tokenImg: oldMeta?.sky?.tokenImg,
    },
  };

  meta[oldBeastType] = {
    img: document.data.img,
    tokenImg: document.data.token.img,
  };

  await document.setFlag(moduleName, 'beastmasterMeta', meta);
};

const setBeastType = async (document, newBeastType) => {
  log(`setting Beast of the ${newBeastType}`);

  const meta = getMeta(document)[newBeastType.toLowerCase()];
  const img = meta?.img;
  const data = { ...beastData[newBeastType] };
  const token = { img: meta?.tokenImg };

  await document.update({ data, img, token });
  await updateItems(document, newBeastType);
  await updateHitDice(document, newBeastType);

  // Update tokens
  const tokens = document.getActiveTokens();
  const updates = tokens.map((t) => mergeObject(duplicate(t.data), document.data.token));

  if (updates.length) {
    await canvas.scene.updateEmbeddedDocuments('Token', updates);
  }
};

const onBmType = async (document, change, apply) => {
  const newBeastType = change.data?.details?.background?.toLowerCase();
  const masterName = document.data?.data?.details?.alignment;

  const wrap = async (wrapped) => {
    const bm = game.actors.filter((a) => a.name === masterName)[0];
    if (bm) {
      await wrapped(document, newBeastType);
    }
  };

  if (masterName) {
    if (newBeastType === 'land') await wrap(apply);
    if (newBeastType === 'sea') await wrap(apply);
    if (newBeastType === 'sky') await wrap(apply);
  }
};

const saveBeastMasterMeta = async (document, change, options, userId) => {
  if (userId === game.userId) {
    await onBmType(document, change, saveMeta);
  }
};

const setBeastMasterType = async (document, change, options, userId) => {
  if (game.combat) {
    console.log(change);
  }
  if (userId === game.userId) {
    await onBmType(document, change, setBeastType);
  }
};

// Set the beast initiative to the ranger
const applyInitiative = (combatant, change) => {
  if (!game.user.isGM || combatant.actor.classes.ranger === undefined || change.initiative === undefined) {
    return;
  }

  const masterName = combatant.actor.name;
  const beast = game.actors.find((a) => a.data.data.details.alignment === masterName);
  const id = game.combat.combatants.find((v) => v.data.actorId === beast.id)?.id;
  if (id) {
    game.combat.setInitiative(id, change.initiative);
  }
};

Hooks.on('preUpdateActor', saveBeastMasterMeta);
Hooks.on('updateActor', setBeastMasterType);
Hooks.on('updateCombatant', applyInitiative);

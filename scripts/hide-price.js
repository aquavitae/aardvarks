import { moduleName } from './common.js';

const showPriceRangeToPlayer = (html, priceRange) => {
  const priceInput = $(html).find('input[name="data.price"]');
  priceInput.replaceWith(
    `<input type="text" name="data.flags.aardvarks.priceRange" value="${priceRange}" data-dtype="String">`
  );
};

const addPriceRangeButtonForGM = (html, priceRange, hidePrice) => {
  const priceInput = $(html).find('input[name="data.price"]');
  priceInput.closest('.form-group').after(
    `<div class="form-group">
      <label>Range</label>
      <input type="text" name="data.flags.aardvarks.priceRange" value="${priceRange}" data-dtype="String">
    </div>
    <div class="form-group">
      <label>Show range</label>
      <input type="checkbox" name="data.flags.aardvarks.hidePrice" data-dtype="Boolean" ${
        hidePrice ? 'checked' : ''
      } style="max-width:16px">
    </div>`
  );
};

const showHidePrice = async (app, html, data) => {
  const flags = data.data.flags || {}
  const hidePrice = !!flags[moduleName]?.hidePrice;
  const priceRange = flags[moduleName]?.priceRange || '';

  if (game.user.isGM) {
    addPriceRangeButtonForGM(html, priceRange, hidePrice);
  } else if (hidePrice) {
    showPriceRangeToPlayer(html, priceRange);
  }
};

Hooks.on('renderTidy5eItemSheet', showHidePrice);

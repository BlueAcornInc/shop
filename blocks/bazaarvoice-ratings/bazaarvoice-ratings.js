/*
 * Bazaarvoice inline ratings on product tiles: listings, search,
 * recommendations and (optionally) the cart. Tiles in the cart, mini-cart and
 * cross-sell areas follow showCartStars; all other tiles follow
 * showInlineStars. Place this block on the pages that list products.
 */
import {
  getTileSku,
  isCartTile,
  isOn,
  loadBv,
  loadBvConfig,
} from "../bazaarvoice/bv-common.js";

const TILE_SELECTOR =
  ".dropin-product-item-card, .ds-sdk-product-item, .ds-sdk-product-card, .product-teaser";

const addInlineRating = (tile, config) => {
  if (tile.querySelector('[data-bv-show="inline_rating"]')) return;
  if (!isOn(config, isCartTile(tile) ? "showCartStars" : "showInlineStars")) {
    return;
  }
  const sku = getTileSku(tile);
  if (!sku) return;

  const rating = document.createElement("div");
  rating.className = "bazaarvoice-inline-rating";
  rating.dataset.bvShow = "inline_rating";
  rating.dataset.bvProductId = sku;
  const link = tile.querySelector("a[href*='/products/']");
  if (link) rating.dataset.bvRedirectUrl = link.href;

  const actions = tile.querySelector(
    ".add-to-cart, [data-testid='add-to-cart'], button[name='add-to-cart']",
  );
  if (actions?.parentElement) {
    actions.parentElement.insertBefore(rating, actions);
  } else {
    tile.append(rating);
  }
};

export default async function decorate(block) {
  const config = await loadBvConfig();
  if (!config) return;
  if (!isOn(config, "showInlineStars") && !isOn(config, "showCartStars")) {
    return;
  }

  const scan = () =>
    document
      .querySelectorAll(TILE_SELECTOR)
      .forEach((tile) => addInlineRating(tile, config));

  scan();
  await loadBv(config);

  // Tiles render asynchronously (drop-ins, infinite scroll, recommendations).
  let timer;
  const observer = new MutationObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(scan, 300);
  });
  observer.observe(document.querySelector("main") || document.body, {
    childList: true,
    subtree: true,
  });

  block.closest(".section")?.classList.add("bazaarvoice-ratings-loaded");
}

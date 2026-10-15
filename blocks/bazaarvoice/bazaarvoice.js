/*
 * Bazaarvoice on the product page: the rating summary by the product title,
 * the reviews widget and questions and answers. Each touchpoint follows its
 * App Management switch (showStarSummary, showReviews, showQna).
 */
import { getPdpSku, isOn, loadBv, loadBvConfig } from "./bv-common.js";

const container = (show, productId) => {
  const el = document.createElement("div");
  el.dataset.bvShow = show;
  el.dataset.bvProductId = productId;
  return el;
};

export default async function decorate(block) {
  const config = await loadBvConfig();
  if (!config) return;

  const productId = getPdpSku();
  if (!productId) return;

  let rendered = false;
  if (isOn(config, "showStarSummary")) {
    const summary = document.createElement("div");
    summary.className = "bazaarvoice-summary";
    summary.append(container("rating_summary", productId));
    const title = document.querySelector(
      ".pdp-header__title, .product-details__header h1, main h1",
    );
    if (title) {
      title.after(summary);
    } else {
      block.prepend(summary);
    }
    rendered = true;
  }
  if (isOn(config, "showReviews")) {
    block.append(container("reviews", productId));
    rendered = true;
  }
  if (isOn(config, "showQna")) {
    block.append(container("questions", productId));
    rendered = true;
  }

  if (rendered) {
    await loadBv(config);
  }
}

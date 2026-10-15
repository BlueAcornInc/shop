/**
 * Shared helpers for the Bazaarvoice blocks (bazaarvoice, bazaarvoice-ratings).
 */

/**
 * Resolves `getConfigValue` from whichever config module the storefront
 * provides: the drop-in tools config, or the boilerplate's scripts/configs.js.
 */
const resolveGetConfigValue = async () => {
  try {
    const mod = await import("@dropins/tools/lib/aem/configs.js");
    if (typeof mod.getConfigValue === "function") return mod.getConfigValue;
  } catch (e) {
    // not installed: try the boilerplate module below
  }
  try {
    const mod = await import("../../scripts/configs.js");
    if (typeof mod.getConfigValue === "function") return mod.getConfigValue;
  } catch (e) {
    // neither available
  }
  return async () => undefined;
};

/**
 * Adds the storefront's store view code to the config endpoint, so the app
 * returns that store view's settings (App Management scopes).
 */
const withStoreCode = async (endpoint, getConfigValue) => {
  if (!endpoint) return endpoint;
  let storeCode;
  try {
    storeCode =
      (await getConfigValue("headers.cs.Magento-Store-View-Code")) ||
      (await getConfigValue("commerce.headers.cs.Magento-Store-View-Code"));
  } catch (e) {
    storeCode = undefined;
  }
  if (!storeCode) return endpoint;
  const url = new URL(endpoint);
  url.searchParams.set("storeCode", storeCode);
  return url.toString();
};

let configPromise;

/**
 * Loads the public Bazaarvoice config once per page. Resolves to null when
 * the app is off or unreachable, so blocks can simply bail out.
 *
 * @returns {Promise<object|null>} The config, or null
 */
export const loadBvConfig = () => {
  if (!configPromise) {
    configPromise = (async () => {
      try {
        const getConfigValue = await resolveGetConfigValue();
        const endpoint = await withStoreCode(
          await getConfigValue("bazaarvoice-config-url"),
          getConfigValue,
        );
        if (!endpoint) return null;
        const response = await fetch(endpoint);
        if (!response.ok) return null;
        const data = await response.json();
        return data?.status === "on" ? data : null;
      } catch (e) {
        return null;
      }
    })();
  }
  return configPromise;
};

/**
 * A touchpoint switch from App Management. Missing means on, so older config
 * endpoints keep working.
 */
export const isOn = (config, name) => config?.[name] !== false;

/**
 * Builds the bv.js URL. Deployment zones are written lowercase with
 * underscores in the URL ("Main Site" becomes "main_site").
 */
export const bvScriptUrl = ({
  clientName,
  deploymentZone,
  environment,
  locale,
}) => {
  const zone = deploymentZone.trim().toLowerCase().replace(/\s+/g, "_");
  return `https://apps.bazaarvoice.com/deployments/${encodeURIComponent(
    clientName,
  )}/${encodeURIComponent(zone)}/${environment}/${locale}/bv.js`;
};

let bvPromise;

/**
 * Loads bv.js once per page.
 *
 * @param {object} config The public Bazaarvoice config
 * @returns {Promise<void>}
 */
export const loadBv = (config) => {
  if (!bvPromise) {
    bvPromise = import("../../scripts/aem.js").then(({ loadScript }) =>
      loadScript(bvScriptUrl(config)),
    );
  }
  return bvPromise;
};

/**
 * The SKU of the product on a PDP: the boilerplate's `sku` meta tag, then a
 * `?sku=` query parameter, then the last path segment.
 *
 * @returns {string|null} The SKU
 */
export const getPdpSku = () => {
  const meta = document.querySelector('meta[name="sku"]')?.content;
  if (meta) return meta;
  const fromQuery = new URLSearchParams(window.location.search).get("sku");
  if (fromQuery) return fromQuery;
  const segment = window.location.pathname.split("/").filter(Boolean).pop();
  return segment || null;
};

/**
 * The SKU behind a product tile: data attributes, the Product Discovery
 * payload, then the product link.
 *
 * @param {Element} tile A product tile
 * @returns {string|null} The SKU
 */
export const getTileSku = (tile) => {
  const fromData =
    tile?.dataset?.sku || tile?.dataset?.productSku || tile?.dataset?.productId;
  if (fromData) return fromData;
  try {
    const sku =
      tile?.dataset?.productData && JSON.parse(tile.dataset.productData).sku;
    if (sku) return sku;
  } catch (e) {
    // fall through to the link
  }
  const href = tile?.querySelector("a[href*='/products/']")?.href;
  if (!href) return null;
  const path = new URL(href, window.location.origin).pathname;
  return path.split("/").filter(Boolean).pop() || null;
};

/**
 * Whether a tile sits in the cart, mini-cart or cross-sell area.
 *
 * @param {Element} tile A product tile
 * @returns {boolean} True for cart tiles
 */
export const isCartTile = (tile) =>
  Boolean(
    tile.closest(
      ".commerce-cart, .commerce-mini-cart, .cart-cross-sell-products, .cart",
    ),
  ) || /^\/cart\b/.test(window.location.pathname);

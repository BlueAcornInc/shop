/*
 * One Cloudflare worker for every blueacornici.shop storefront.
 *
 * Based on Adobe's EDS BYO-CDN worker for Cloudflare. The subdomain picks the
 * origin from an explicit allowlist of SHOP_<LABEL>_ORIGIN vars, so this list
 * is also the list of EDS sites exposed on the domain:
 *
 *   blueacornici.shop              -> SHOP_ROOT_ORIGIN
 *   yotpo-staging.blueacornici.shop -> SHOP_YOTPO_STAGING_ORIGIN
 *
 * Unknown subdomains get a 404. Basic auth is opt-in per label with
 * SHOP_<LABEL>_AUTH = "basic", checked against the BASIC_AUTH secret
 * ("user:password"), until Cloudflare Access replaces it.
 */

import APPLE_MERCHANT_ASSOCIATION from './apple-merchant-association.js';

const ORIGIN_PATTERN = /^[a-z0-9-]+--[a-z0-9-]+--blueacorninc\.aem\.live$/;

const getExtension = (path) => {
  const basename = path.split('/').pop();
  const pos = basename.lastIndexOf('.');
  return (basename === '' || pos < 1) ? '' : basename.slice(pos + 1);
};

const isMediaRequest = (url) => /\/media_[0-9a-f]{40,}[/a-zA-Z0-9_-]*\.[0-9a-z]+$/.test(url.pathname);

/**
 * Var-name label for a hostname: the apex is ROOT, a subdomain is uppercased
 * with dashes turned into underscores. Null when the host isn't in the zone.
 */
export const labelFor = (hostname, zone) => {
  if (hostname === zone) return 'ROOT';
  const suffix = `.${zone}`;
  if (!hostname.endsWith(suffix)) return null;
  const sub = hostname.slice(0, -suffix.length);
  if (!/^[a-z0-9-]+$/.test(sub)) return null;
  return sub.toUpperCase().replace(/-/g, '_');
};

/** Secret-name suffix for an origin's EDS site: yotpo-v2--shop--org -> SHOP. */
export const siteFor = (origin) => origin.split('--')[1].toUpperCase().replace(/-/g, '_');

const unauthorized = () => new Response('Unauthorized', {
  status: 401,
  headers: { 'WWW-Authenticate': 'Basic realm="Restricted"' },
});

const timingSafeEqual = (a, b) => {
  const enc = new TextEncoder();
  const x = enc.encode(a);
  const y = enc.encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i += 1) {
    diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  }
  return diff === 0;
};

const authorized = (request, env) => {
  if (!env.BASIC_AUTH) return false; // fail closed if the secret is missing
  const expected = `Basic ${btoa(env.BASIC_AUTH)}`;
  return timingSafeEqual(request.headers.get('Authorization') || '', expected);
};

export const handleRequest = async (request, env) => {
  const url = new URL(request.url);
  const host = url.host;

  const label = labelFor(url.hostname, env.ZONE);
  const origin = label && env[`SHOP_${label}_ORIGIN`];
  if (!origin) {
    return new Response('Not Found', { status: 404 });
  }
  if (!ORIGIN_PATTERN.test(origin)) {
    return new Response('Invalid origin', { status: 500 });
  }

  // Apple Pay domain verification: no auth, no origin call.
  if (url.pathname === '/.well-known/apple-developer-merchantid-domain-association') {
    return new Response(APPLE_MERCHANT_ASSOCIATION, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  if (env[`SHOP_${label}_AUTH`] === 'basic' && !authorized(request, env)) {
    return unauthorized();
  }

  if (url.port) {
    // Cloudflare opens a couple more ports than 443, so we redirect visitors
    // to the default port to avoid confusion.
    const redirectTo = new URL(request.url);
    redirectTo.port = '';
    return new Response(`Moved permanently to ${redirectTo.href}`, {
      status: 301,
      headers: { location: redirectTo.href },
    });
  }
  if (url.pathname.startsWith('/drafts/')) {
    return new Response('Not Found', { status: 404 });
  }

  const extension = getExtension(url.pathname);
  const savedSearch = url.search;
  const { searchParams } = url;
  if (isMediaRequest(url)) {
    for (const [key] of [...searchParams.entries()]) {
      if (!['format', 'height', 'optimize', 'width'].includes(key)) {
        searchParams.delete(key);
      }
    }
  } else if (extension === 'json') {
    for (const [key] of [...searchParams.entries()]) {
      if (!['limit', 'offset', 'sheet'].includes(key)) {
        searchParams.delete(key);
      }
    }
  } else {
    // neither media nor json request: strip search params
    url.search = '';
  }
  searchParams.sort();

  url.hostname = origin;
  const req = new Request(url, request);
  req.headers.set('x-forwarded-host', host);
  req.headers.set('x-byo-cdn-type', 'cloudflare');
  req.headers.delete('authorization');
  if (env.PUSH_INVALIDATION) {
    req.headers.set('x-push-invalidation', 'enabled');
  }
  // EDS site authentication: each site has its own token, stored as the
  // AEM_TOKEN_<SITE> secret (site name from ref--site--org, uppercased).
  const siteToken = env[`AEM_TOKEN_${siteFor(origin)}`];
  if (siteToken) {
    req.headers.set('authorization', `token ${siteToken}`);
  }
  let resp = await fetch(req, {
    cf: {
      // cf doesn't cache html by default: need to override the default behavior
      cacheEverything: true,
    },
  });
  resp = new Response(resp.body, resp);
  if (resp.status === 301 && savedSearch) {
    const location = resp.headers.get('location');
    if (location && !location.match(/\?.*$/)) {
      resp.headers.set('location', `${location}${savedSearch}`);
    }
  }
  resp.headers.delete('age');
  resp.headers.delete('x-robots-tag');
  return resp;
};

export default {
  fetch: handleRequest,
};

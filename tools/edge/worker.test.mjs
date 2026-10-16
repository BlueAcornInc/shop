import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handleRequest, labelFor } from './worker.js';

const env = {
  ZONE: 'blueacornici.shop',
  SHOP_ROOT_ORIGIN: 'main--shop--blueacorninc.aem.live',
  SHOP_ROOT_AUTH: 'basic',
  SHOP_YOTPO_STAGING_ORIGIN: 'yotpo-v2--shop--blueacorninc.aem.live',
  SHOP_EVIL_ORIGIN: 'example.com',
  BASIC_AUTH: 'user:pw',
};

let fetched;
globalThis.fetch = async (req) => {
  fetched = req;
  return new Response('ok', { status: 200, headers: { age: '5' } });
};

const get = (url, headers = {}) => handleRequest(new Request(url, { headers }), env);

test('labels', () => {
  assert.equal(labelFor('blueacornici.shop', env.ZONE), 'ROOT');
  assert.equal(labelFor('yotpo-staging.blueacornici.shop', env.ZONE), 'YOTPO_STAGING');
  assert.equal(labelFor('blueacornici.shop.evil.com', env.ZONE), null);
  assert.equal(labelFor('a.b.blueacornici.shop', env.ZONE), null);
});

test('routes a subdomain to its origin, stripping auth and age', async () => {
  fetched = null;
  const resp = await get('https://yotpo-staging.blueacornici.shop/products/x?utm=1', { authorization: 'Basic abc' });
  assert.equal(resp.status, 200);
  assert.equal(new URL(fetched.url).hostname, 'yotpo-v2--shop--blueacorninc.aem.live');
  assert.equal(new URL(fetched.url).search, '');
  assert.equal(fetched.headers.get('x-forwarded-host'), 'yotpo-staging.blueacornici.shop');
  assert.equal(fetched.headers.get('authorization'), null);
  assert.equal(resp.headers.get('age'), null);
});

test('unknown subdomain is a 404 with no origin call', async () => {
  fetched = null;
  assert.equal((await get('https://nope.blueacornici.shop/')).status, 404);
  assert.equal(fetched, null);
});

test('rejects an origin outside blueacorninc EDS', async () => {
  assert.equal((await get('https://evil.blueacornici.shop/')).status, 500);
});

test('basic auth on the apex, checked before the origin call', async () => {
  fetched = null;
  assert.equal((await get('https://blueacornici.shop/')).status, 401);
  assert.equal((await get('https://blueacornici.shop/', { authorization: 'Basic d3Jvbmc6cHc=' })).status, 401);
  assert.equal(fetched, null);
  assert.equal((await get('https://blueacornici.shop/', { authorization: `Basic ${btoa('user:pw')}` })).status, 200);
});

test('auth fails closed without the secret', async () => {
  const r = await handleRequest(new Request('https://blueacornici.shop/'), { ...env, BASIC_AUTH: undefined });
  assert.equal(r.status, 401);
});

test('Apple Pay association served without auth', async () => {
  const r = await get('https://blueacornici.shop/.well-known/apple-developer-merchantid-domain-association');
  assert.equal(r.status, 200);
  assert.match(await r.text(), /^7B22/);
});

test('sends the per-site EDS token to the origin', async () => {
  const withTokens = { ...env, AEM_TOKEN_SHOP: 'hlx_shop', AEM_TOKEN_ADYEN: 'hlx_adyen' };
  await handleRequest(new Request('https://yotpo-staging.blueacornici.shop/', { headers: { authorization: 'Basic abc' } }), withTokens);
  assert.equal(fetched.headers.get('authorization'), 'token hlx_shop');
  assert.equal((await import('./worker.js')).siteFor('staging--adyen--blueacorninc.aem.live'), 'ADYEN');
});

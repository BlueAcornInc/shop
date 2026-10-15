# Cloudflare

`blueacornici.shop` and its subdomains are served by one worker, `shop-edge`, in
the Blue Acorn DevOps Cloudflare account. Source, config and tests are in
[`tools/edge/`](../tools/edge/).

Each subdomain maps to an EDS origin through a `SHOP_<LABEL>_ORIGIN` var in
`tools/edge/wrangler.toml` (the apex is `ROOT`; `yotpo-staging` becomes
`YOTPO_STAGING`). Subdomains without a var return 404, so that list is also the
list of sites exposed on the domain. Hosts containing `staging` load
`configs-stage` (see `scripts/configs.js`).

Basic auth is opt-in per label (`SHOP_<LABEL>_AUTH = "basic"`) and checks the
`BASIC_AUTH` worker secret. It's never written into source.

To add a storefront: add its var, add a proxied `AAAA 100::` DNS record (or rely
on the wildcard), deploy, and add the host to the EDS site's CDN config so
publishes purge the cache.

```bash
cd tools/edge
node --test worker.test.mjs
npx wrangler deploy
```

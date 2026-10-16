# Cloudflare

`blueacornici.shop` and its subdomains are served by one worker, `shop-edge`, in
the Blue Acorn DevOps Cloudflare account. Source, config and tests are in
[`tools/edge/`](../tools/edge/).

Each subdomain maps to an EDS origin through a `SHOP_<LABEL>_ORIGIN` var in
`tools/edge/wrangler.toml` (the apex is `ROOT`; `yotpo` becomes `YOTPO`).
Subdomains without a var return 404, so that list is also the list of sites
exposed on the domain, and everything on it is public.

The EDS origins require site authentication (see
[Authentication.md](./Authentication.md)). The worker sends each site's token
from the `AEM_TOKEN_<SITE>` secret (`AEM_TOKEN_SHOP` for `*--shop--*`). Staging
is the branch's `.aem.page` preview behind the Sidekick login, not a `.shop`
host.

Basic auth is still available per label (`SHOP_<LABEL>_AUTH = "basic"`, checked
against the `BASIC_AUTH` secret) but nothing uses it now.

To add a storefront: add its var, add a proxied `AAAA 100::` DNS record (or rely
on the wildcard), deploy, and add the host to the EDS site's CDN config so
publishes purge the cache.

```bash
cd tools/edge
node --test worker.test.mjs
npx wrangler deploy
```

# Authentication

The `shop` site uses [EDS site authentication](https://www.aem.live/docs/authentication-setup-site),
so the raw `*.aem.page` and `*.aem.live` hosts require a Sidekick login. Production is public
through the `blueacornici.shop` Cloudflare worker (see [cloudflare.md](./cloudflare.md)).

| Where | Who can see it |
|---|---|
| `blueacornici.shop`, `<label>.blueacornici.shop` | Everyone (prod) |
| `<branch>--shop--blueacorninc.aem.page` (staging / preview) | `*@blueacornici.com`, `*@groupinfosys.com` via Sidekick |
| `<branch>--shop--blueacorninc.aem.live` | Same, plus the worker's site token |

Staging for an app is its branch's preview, e.g. `https://yotpo-v2--shop--blueacorninc.aem.page/`.
`scripts/configs.js` loads `configs-stage` on any `.aem.page` host. Don't add `*-staging` labels
to the worker: anything it serves is public, since it sends the site token.

## Current config

```json
{
  "site": {
    "allow": ["*@blueacornici.com", "*@groupinfosys.com"],
    "secretId": ["<id of the token the worker uses>"]
  }
}
```

The Commerce picker Sidekick plugin loads from `https://blueacornici.shop/tools/picker/...` so it
works inside the DA editor without the aem.live login.

## Changing it

You need an `admin.hlx.page` login (`AUTH_TOKEN` is the `auth_token` cookie).

```bash
# read
curl -s -H "x-auth-token: $AUTH_TOKEN" https://admin.hlx.page/config/blueacorninc/sites/shop/access.json

# set (overwrites the whole site object)
curl -s -X POST -H "x-auth-token: $AUTH_TOKEN" -H 'content-type: application/json' \
  https://admin.hlx.page/config/blueacorninc/sites/shop/access/site.json \
  --data '{"allow": ["*@blueacornici.com", "*@groupinfosys.com"], "secretId": ["<id>"]}'
```

### Rotating the worker's site token

1. `POST .../sites/shop/secrets.json` (empty body) returns `{ id, value }`. Never commit `value`.
2. Store `value` as the worker secret `AEM_TOKEN_SHOP` (`wrangler secret put AEM_TOKEN_SHOP`).
3. Add the new `id` to `secretId`, check `blueacornici.shop`, then remove the old id and
   `DELETE .../sites/shop/secrets/<old-id>.json`.

A token pasted into an earlier version of this file was revoked on 2026-10-16.

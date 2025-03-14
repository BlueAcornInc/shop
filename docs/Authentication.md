
# Authentication

This guide explains how to manipulate the authentication scheme so we can protect domains before they are ready. These pages could potentially have NDA-breaking content so we want to be sure to protect it! Follows [this guide](https://www.aem.live/docs/authentication-setup-site). 

## How This Works

Check out the [Config Service Setup](./Config_Service_Setup.md) guide to use the Config Service, and walk through the guide below for new sites. 

Next, ensure you have the [AEM Sidekick Chrome Extension](https://chromewebstore.google.com/detail/aem-sidekick/igkmdomcgoebiipaifhmpfjhbjccggml?pli=1) which presents the login page and makes it all work.

Now, when you go to am aem.live or aem.page url where this is enabled, you'll be presented with a login screen if you have the sidekick enabled. Otherwise, you'll simply see a plaintext error.


## Protecting a Site

This will use login providers like Google and Microsoft to ensure rights to access. Currently configured to allow groupinfosys.com and adobe.com users to access.

First, generate the secret key:

```bash
curl -i --header "Cookie: auth_token=$AUTH_TOKEN" https://admin.hlx.page/config/blueacorninc/sites/shop/secrets.json -X POST
```

Now set up the authentication scheme...

```bash
curl -i --header "Cookie: auth_token=$AUTH_TOKEN" -X POST https://admin.hlx.page/config/blueacorninc/sites/shop-stripe/access/site.json \
  -H 'content-type: application/json' \
  --data '{
    "admin": ["*@groupinfosys.com", "*@adobe.com"]
  }'
```

## Go-Live

Let's also roll it back, so we can go live!!

```bash
curl -i --header "Cookie: auth_token=$AUTH_TOKEN" -X POST https://admin.hlx.page/config/blueacorninc/sites/shop-stripe/access/site.json   -H 'content-type: application/json' \
  --data '{

  }'
```

curl -i --header "Cookie: auth_token=$AUTH_TOKEN" \
     --header "Content-Type: application/json" \
     -X POST \
     --data '{"public": true}' \
     https://admin.hlx.page/config/blueacorninc/sites/shop-stripe/access/site.json


## Securing The Endpoint

Not sure, but may be desirable to only access this from https://blueacornici.shop, in this scheme we would setup a Cloudflare Cloud Worker that uses a auth token to fetch the request. 

This token can be fetched from the valuei n the first step above. Keep in mind, generating a new token kills the old ones!

```bash
curl https://main--shop--blueacorninc.aem.live \
  -H 'authorization: token hlx_Z5sf_WEE0HDkJqnCm1pa7-r5xLxnRMnZhEcGZjDhQUg'
```
Remove the 401 auth...

```bash
curl -i --header "Cookie: auth_token=$AUTH_TOKEN" \
     -X DELETE \
     https://admin.hlx.page/config/blueacorninc/sites/shop-stripe/access/site.json
```


Let's add some admins...

```bash
curl -i --header "Cookie: auth_token=$AUTH_TOKEN" \
     --header "Content-Type: application/json" \
     -X POST \
     --data '{"admins": ["doug.hatcher@blueacornici.com", "daniel.zaretsky@blueacornici.com", "sam.davis-castro@blueacornici.com"]}' \
     https://admin.hlx.page/config/blueacorninc/sites/shop-stripe/access/site.json
```


# Initial Config Setup

This is required to get the storefront to show in any capacity. Follows [this guide](https://www.aem.live/docs/config-service-setup) and omits a few sections that aren't strictly needed.

```bash
curl -i --header "Cookie: auth_token=$AUTH_TOKEN" -X POST https://admin.hlx.page/config/blueacorninc/sites/shop.json \
  -H 'content-type: application/json' \
  --data '{
  "code": {
    "owner": "blueacorninc",
    "repo": "shop"
  },
  "content": {
    "source": {
      "url": "https://drive.google.com/drive/folders/179XQRGrmVxZMR7V_EapUWPa7D-nlrcZU?usp=sharing"
    }
  }
}'
```

```bash
curl -i --header "Cookie: auth_token=$AUTH_TOKEN" -X POST https://admin.hlx.page/config/blueacorninc/sites/shop/code.json \
  -H 'content-type: application/json' \
  --data '{
	"owner": "blueacorninc",
	"repo": "shop"
}'
```

```bash
curl -i --header "Cookie: auth_token=$AUTH_TOKEN" -X POST https://admin.hlx.page/config/blueacorninc/sites/shop/headers.json \
  -H 'content-type: application/json' \
  --data '{
	"/**": [
      {
        "key": "access-control-allow-origin",
        "value": "*"
      }
    ]
}'
```

```bash
curl -i --header "Cookie: auth_token=$AUTH_TOKEN" -X POST https://admin.hlx.page/config/blueacorninc/sites/shop/folders.json \
  -H 'content-type: application/json' \
  --data '{ "/products/": "/products/default" }'
```

```bash
curl -i --header "Cookie: auth_token=$AUTH_TOKEN" -X POST https://admin.hlx.page/config/blueacorninc/sites/shop/robots.txt \
  -H 'content-type: text/plain' \
  --data 'User-agent: *
Disallow: /'
```
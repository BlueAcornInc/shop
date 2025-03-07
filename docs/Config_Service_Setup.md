# Config Service Setup

To login to the Admin Service, visit https://admin.hlx.page/login and follow one of the links to a login provider.

Once logged in, find the AUTH_TOKEN cookie value with your browser's DOM inspector.

Once you have the token, export it in a terminal session to begin working:

```bash
export AUTH_TOKEN='<AUTH_TOKEN cookie value from your browsers dom inspector>'
```

## Config Service Setup

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
      "url": "https://drive.google.com/drive/folders/179XQRGrmVxZMR7V_EapUWPa7D-nlrcZU"
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
  --data '{
        "/products/": "/products/default",
      "/apparel": "/categories/default",
      "/office": "/categories/default",
      "/lifestyle": "/categories/default",
      "/bags": "/categories/default",
      "/collections": "/categories/default" 
   }'
```

```bash
curl -i --header "Cookie: auth_token=$AUTH_TOKEN" -X POST https://admin.hlx.page/config/blueacorninc/sites/shop/robots.txt \
  -H 'content-type: text/plain' \
  --data 'User-agent: *
Disallow: /'
```

 ```bash
 curl -i --header "Cookie: auth_token=$AUTH_TOKEN" -X POST "https://admin.hlx.page/code/blueacorninc/shop-summit-stripe/main/*"
 ```

 ```bash
 curl -i --header "Cookie: auth_token=$AUTH_TOKEN" https://admin.hlx.page/config/blueacorninc/sites/shop-stripe.json
 ```

 ```bash
curl -i --header "Cookie: auth_token=$AUTH_TOKEN" -X POST https://admin.hlx.page/config/blueacorninc/sites/shop-summit-stripe/code.json \
  -H 'content-type: application/json' \
  --data '{
	"owner": "blueacorninc",
	"repo": "shop-summit"
}'
 ```



  ```bash
curl -i --header "Cookie: auth_token=$AUTH_TOKEN" -X POST "https://admin.hlx.page/preview/blueacorninc/shop-summit-stripe/main/*" \
  -H 'content-type: application/json' \
  --data '{
    "forceUpdate": true,
    "paths": [
    "/"
    ],
    "delete": true
}'
 ```



 ```bash
curl -i --header "Cookie: auth_token=$AUTH_TOKEN" -X POST https://admin.hlx.page/config/blueacorninc/sites/shop-stripe/content.json \
  -H 'content-type: application/json' \
  --data '{
  "contentBusId": "80b0fa5cb76574b2a936c24556eb360aade7eb2aa3a312919cfdbec03d3",
  "source": {
    "url": "https://content.da.live/blueacorninc/shop-stripe/",
    "type": "markup"
  }
}'
 ```
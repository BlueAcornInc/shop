# Setting up the Admin Config Service

- https://www.aem.live/docs/admin.html
- https://www.aem.live/docs/configuration
- https://www.aem.live/docs/config-service-setup

## Setting up the Services

* https://admin.hlx.page/login Login to the service

* https://admin.hlx.page/profile <- fetch the AUTH_TOKEN cookie that is set, then export it in your bash environment...


```bash
export AUTH_TOKEN="eyJhbGciOiJSUzI1NiIsImtpZCI6Ijdzb2k4N3pkb3NJRnc4b19fbVR5a082QlVRNEZBVGhjaHlyNGZqY1dSbWcifQ.eyJlbWFpbCI6ImRvdWcuaGF0Y2hlckBibHVlYWNvcm5pY2kuY29tIiwibmFtZSI6IkRvdWcgSGF0Y2hlciIsImlhdCI6MTc0MTE4NzU2NywiaXNzIjoiaHR0cHM6Ly9hZG1pbi5obHgucGFnZS8iLCJzdWIiOiIqLyoiLCJhdWQiOiI4M2EzNjM1NS1hZDE3LTRlZDAtODcwMS1lOTlhMzAyMGY4NmEiLCJleHAiOjE3NDEyNzM5Njd9.fAfnpjpR8JRXIJO5_xMxzjIx9nYJTh3gvcfqlLYMeVl2nzLwrx9lF74SxQIFC5yoQ50vl3tSQ_3QAlws8dpgLrlp384_pNApf5bV6ObFTKzaXOONwMInc6_inPenMscem6a_Hak5ycP1gHNbrhq8emebVV7pZdLC7aB0Z450mNhhzd0R77FdsGPWrylXrJgCEZEHXxxBdHuRihNNYBV_-KlaAVOX5daAZvPBpDGZb7ZkJuY0JF40uHXsGghtwZe6SpI3eXpJscjMfi5yPu4dN7zx1zVIaDimiHqvAtPn2Pw7SiS2Oe2glp4BKV9CP8Ib86w2ML17fr8DaSMiNuttLw"
```

```bash
curl https://admin.hlx.page/config/blueacorninc/sites/shop-summit.json   -H "x-auth-token: $AUTH_TOKEN"

```

- site base config is already there, can skip the following below:

```bash
curl -X PUT https://admin.hlx.page/config/blueacorninc/sites/shop-summit.json \
  -H 'content-type: application/json' \
  --header "Cookie: auth_token=$AUTH_TOKEN" \
  --data '{
  "version": 1,
  "code": {
    "owner": "acme",
    "repo": "website"
  },
  "content": {
    "source": {
      "url": "https://acme.sharepoint.com/sites/aem/Shared%20Documents/website"
    }
  }
}'

```

- thinking this is in a good spot, so let's set the auth provider to protect the admin:

first, let's get the existing headers so we're not breaking anything:

```bash
curl -i --header "Cookie: auth_token=$AUTH_TOKEN" https://admin.hlx.page/config/blueacorninc/sites/access/admin.json
```

Returns a 404, let's push one with what we care about:

```bash
curl -X POST https://admin.hlx.page/config/acme/sites/website/access/admin.json \
  -H 'content-type: application/json' \
  -H 'x-auth-token: <your-auth-token>' \
  --data '{
  "role": {
    "config": [
      "doug.hatcher@blueacornici.com",
    ]
  }
}'
```

## Site Authentication

- https://www.aem.live/docs/authentication-setup-site
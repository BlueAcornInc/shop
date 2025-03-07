# Cloudflare Workers

Richard Heywood should be able to help with this!

* https://dash.cloudflare.com/47add89f35ec876314098af14c265655/workers/services/view/shop-stripe/production/settings 

The way to set up an Adobe Commerce Storefront or EDS site live is typically through CDN-layer workers, in our case with Cloudflare.

This service worker adds  basic auth and flows data to the correct storefront.

It requires as worker variable...

```bash
ORGIN_HOSTNAME=main--shop-stripe--blueacorninc.aem.live
```
With the following worker logic:

```js
/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

'use strict';

const getExtension = (path) => {
  const basename = path.split('/').pop();
  const pos = basename.lastIndexOf('.');
  return (basename === '' || pos < 1) ? '' : basename.slice(pos + 1);
};

const isMediaRequest = (url) => /\/media_[0-9a-f]{40,}[/a-zA-Z0-9_-]*\.[0-9a-z]+$/.test(url.pathname);

const handleRequest = async (request, env, ctx) => {
  const url = new URL(request.url);
  if (url.port) {
    // Cloudflare opens a couple more ports than 443, so we redirect visitors
    // to the default port to avoid confusion. 
    // https://developers.cloudflare.com/fundamentals/reference/network-ports/#network-ports-compatible-with-cloudflares-proxy
    const redirectTo = new URL(request.url);
    redirectTo.port = '';
    return new Response('Moved permanently to ' + redirectTo.href, {
      status: 301,
      headers: {
        location: redirectTo.href
      }
    });
  }
  if (url.pathname.startsWith('/drafts/')) {
    return new Response('Not Found', { status: 404 });
  }

  const extension = getExtension(url.pathname);

  // remember original search params
  const savedSearch = url.search;

  // sanitize search params
  const { searchParams } = url;
  if (isMediaRequest(url)) {
    for (const [key] of searchParams.entries()) {
      if (!['format', 'height', 'optimize', 'width'].includes(key)) {
        searchParams.delete(key);
      }
    }
  } else if (extension === 'json') {
    for (const [key] of searchParams.entries()) {
      if (!['limit', 'offset', 'sheet'].includes(key)) {
        searchParams.delete(key);
      }
    }
  } else {
    // neither media nor json request: strip search params
    url.search = '';
  }
  searchParams.sort();
  
  url.hostname = env.ORIGIN_HOSTNAME;
  if (!url.origin.match(/^https:\/\/main--.*--.*\.(?:aem|hlx)\.live/)) {
    return new Response('Invalid ORIGIN_HOSTNAME', { status: 500 });
  }
  const req = new Request(url, request);
  req.headers.set('x-forwarded-host', req.headers.get('host'));
  req.headers.set('x-byo-cdn-type', 'cloudflare');
  if (env.PUSH_INVALIDATION) {
    req.headers.set('x-push-invalidation', 'enabled');
  }
  if (env.ORIGIN_AUTHENTICATION) {
    req.headers.set('authorization', `token ${env.ORIGIN_AUTHENTICATION}`);
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

  // basic auth start

  // Expected Authorization header value
  const expectedAuth = "Basic Ymx1ZWFjb3JuOnBhc3M0Ymx1ZWFjb3Ju";
    
  // Get the Authorization header from the request
  const authHeader = request.headers.get("Authorization");

  // Check if the Authorization header matches
  if (!authHeader || authHeader !== expectedAuth) {
    return new Response("Unauthorized", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Restricted"' }
    });
  }

  // basic auth end

  resp.headers.delete('age');
  resp.headers.delete('x-robots-tag');
  return resp;
};


export default {
  fetch: handleRequest,
};

```

## Removing Basic Auth

To remove, just redeploy the correct worker without the basic auth logic which you can find between comments with BASIC AUTH in them.


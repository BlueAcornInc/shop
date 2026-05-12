#!/usr/bin/env node

import { readFile } from 'node:fs/promises';

const baseUrl = process.env.E2E_BASE_URL || 'http://127.0.0.1:3000';

const fetchStatus = async (url) => {
  const response = await fetch(url);
  return response.status;
};

const hasTag = (html, tagName) => {
  const regex = new RegExp(`<${tagName}(\\s|>)`, 'i');
  return regex.test(html);
};

const readDependencies = async () => {
  const pkgRaw = await readFile(new URL('../../package.json', import.meta.url), 'utf8');
  const pkg = JSON.parse(pkgRaw);
  return pkg.dependencies || {};
};

const fetchHomepage = async () => {
  const candidates = ['/', '/index.html'];

  for (const path of candidates) {
    const url = `${baseUrl}${path}`;
    const response = await fetch(url);
    if (response.ok) {
      const html = await response.text();
      return { html, path };
    }
  }

  throw new Error(`No reachable storefront entry path at ${baseUrl} (tried ${candidates.join(', ')})`);
};

const integrationAssets = (dependencies) => {
  const assets = [];

  if (dependencies['@blueacorninc/storefront-storelocator']) {
    assets.push('/blocks/store-locator/store-locator.js');
    assets.push('/blocks/product-availability/product-availability.js');
  }

  if (dependencies['@blueacorninc/storefront-yotpo']) {
    assets.push('/blocks/yotpo/yotpo.js');
    assets.push('/blocks/yotpo-stars/yotpo-stars.js');
  }

  return assets;
};

const main = async () => {
  console.log(`[local-smoke] Base URL: ${baseUrl}`);

  const { html, path } = await fetchHomepage();
  const requiredTags = ['main'];

  requiredTags.forEach((tag) => {
    if (!hasTag(html, tag)) {
      throw new Error(`Missing <${tag}> in homepage HTML at ${path}`);
    }
  });

  console.log(`[local-smoke] Reachable page: ${path}`);
  console.log('[local-smoke] Theme shell check passed: <main> present');

  const dependencies = await readDependencies();
  const assets = integrationAssets(dependencies);

  if (!assets.length) {
    console.log('[local-smoke] No integration package detected in package.json');
    return;
  }

  for (const assetPath of assets) {
    const url = `${baseUrl}${assetPath}`;
    const status = await fetchStatus(url);
    if (status >= 400) {
      throw new Error(`Asset check failed (${status}) for ${url}`);
    }
    console.log(`[local-smoke] Asset OK (${status}): ${assetPath}`);
  }
};

main().catch((error) => {
  console.error(`[local-smoke] FAILED: ${error.message}`);
  process.exit(1);
});

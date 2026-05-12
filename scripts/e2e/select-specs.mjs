import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const deps = pkg.dependencies || {};

const specs = [
  'cypress/src/tests/e2eTests/verifyGuestUserCheckout.spec.js',
  'cypress/src/tests/e2eTests/verifyAuthUserCheckout.spec.js',
  'cypress/src/tests/e2eTests/theme/verifyThemeShell.spec.js',
];

if (deps['@blueacorninc/storefront-storelocator']) {
  specs.push('cypress/src/tests/e2eTests/integrations/verifyStoreLocatorAssets.spec.js');
}

if (deps['@blueacorninc/storefront-yotpo']) {
  specs.push('cypress/src/tests/e2eTests/integrations/verifyYotpoAssets.spec.js');
}

process.stdout.write(specs.join(','));

/* eslint-disable import/extensions */
const fs = require('fs');
const path = require('path');
const { dependencies } = require('./package.json');

// Define the dropins folder
const dropinsDir = path.join('scripts', '__dropins__');

// Ensure the dropins folder exists (don't wipe it — see below).
fs.mkdirSync(dropinsDir, { recursive: true });

// Copy each @dropins/* package that's both in node_modules AND declared in
// package.json dependencies. Only the TARGET subdirectory of each is wiped
// before re-copy — dropins NOT in node_modules (e.g. vendored ones like
// storefront-search, which JFrog's bac-npm-remote doesn't carry) stay put.
// The old behavior of rm-rf'ing the entire dropins dir clobbered those
// every install.
fs.readdirSync('node_modules/@dropins', { withFileTypes: true }).forEach((file) => {
  if (!dependencies[`@dropins/${file.name}`]) {
    return;
  }

  if (!file.isDirectory()) {
    return;
  }

  const target = path.join(dropinsDir, file.name);
  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true });
  }

  fs.cpSync(path.join('node_modules', '@dropins', file.name), target, {
    recursive: true,
    filter: (src) => (!src.endsWith('package.json')),
  });
});

// Other files to copy
[
  { from: '@adobe/magento-storefront-event-collector/dist/index.js', to: 'commerce-events-collector.js' },
  { from: '@adobe/magento-storefront-events-sdk/dist/index.js', to: 'commerce-events-sdk.js' },
].forEach((file) => {
  fs.copyFileSync(path.resolve(__dirname, 'node_modules', file.from), path.resolve(__dirname, 'scripts', file.to));
});

// Install @blueacorn/aem-commerce-theme-summit into EDS-served paths
const themeRoot = path.join('node_modules', '@blueacorn', 'aem-commerce-theme-summit', 'src');
if (fs.existsSync(themeRoot)) {
  const themeFileMap = [
    { from: 'theme.js', to: path.join('scripts', 'theme.js') },
    { from: 'theme-config.js', to: path.join('scripts', 'theme-config.js') },
    { from: 'styles/blue-acorn-ici-theme.css', to: path.join('styles', 'blue-acorn-ici-theme.css') },
    { from: 'styles/fonts.css', to: path.join('styles', 'fonts.css') },
    { from: 'styles/lazy-styles.css', to: path.join('styles', 'lazy-styles.css') },
  ];
  themeFileMap.forEach(({ from, to }) => {
    fs.copyFileSync(path.join(themeRoot, from), path.resolve(__dirname, to));
  });
  const blueacornDest = path.join('styles', 'blueacorn');
  if (fs.existsSync(blueacornDest)) {
    fs.rmSync(blueacornDest, { recursive: true });
  }
  fs.cpSync(path.join(themeRoot, 'styles', 'blueacorn'), blueacornDest, { recursive: true });
  console.info('✅ @blueacorn/aem-commerce-theme-summit installed.');
} else {
  console.warn('⚠️  @blueacorn/aem-commerce-theme-summit not found in node_modules — skipping theme install.');
}

function checkPackageLockForArtifactory() {
  return new Promise((resolve, reject) => {
    fs.readFile('package-lock.json', 'utf8', (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      try {
        const packageLock = JSON.parse(data);
        let found = false;
        Object.keys(packageLock.packages).forEach((packageName) => {
          const packageInfo = packageLock.packages[packageName];
          if (packageInfo.resolved && packageInfo.resolved.includes('artifactory')) {
            console.warn(`Warning: artifactory found in resolved property for package ${packageName}`);
            found = true;
          }
        });
        resolve(found);
      } catch (error) {
        reject(error);
      }
    });
  });
}

checkPackageLockForArtifactory()
  .then((found) => {
    if (found) {
      // Warn, don't fail: BAC devs install through JFrog so EVERY npm install
      // in the devcontainer produces a JFrog-URL lockfile. The old behavior
      // (exit 1) aborted setup.sh on every attach and prevented `aem up`
      // from ever starting. The "don't commit this" concern is already
      // handled by package-lock.json being in .gitignore.
      console.warn('⚠️  package-lock.json contains artifactory URLs (expected in BAC devcontainer; lockfile is gitignored).');
    }
    console.info('✅ Drop-ins installed successfully!', '\n');
    process.exit(0);
  })
  .catch((error) => {
    // Missing/unreadable lockfile isn't fatal either — it just means
    // we couldn't run the check. install:dropins still succeeded.
    console.warn('⚠️  Could not check package-lock.json:', error.message);
    console.info('✅ Drop-ins installed successfully!', '\n');
    process.exit(0);
  });

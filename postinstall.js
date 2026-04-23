/* eslint-disable import/extensions */
const fs = require('fs');
const path = require('path');
const { dependencies } = require('./package.json');

// Define the dropins folder
const dropinsDir = path.join('scripts', '__dropins__');

// Remove existing dropins folder
if (fs.existsSync(dropinsDir)) {
  fs.rmSync(dropinsDir, { recursive: true });
}

// Create scripts/__dropins__ directory if not exists
fs.mkdirSync(dropinsDir, { recursive: true });

// Copy specified files from node_modules/@dropins to scripts/__dropins__
fs.readdirSync('node_modules/@dropins', { withFileTypes: true }).forEach((file) => {
  // Skip if package is not in package.json dependencies / skip devDependencies
  if (!dependencies[`@dropins/${file.name}`]) {
    return;
  }

  // Skip if is not folder
  if (!file.isDirectory()) {
    return;
  }
  fs.cpSync(path.join('node_modules', '@dropins', file.name), path.join(dropinsDir, file.name), {
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
    if (!found) {
      console.info('✅ Drop-ins installed successfully!', '\n');
      process.exit(0);
    } else {
      console.error('🚨 Fix artifactory references before committing! 🚨');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });

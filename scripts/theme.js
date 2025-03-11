import { getThemeConfig } from './theme-config.js';

async function initTheme() {
  const themeConfig = await getThemeConfig();
  const rootElement = document.documentElement;

  themeConfig.forEach((item) => {
    rootElement.style.setProperty(item.key, item.value);
  });
}

initTheme();

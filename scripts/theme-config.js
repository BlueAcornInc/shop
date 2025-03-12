function buildConfigURL() {
  const fileName = 'theme.json';

  const configURL = new URL(`${window.location.origin}/${fileName}`);
  return configURL;
}

const getConfig = async () => {
  try {
    const themeConfigJSON = window.sessionStorage.getItem('theme');
    if (!themeConfigJSON) {
      throw new Error('No config in session storage');
    }

    const parsedConfig = JSON.parse(themeConfigJSON);
    if (!parsedConfig[':expiry'] || parsedConfig[':expiry'] < Math.round(Date.now() / 1000)) {
      throw new Error('Config expired');
    }

    return parsedConfig;
  } catch (e) {
    let themeConfigJSON = await fetch(buildConfigURL());
    if (!themeConfigJSON.ok) {
      throw new Error('Failed to fetch theme config');
    }
    themeConfigJSON = await themeConfigJSON.json();
    themeConfigJSON[':expiry'] = Math.round(Date.now() / 1000) + 7200;
    window.sessionStorage.setItem('theme', JSON.stringify(themeConfigJSON));
    return themeConfigJSON;
  }
};

export const getThemeConfig = async () => {
  const config = await getConfig();
  const configElements = config.data;
  return configElements;
};

/**
 * This function retrieves a configuration value for a given environment.
 *
 * @param {string} configParam - The configuration parameter to retrieve.
 */
export const getConfigValue = async (configParam) => {
  const config = await getConfig();
  const configElements = config.data;
  return configElements.find((c) => c.key === configParam)?.value;
};

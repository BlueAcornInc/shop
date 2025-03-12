function buildConfigURL() {
  const fileName = 'footer-links.json';

  const configURL = new URL(`${window.location.origin}/${fileName}`);
  return configURL;
}

const getConfig = async () => {
  try {
    const footerLinksConfigJSON = window.sessionStorage.getItem('footer-links');
    if (!footerLinksConfigJSON) {
      throw new Error('No config in session storage');
    }

    const parsedConfig = JSON.parse(footerLinksConfigJSON);
    if (!parsedConfig[':expiry'] || parsedConfig[':expiry'] < Math.round(Date.now() / 1000)) {
      throw new Error('Config expired');
    }

    return parsedConfig;
  } catch (e) {
    let footerLinksConfigJSON = await fetch(buildConfigURL());
    if (!footerLinksConfigJSON.ok) {
      throw new Error('Failed to fetch footer-links config');
    }
    footerLinksConfigJSON = await footerLinksConfigJSON.json();
    footerLinksConfigJSON[':expiry'] = Math.round(Date.now() / 1000) + 7200;
    window.sessionStorage.setItem('footer-links', JSON.stringify(footerLinksConfigJSON));
    return footerLinksConfigJSON;
  }
};

// eslint-disable-next-line import/prefer-default-export
export const getFooterLinks = async () => {
  const config = await getConfig();
  const configElements = config.data;
  return configElements;
};

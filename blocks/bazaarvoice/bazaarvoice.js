import { getConfigValue } from '../../scripts/configs.js';
import { loadScript } from '../../scripts/aem.js';

export default async function decorate(block) {
  const buildBlock = (configs) => {
    const bazaarVoiceReviewsEl = document.createElement('div');
    configs?.forEach((config) => {
      bazaarVoiceReviewsEl.setAttribute(config.attr, config.value);
    });
    block.appendChild(bazaarVoiceReviewsEl);
  };

  const config = {
    baseUrl: 'https://apps.bazaarvoice.com/deployments',
    endpoint: await getConfigValue('bazaarvoice-config-url'),
  };

  const widgetConfig = [
    {
      attr: 'data-bv-show',
      value: 'reviews',
    },
    {
      attr: 'data-bv-product-id',
      value: (window?.location?.pathname ?? '').slice((window?.location.pathname ?? '').lastIndexOf('/') + 1),
    },
  ];

  const addLoaderScript = ({ loaderScriptUrl }) => {
    loadScript(loaderScriptUrl);
    buildBlock(widgetConfig);
  };

  fetch(config?.endpoint)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`config.endpoint response: ${response.statusText}`);
      }
      return response.json();
    })
    .then((data) => {
      config.data = data?.config;
      config.loaderScriptUrl = `${config?.baseUrl}/${data?.config?.clientName}/${data?.config?.deploymentZone}/${data?.config?.environment}/${data?.config?.locale}/bv.js`;
      addLoaderScript(config);
    })
    .catch((error) => {
      console.error('Fetch error:', error);
    });
}

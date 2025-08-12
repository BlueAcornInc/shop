import { getConfigValue } from '../../scripts/configs.js';
import { loadScript } from '../../scripts/aem.js';

export default async function decorate(block) {
  const buildBlock = (configs) => {
    const yotpoReviewsEl = document.createElement('div');
    configs?.forEach((config) => {
      yotpoReviewsEl.setAttribute(config.attr, config.value);
    });

    console.log('config before addition: ' + JSON.stringify(configs))

    block.appendChild(yotpoReviewsEl);

    yotpoWidgetsContainer.initWidgets();
  };
  const config = {
    baseUrl: 'https://cdn-widgetsrepository.yotpo.com/v1/loader',
    endpoint: await getConfigValue('yotpo-config-url'),
    currency: await getConfigValue('commerce-base-currency-code'),
  };

  const widgetConfig = [
    // instanceId will be added after fetching config
    { attr: 'data-yotpo-product-id', value: window.location.pathname.slice(window.location.pathname.lastIndexOf('/') + 1) },
    { attr: 'data-yotpo-name', value: 'evergreen' },
    { attr: 'data-yotpo-url', value: window.location.toString() },
    { attr: 'data-yotpo-image-url', value: `https:${document.querySelector('.pdp-carousel__slide>img')?.getAttribute('src')}` },
    { attr: 'data-yotpo-price', value: document.querySelector('.dropin-price')?.innerText?.slice(1) },
    { attr: 'data-yotpo-currency', value: config.currency },
    { attr: 'class', value: 'yotpo-widget-instance' },
  ];

  const addLoaderScript = ({ loaderScriptUrl }) => {
    console.log("loadscripturl: " + loaderScriptUrl)
    loadScript(loaderScriptUrl);
    // buildBlock will be called after instanceId is added
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
      config.loaderScriptUrl = `${config?.baseUrl}/${data?.appKey}`;
      // Add instanceId to widgetConfig and then buildBlock
      widgetConfig.unshift({ attr: 'data-yotpo-instance-id', value: data?.instanceId });
      addLoaderScript(config);
      buildBlock(widgetConfig);
      console.log('Yotpo config data:', data);
      console.log('Updated widgetConfig:', JSON.stringify(widgetConfig));
    })
    .catch((error) => {
      console.error('Fetch error:', error);
    });
}

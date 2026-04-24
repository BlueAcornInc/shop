/* eslint-disable import/no-unresolved */
import { initializers } from '@dropins/tools/initializer.js';
// eslint-disable-next-line import/no-cycle
import { initializeDropin } from './index.js';
import { fetchPlaceholders } from '../aem.js';
import { getHeaders, getConfigValue } from '../configs.js';

await initializeDropin(async () => {
  let searchApi;
  try {
    searchApi = await import('@dropins/storefront-search/api.js');
  } catch (error) {
    console.warn('storefront-search is temporarily disabled (package unavailable in JFrog).', error);
    return null;
  }

  const {
    initialize,
    setEndpoint,
    setFetchGraphQlHeaders,
  } = searchApi;

  const labels = await fetchPlaceholders();

  const langDefinitions = {
    default: {
      ...labels,
    },
  };

  setEndpoint(await getConfigValue('commerce-endpoint'));
  setFetchGraphQlHeaders(await getHeaders('cs'));

  return initializers.mountImmediately(initialize, {
    langDefinitions,
  });
})();

/* eslint-disable import/no-unresolved */
async function getStoreDetails() {
  return {
    config: {
      pageSize: 8,
      perPageConfig: {
        pageSizeOptions: '12,24,36',
        defaultPageSizeOption: '24',
      },
      minQueryLength: '2',
      currencySymbol: '$',
      currencyRate: '1',
      displayOutOfStock: true,
      allowAllProducts: false,
    },
    route: ({ sku, urlKey }) => `/products/${urlKey}/${sku}`,
    searchRoute: {
      route: '/search',
      query: 'q',
    },
  };
}

async function initSearchPopover() {
  const rootElement = document.getElementById('search_autocomplete');
  if (!rootElement) {
    console.error('Root element #search_autocomplete not found.');
    return;
  }

  try {
    await import('../../scripts/initializers/search.js');
    const [{ render }, { default: SearchPopover }] = await Promise.all([
      import('@dropins/storefront-search/render.js'),
      import('@dropins/storefront-search/containers/SearchPopover.js'),
    ]);
    const storeDetails = await getStoreDetails();
    render(SearchPopover, { storefrontDetails: storeDetails })(rootElement);
  } catch (error) {
    rootElement.innerHTML = '';
    console.warn('Search popover disabled until storefront-search is available in JFrog.', error);
  }
}

initSearchPopover();

# Yotpo Reviews Block for Adobe Commerce

## Overview

This JavaScript module decorates a block with Yotpo reviews by dynamically loading the Yotpo widget and configuring it with product-specific details. It integrates with Adobe Commerce to fetch necessary configurations and display reviews accordingly.

## Features

- Dynamically loads the Yotpo reviews widget.
- Configures the widget with product-specific details like product ID, name, URL, and price.
- Fetches Yotpo configuration from an API.
- Handles errors gracefully if the API request fails.

## Implementation

### 1. **Initialize the Block**

- Creates a `div` element to hold the Yotpo reviews widget.
- Dynamically adds necessary attributes based on product details.
- Appends the element to the block.

### 2. **Fetch Configuration Data**

- Retrieves the Yotpo configuration URL from Adobe Commerce settings.
- Fetches the base currency for the store.
- Constructs a widget configuration object with the retrieved values.

### 3. **Build and Load the Widget**

- Uses the fetched configuration data to construct the widget.
- Loads the Yotpo script dynamically.
- Appends the widget instance to the block.

### 4. **Handle API Errors**

- If the API request fails, logs the error in the console.
- Ensures the script does not break the page if Yotpo data is unavailable.


Minimum Yotpo Config should include:
API Key (app key).
We also have the API Secret but are not using it for this implementation.

---

# Yotpo Reviews

Yotpo Review block for Adobe Commerce Storefront

* [Yotpo Reviews Installation Guide](https://support.yotpo.com/docs/generic-other-platforms-installing-yotpo-reviews-v3)
* [Yotpo Dashoard](https://reviews.yotpo.com/#/home)
* [View Demo](https://main--showcase-evergreen-commerce-storefront--blueacorninc.hlx.live/yotpo)

## Technical Approach

This approach is intended for Adobe Commerce Storefront with document based authoring. When a customer wants to render a Yotpo Reviews block, they will add a table to the doc with a header row containing "Yotpo". [View Example](https://docs.google.com/document/d/1zUt26xPAzziRJBb_YsyVht3DU0xmRVTDXc7rgmhrxtI/edit?tab=t.0). 


When Helix renders this page, it will parse the table and run the `yotpo.js` in this directory. This file will add the needed script tags to enable Yotpo, and inject the needed `<div>` tag into the block allowing Yotpo to present. 

As a result, Yotpo can be easily integrated into the storefront wherever a merchant wants to display it. See it in action [here](https://main--showcase-evergreen-commerce-storefront--blueacorninc.hlx.live/yotpo).

## Block Options

This Adobe Commerce Blocks can be configured within the document-based authoring context by adding optins to the block table within the doc. 

| Key   | Value |
|-------|-------|
|       |       |

## Block Setup in Configs

To use this block, configure the following in the `configs` sheet.

| Path                | Value                                                                                   |
|---------------------|-----------------------------------------------------------------------------------------|
| yotpo.instance-id   | https://cdn-widgetsrepository.yotpo.com/v1/loader/2DscstHDudRbdPAOzC5foy1bLIBMZjhtyDjmsDJq |
| yotpo.url           | 1039593                                                                                 |
## To Do

- [ ] Verify the Yotpo instance ID and URL in the `configs` sheet and make this block reference them, they are currently hardcoded.
- [ ] Review documentation and see how this reviews widget can be configured, add configurability to it so that, from the table in the block, I can add a key/value pair for any personalization options. Document them all in this readme.
- [ ] Test the Yotpo Reviews block integration on a staging environment.
- [ ] Looks like there are several types of blocks we could make, i.e. just stars, highlighted review, etc. Let's make different blocks for all the major pieces, this one would be renamed to `yotpo-product-review` or something that makes snese.
- [ ] Ensure the Yotpo script tags are correctly injected by `yotpo.js`.
- [ ] Validate the Yotpo Reviews block rendering on different devices and browsers.
- [ ] Update documentation with any changes or additional configuration steps.

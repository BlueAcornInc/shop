# Bazaarvoice Reviews Block for Adobe Commerce

## Overview

This JavaScript module decorates a block with Bazaarvoice reviews by dynamically loading the Bazaarvoice widget and configuring it with product-specific details. It integrates with Adobe Commerce to fetch necessary configurations and display reviews accordingly.

## Features

- Dynamically loads the Bazaarvoice reviews widget.
- Configures the widget with product-specific details like product ID and review display settings.
- Fetches Bazaarvoice configuration from an API.
- Handles errors gracefully if the API request fails.

## Implementation

### 1. **Initialize the Block**

- Creates a `div` element to hold the Bazaarvoice reviews widget.
- Dynamically adds necessary attributes based on product details.
- Appends the element to the block.

### 2. **Fetch Configuration Data**

- Retrieves the Bazaarvoice configuration URL from Adobe Commerce settings.
- Constructs a widget configuration object with the retrieved values.

### 3. **Build and Load the Widget**

- Uses the fetched configuration data to construct the widget.
- Loads the Bazaarvoice script dynamically.
- Appends the widget instance to the block.

### 4. **Handle API Errors**

- If the API request fails, logs the error in the console.
- Ensures the script does not break the page if Bazaarvoice data is unavailable.


Minimum Bazaarvoice Config should include:
Environment
Client Name ​
Deployment Zone
Locale
Enable BV Pixel
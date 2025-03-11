# Adobe Summit 2025 Demo Storefront
This project boilerplate is for Edge Delivery Services projects that integrate with Adobe Commerce.

## Documentation
https://experienceleague.adobe.com/developer/commerce/storefront/

## Storefront Environments

- Preview: https://main--shop-summit--blueacorninc.aem.page/
- Live: https://main--shop-summit--blueacorninc.aem.live/
- Github: https://github.com/BlueAcornInc/shop-summit

## Commerce as a Cloud Instances

- Customize your code: https://github.com/blueacorninc/shop-stripe
- Edit your content: https://da.live/#/blueacorninc/shop-stripe
- Manage your config: https://da.live/sheet#/blueacorninc/shop-stripe/configs-stage
- Preview your storefront: https://main--shop-stripe--blueacorninc.aem.page/
- Access your Commerce Admin: https://na1-sandbox.admin.commerce.adobe.com/C6wSs2HrNy7D79CYD5AFZP
- Try out your API: https://edge-graph.adobe.io/api/79fae002-0e37-4d96-ba00-cfd83862c94c/graphql

To check the status of your Mesh, run aio api-mesh status To update your Mesh, run aio api-mesh update mesh_config.json 

View your Mesh details: 
https://developer.adobe.com/console/projects/1244026/4566206088345355270/workspaces/4566206088345376085/details 

For next steps, including how to customize your storefront and make it your own, check out our docs: https://experienceleague.adobe.com/developer/commerce/storefront/

## Pre-requisites

Out of the box, this project template uses a pre-configured Adobe Commerce environment. If you want to use your own Adobe Commerce environment, you'll need to update the `configs.xlsx` file in your content repository to have values that match your environment.

Additionally, you need to have the following modules and customizations installed on your environment:

1. adobe-commerce/storefront-compatibility: Contains changes to the Adobe Commerce GraphQL API that enable drop-ins functionality.
1. magento/module-data-services-graphql: Commerce module with the functionality necessary for adding context to events.
1. magento/module-page-builder-product-recommendations: Commerce module required for PRex Widget
1. magento/module-visual-product-recommendations: Commerce module required for PRex Widget
<!-- 1. TODO: Add further prereqs.  -->

## Documentation

Before using the boilerplate, we recommend you to go through the documentation on https://www.aem.live/docs/ and more specifically:
1. [Developer Tutorial](https://www.aem.live/developer/tutorial)
2. [The Anatomy of a Project](https://www.aem.live/developer/anatomy-of-a-project)
3. [Web Performance](https://www.aem.live/developer/keeping-it-100)
4. [Markup, Sections, Blocks, and Auto Blocking](https://www.aem.live/developer/markup-sections-blocks)

## Installation

```sh
npm i
```

## Updating Drop-in dependencies

You may need to update one of the drop-in components, or `@adobe/magento-storefront-event-collector` or `@adobe/magento-storefront-events-sdk` to a new version. Besides checking the release notes for any breaking changes, ensure you also execute the `postinstall` script so that the dependenices in your `scripts/__dropins__` directory are updated to the latest build. This should be run immediately after you update the component, for example:

```
npm install @dropins/storefront-cart@2.0. # Updates the storefront-cart dependency in node_modules/
npm run postinstall # Copies scripts from node_modules into scripts/__dropins__
```

This is a custom script which copies files out of `node_modules` and into a local directory which EDS can serve. You must manually run `postinstall` due to a design choice in `npm` which does not execute `postinstall` after you install a _specific_ package.

## Linting

```sh
npm run lint
```

## Local development

1. Create a new repository based on the `aem-boilerplate-commerce` template and add a mountpoint in the `fstab.yaml`
1. Add the [AEM Code Sync GitHub App](https://github.com/apps/aem-code-sync) to the repository
1. Add your Adobe Commerce SaaS configuration in the `configs.xlsx` sheet in your content repository.
1. Install all dependencies using `npm i`.
1. Start AEM Proxy: `npm run up` (opens your browser at `http://localhost:3000`)
1. Open the `{repo}` directory in your favourite IDE and start coding :)

## Changelog

Major changes are described and documented as part of pull requests and tracked via the `changelog` tag. To keep your project up to date, please follow this list:

https://github.com/hlxsites/aem-boilerplate-commerce/issues?q=label%3Achangelog+is%3Aclosed

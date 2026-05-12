# blueacornici.shop — Adobe Commerce Storefront (2026)

Blue Acorn iCi's Adobe Commerce on Edge Delivery Services storefront. `main` is the clean theme baseline branch; the fully integrated storefront should live on `all--shop--blueacorninc.aem.live`.

## Documentation

https://experienceleague.adobe.com/developer/commerce/storefront/

## Storefront Environments

- Main Preview: https://main--shop--blueacorninc.aem.page/
- Main Live: https://main--shop--blueacorninc.aem.live/
- All Live: https://all--shop--blueacorninc.aem.live/
- GitHub: https://github.com/BlueAcornInc/shop

## Branch Profiles and Deploy Targets

`main` is the canonical clean theme branch and should stay aligned with upstream storefront/theme updates. Deploy branches are generated from `main`, then pinned to an integration profile. That keeps upstream merges simple while making each deployment target explicit.

| Branch | Profile | Managed npm packages | Live URL | Update trigger |
| - | - | - | - | - |
| `main` | Theme only baseline | none of the BA integration packages | https://main--shop--blueacorninc.aem.live/ | normal PR merges from theme/upstream work |
| `all` | Theme + all integration blocks | `@blueacorninc/storefront-yotpo`, `@blueacorninc/storefront-storelocator` | https://all--shop--blueacorninc.aem.live/ | manual workflow dispatch, plus block release fan-out |
| `yotpo` | Theme + yotpo only | `@blueacorninc/storefront-yotpo` | https://yotpo--shop--blueacorninc.aem.live/ | `repository_dispatch` type `yotpo-release` or manual workflow dispatch |
| `store-locator` | Theme + store locator only | `@blueacorninc/storefront-storelocator` | https://store-locator--shop--blueacorninc.aem.live/ | `repository_dispatch` type `storelocator-release` or manual workflow dispatch |

### Automation Workflow

Use [`.github/workflows/integration-branch-update.yaml`](.github/workflows/integration-branch-update.yaml) to rebuild a deploy branch from `origin/main`, apply one integration profile, commit updated block/package content, and force-push the target branch.

Expected repository dispatch events:

- `yotpo-release` -> updates `yotpo` and `all`
- `storelocator-release` -> updates `store-locator` and `all`

Required secret:

- `BAC_BOT_PAT` (repo + package read/write for branch push and GitHub Packages access)

### Main Branch Upstream Sync

If `upstream` is not configured yet:

```sh
git remote add upstream git@github.com:hlxsites/aem-boilerplate-commerce.git
```

Recommended sync flow:

```sh
git checkout main
git fetch upstream
git merge --ff-only upstream/main
git push origin main
```

Then run the integration workflow manually for `all`, `yotpo`, and `store-locator` so those deploy branches are regenerated from the refreshed theme baseline.

## Commerce as a Cloud Instances

Currently pointed at a shared Adobe Commerce sandbox. The plan is to migrate to our own evergreen `na1-sandbox` instance once it's provisioned — not yet.

- Customize your code: https://github.com/BlueAcornInc/shop
- Edit your content: https://da.live/#/blueacorninc/shop
- Manage your config: https://da.live/sheet#/blueacorninc/shop/configs
- Preview your storefront: https://main--shop--blueacorninc.aem.page/
- Access your Commerce Admin: https://na1-sandbox.admin.commerce.adobe.com/C6wSs2HrNy7D79CYD5AFZP
- Try out your API: https://edge-graph.adobe.io/api/79fae002-0e37-4d96-ba00-cfd83862c94c/graphql

To check the status of your Mesh, run `aio api-mesh status`. To update your Mesh, run `aio api-mesh update mesh_config.json`.

View your Mesh details: https://developer.adobe.com/console/projects/1244026/4566206088345355270/workspaces/4566206088345376085/details

For next steps, including how to customize your storefront and make it your own, check out the docs: https://experienceleague.adobe.com/developer/commerce/storefront/

## Pre-requisites

Out of the box, this project uses a pre-configured Adobe Commerce environment. If you want to use your own, update the `configs.xlsx` file in your content repository to match.

You need the following modules installed on your Commerce environment:

1. `adobe-commerce/storefront-compatibility` — GraphQL API changes for drop-ins functionality.
1. `magento/module-data-services-graphql` — context for events.
1. `magento/module-page-builder-product-recommendations` — PRex Widget.
1. `magento/module-visual-product-recommendations` — PRex Widget.

## Documentation

Before using the boilerplate, go through the documentation at https://www.aem.live/docs/ and specifically:

1. [Developer Tutorial](https://www.aem.live/developer/tutorial)
2. [The Anatomy of a Project](https://www.aem.live/developer/anatomy-of-a-project)
3. [Web Performance](https://www.aem.live/developer/keeping-it-100)
4. [Markup, Sections, Blocks, and Auto Blocking](https://www.aem.live/developer/markup-sections-blocks)

## Installation

```sh
npm i
```

BAC devs: open in devcontainer and the postAttach handles install + `aem up` automatically. See `.devcontainer/` for the JFrog + SSH-forwarding setup.

## Updating Drop-in dependencies

If you bump one of the `@dropins/*` components, or `@adobe/magento-storefront-event-collector` / `@adobe/magento-storefront-events-sdk`, run the postinstall copy afterward to refresh `scripts/__dropins__/`:

```
npm install @dropins/storefront-cart@2.0.0
npm run install:dropins
```

`install:dropins` copies from `node_modules` into `scripts/__dropins__/` where EDS serves them. It's a separate script because npm doesn't re-run `postinstall` on a single-package install.

## BA-org block packages

A few blocks are extracted into their own npm packages under `@blueacorninc/`, pulled via GitHub Packages:

- `@blueacorninc/storefront-storelocator` — store-locator + product-availability blocks (from [aio-commerce-storelocator](https://github.com/BlueAcornInc/aio-commerce-storelocator))
- `@blueacorninc/storefront-yotpo` — yotpo + yotpo-stars blocks (from [aio-commerce-yotpo](https://github.com/BlueAcornInc/aio-commerce-yotpo))

Each package's `postinstall.js` copies its block files into this repo's `blocks/` directory on `npm install`. Those populated copies are committed (EDS serves them at runtime); `.eslintignore` marks them as npm-managed so they're linted upstream, not here.

## Linting

```sh
npm run lint
```

## Local development

1. Create a new repository based on the `aem-boilerplate-commerce` template and add a mountpoint in the `fstab.yaml`.
1. Add the [AEM Code Sync GitHub App](https://github.com/apps/aem-code-sync) to the repository.
1. Add your Adobe Commerce SaaS configuration in the `configs.xlsx` sheet in your content repository.
1. Install dependencies: `npm i`.
1. Start the dev server: `npm start` (opens http://localhost:3000/).
1. Open in your IDE and start coding.

## Changelog

Major changes are described in pull requests and tagged `changelog`. To keep your project up to date, follow:

https://github.com/hlxsites/aem-boilerplate-commerce/issues?q=label%3Achangelog+is%3Aclosed

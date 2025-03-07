# Repoless Configurations


## Why Go Repoless

It allows us to segment content and all that so brands see no overlap, but we can centeralize to one or two code repos

## Structure

* blueacorn.shop 
    * stripe.blueacorn.shop or stripe domain
    * adyen.blueacorn.shop or /adyen or adyen domain (but how would we use the other repo template? - point to a different code repo? Maybe this gets a blueacorn.shop/adyen in BA colors?)
    * <app>.blueacorn.shop for any standalone demo we want to present, same code repo but different content repos


# Stripe Summit Instance

Might go away, but tracking here...

Customize your code: https://github.com/blueacorninc/shop-stripe
Edit your content: https://da.live/#/blueacorninc/shop-stripe
Manage your config: https://da.live/sheet#/blueacorninc/shop-stripe/configs-stage
Preview your storefront: https://main--shop-stripe--blueacorninc.aem.page/
Access your Commerce Admin: https://na1-sandbox.admin.commerce.adobe.com/C6wSs2HrNy7D79CYD5AFZP
Try out your API: https://edge-graph.adobe.io/api/79fae002-0e37-4d96-ba00-cfd83862c94c/graphql
To check the status of your Mesh, run aio api-mesh status
To update your Mesh, run aio api-mesh update mesh_config.json
View your Mesh details: https://developer.adobe.com/console/projects/1244026/4566206088345355270/workspaces/4566206088345376085/details
For next steps, including how to customize your storefront and make it your own, check out our docs:
https://experienceleague.adobe.com/developer/commerce/storefront/
# Connect Luniva to Shopify

The React design stays on Vercel. When Shopify credentials are configured, the storefront reads products and variants from Shopify and sends buyers to Shopify's hosted checkout. Shopify Admin becomes the place to manage products, inventory, payments, and orders.

## 1. Create the Shopify store

Create a Shopify store for Luniva. Before publishing, configure Japan as the primary market, JPY pricing, payment providers, shipping rates, taxes, return terms, and customer accounts in Shopify Admin.

## 2. Import the current catalog

In Shopify Admin, import [`frontend/shopify-products.csv`](frontend/shopify-products.csv) from **Products → Import**. The CSV creates unpublished products with one default variant each. Inventory is intentionally left unset because the current app's stock values are demo data. Review product names, copy, images, prices, compare-at prices, variants, shipping weights, and inventory before publishing.

The import script can be rerun after editing the source catalog:

```sh
npm run shopify:export --prefix frontend
```

## 3. Create Storefront API access

In Shopify Admin, install the **Headless** sales channel and create a storefront. Grant the storefront permission to read product listings, then copy its **public Storefront API access token**. The storefront uses Shopify's public token in browser requests; do not use an Admin API token here.

## 4. Configure the React app

Copy `frontend/.env.example` to `frontend/.env.local` for local work. Set the same variables in the Vercel project's build environment and redeploy:

```text
REACT_APP_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
REACT_APP_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-public-storefront-token
REACT_APP_SHOPIFY_API_VERSION=2026-10
```

Use the `myshopify.com` domain without `https://`. The product API switches to Shopify when both the store domain and public token are set. The cart then creates a Shopify cart and redirects to Shopify checkout; account and order links go to Shopify's account pages.

## Current migration boundary

The existing React app and Vercel deployment remain in place. The old Express/Mongo demo API is still used until Shopify credentials are configured. Existing local demo users and orders are not automatically imported into Shopify. The Shopify product import does not invent stock quantities or size/color variants; add those in Shopify Admin before publishing products that need them.

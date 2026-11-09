# Connect Luniva to Shopify

The React design stays on Vercel. When Shopify credentials are configured, the storefront reads products and variants from Shopify and sends buyers to Shopify's hosted checkout. Shopify Admin becomes the place to manage products, inventory, payments, and orders.

## 1. Create the Shopify store

Create a Shopify store for Luniva. Before publishing, add and activate Japan as a market, configure its JPY pricing, and confirm your payment provider, shipping rates, taxes, return terms, and customer accounts in Shopify Admin. Keep the store's business location accurate for the legal business; Japan is the customer market.

## 2. Import the current catalog — completed

The store owner reports that [`frontend/shopify-products.csv`](frontend/shopify-products.csv) was imported successfully. It contains 11 products. The imported products should remain unpublished until reviewed. The CSV has one default variant per product and no inventory quantities because the old app's stock values were demo data. Review product names, copy, images, JPY prices, compare-at prices, needed variants, shipping weights, and inventory before publishing.

The import script can be rerun after editing the source catalog:

```sh
npm run shopify:export --prefix frontend
```

## 3. Create Storefront API access

In Shopify Admin, open the **Headless** storefront's Storefront API permissions and enable product listings, product tags, and cart read/write access (Shopify's `unauthenticated_read_product_listings`, `unauthenticated_read_product_tags`, `unauthenticated_read_checkouts`, and `unauthenticated_write_checkouts` scopes). The app reads tags to identify featured products and uses Shopify's Cart API for checkout. Shopify checks actual stock when cart lines are added, so the React app does not request protected inventory quantities. Then copy the **public Storefront API access token**. Never use a private Storefront token or Admin API token in the React app. See Shopify's [Storefront API access scopes](https://shopify.dev/docs/api/usage/access-scopes).

## 4. Configure the React app

Copy `frontend/.env.example` to `frontend/.env.local` for local work. Set the same variables in the Vercel project's build environment and redeploy:

```text
REACT_APP_SHOPIFY_STORE_DOMAIN=luniva45.myshopify.com
REACT_APP_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-public-storefront-token
REACT_APP_SHOPIFY_API_VERSION=2026-10
```

The first three variables are required. The app defaults the optional `REACT_APP_SHOPIFY_MARKET_COUNTRY` to `JP`. Use the `myshopify.com` domain without `https://`. The product API switches to Shopify when the domain and public token are set. The app requests products and prices in Japan market context, creates a Shopify cart with Japan as the buyer country, saves the cart ID in browser storage, and sends the customer to that cart's Shopify checkout URL. Cart changes and quantities are saved through Shopify's Cart API.

## Price and currency setup

The store owner confirmed the store currency was changed from ETB to JPY before importing products. Shopify does not convert existing numeric prices when the store currency changes, so review any prices, shipping rates, gift cards, or pending payments that already existed. The current CSV amounts were authored for yen display and are intended to be imported unchanged as JPY. The owner chose to keep these amounts as the Japan prices.

Confirm that the selected payment provider can charge customers in JPY. Some providers display local-currency prices in the storefront but convert charges back to the store's base currency at checkout. See Shopify's [local currency setup](https://help.shopify.com/en/manual/markets/customizations/local-currencies) and [international payment currency guidance](https://help.shopify.com/en/manual/international/payments).

## Current migration boundary

The existing React app and Vercel deployment remain in place. The old Express/Mongo demo API is still used for legacy account features until those are migrated. Existing local demo users and orders are not automatically imported into Shopify. Checkout now stays unavailable until Shopify is configured, and it does not collect card details or create demo orders. The Shopify product import does not invent stock quantities or size/color variants; add those in Shopify Admin before publishing products that need them.

# Luniva website — project information and handoff

Last updated: 2026-11-09

This file is the project handoff: what the site contains, how it is built, what has been changed, how Shopify is connected, and what remains before launch.

## Project overview

Luniva is a Japanese-language lifestyle, beauty, and wellness storefront. The site uses the Luniva name and logo, dark green brand color (`#143525`), product browsing and filtering, product detail pages, cart, checkout, customer account routes, support pages, and responsive layouts.

**Current selected path: React storefront + Shopify Headless.** React stays hosted on Vercel. Shopify supplies the product catalog, variants, inventory, orders, customer account destinations, and hosted checkout. A native Shopify theme was considered but is not part of this storefront deployment.

## Code and services

- `frontend/`: React storefront built with Create React App and React Router.
- `backend/`: Express demo API with in-memory sample data. It remains as a fallback until Shopify is configured; local demo users and orders are not migrated to Shopify.
- Vercel: hosts the React frontend deployment.
- Shopify store: `luniva45.myshopify.com`; Headless is installed according to the store owner.
- `frontend/shopify-products.csv`: generated product catalog import file.
- `SHOPIFY_SETUP.md`: detailed Shopify connection and pricing steps.

## Main website areas

- Home: hero, benefits, featured products, brand promises, and customer reviews.
- Shop: product grid, search, category and price filters, and sorting.
- Product: images, variants, prices, availability, and related products.
- Cart and checkout: React presents the cart; Shopify stores the cart, restores it by cart ID after refresh, handles quantity changes/removals, and hosts checkout.
- Accounts and orders: Shopify account destinations when Headless is configured; legacy React pages remain for the demo backend.
- Support: FAQ, contact, shipping and refund information, terms, privacy, and order tracking.
- Discovery: page metadata, canonical URLs, structured data where applicable, `robots.txt`, and SEO file generation are included in the frontend.

## Work completed

- Rebranded the storefront as Luniva, applied the dark green palette, and added the supplied Luniva logo.
- Updated the homepage, product cards and product details, collection filtering, responsive navigation, cart, support content, and footer based on the requested design iterations. The footer is white with smaller branding and payment icons; green hover states preserve readable button text; homepage benefit areas use modern icons.
- Refined the collection page filters and spacing for the category and product panels.
- Added SEO and AI-search metadata, structured data, `robots.txt`, and generated sitemap/SEO files.
- Added a Shopify Storefront API client that reads products and variants, creates and updates persistent Shopify carts, and hands buyers to Shopify's hosted checkout.
- Reduced shop page loading work by using a compact Shopify product-list query, sharing an in-flight catalog request, and requesting resized WebP product images. If Shopify credentials are missing in a production build, the catalog preview uses bundled data without waiting for the legacy MongoDB API.
- Improved repeat visits by caching the Shopify catalog in the browser for 10 minutes, and split page routes into separate JavaScript chunks so the browser downloads only the active page.
- Compressed the homepage hero image from 6.4 MB PNG to 193 KB WebP. Removed inventory quantity fields that require extra Shopify access; Shopify still validates stock when a cart line is added. Checkout now reports a missing Shopify checkout URL as an error instead of silently leaving the button disabled.
- Added a Shopify catalog CSV export script and `frontend/shopify-products.csv`.
- Updated Shopify catalog requests to use Japan market context (`JP`) and checkout carts to use Japan as the buyer country. Product cards, product details, cart, and checkout summaries now format using the currency returned by Shopify.

The original Shopify integration was committed as `7077295 feat: connect Luniva storefront to Shopify`. This handoff and the current integration/performance refinements are part of the Luniva React + Shopify work.

## Useful file map

- `frontend/src/App.js`: application routes and shared page layout.
- `frontend/src/pages/Home.js` and `Home.css`: homepage sections and styling.
- `frontend/src/pages/Shop.js` and `Shop.css`: catalog, filters, search, and sort behavior.
- `frontend/src/pages/ProductDetail.js` and `ProductDetail.css`: product details and variant selection.
- `frontend/src/components/layout/Navbar.js` and `Footer.js`: shared navigation and footer.
- `frontend/src/context/CartContext.js`: Shopify cart restoration, serialized cart mutations, and local demo-cart fallback.
- `frontend/src/shopify/storefront.js`: Shopify Storefront API calls, Japan context, product mapping, and cart CRUD operations.
- `frontend/src/data/products.json`: source product records used by the demo and CSV exporter.
- `frontend/scripts/export-shopify-products.js`: creates the Shopify product import CSV.
- `frontend/public/robots.txt` and `frontend/scripts/generate-seo-files.js`: crawler and generated SEO files.

## Local development

Start the React app:

```sh
cd frontend
npm install
npm start
```

Start the legacy demo backend in another terminal if needed:

```sh
cd backend
npm install
npm run dev
```

Regenerate the Shopify product CSV after editing `frontend/src/data/products.json`:

```sh
npm run shopify:export --prefix frontend
```

The frontend build runs through `npm run build` in `frontend/`. No new tests were added for the Shopify connection.

## Shopify connection settings

The React app uses Shopify when both the store domain and public Storefront API token are configured. The expected frontend build environment variables are:

```text
REACT_APP_SHOPIFY_STORE_DOMAIN=luniva45.myshopify.com
REACT_APP_SHOPIFY_STOREFRONT_ACCESS_TOKEN=<public Storefront API token>
REACT_APP_SHOPIFY_API_VERSION=2026-10
```

`REACT_APP_SHOPIFY_MARKET_COUNTRY` is optional and defaults to `JP`.

The public Storefront token is intended for browser requests and will be visible in the frontend build. Never use an Admin API token (`shpat_...`) in the React app or a `REACT_APP_` variable. The private Storefront token is also secret and server-only. Shopify describes the distinction in its [Headless overview](https://shopify.dev/docs/storefronts/headless/overview).

For local work, copy `frontend/.env.example` to `frontend/.env.local` and use the public token. For the deployed site, add the three required variables in the Vercel project's **Settings → Environment Variables**, then redeploy. The Vercel CLI/account was not available in this workspace, so Vercel variables have not been set here. No API tokens are stored in this file or the repository.

In Shopify Admin, grant the Headless storefront product listing, product tag, and cart read/write permissions (`unauthenticated_read_product_listings`, `unauthenticated_read_product_tags`, `unauthenticated_read_checkouts`, and `unauthenticated_write_checkouts`). The app no longer requests protected inventory quantities; Shopify checks inventory when cart lines are added. See Shopify's [Storefront API access scopes](https://shopify.dev/docs/api/usage/access-scopes). Products must be published to the Headless channel and available in the Japan market. Japan-context Storefront API queries return prices and products for that market; see [Shopify's international pricing guide](https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/markets/international-pricing).

## Product data and Japan pricing

The store owner confirmed changing the Shopify store currency from ETB to JPY before importing, and reports that the CSV import completed successfully. Shopify interprets the CSV `Variant Price` and `Variant Compare At Price` fields in the store's base currency, so these amounts import as the intended JPY prices. Changing the store currency does not convert existing numeric prices; check any products, shipping rates, gift cards, or pending payments that existed before the currency change.

**Pricing decision:** keep the current catalog amounts as JPY for Japan. The CSV has 11 products, all marked unpublished, with no inventory quantities; it has 43 rows because additional product images use continuation rows. Each product has a title and price. Verify the imported JPY prices, add real inventory, shipping weights, and product variants as needed, then publish products to Headless. Do not publish the sample customer review text unless it reflects real customer experiences.

Check that the payment provider supports charging in JPY. Depending on the provider, storefront prices can display in JPY while checkout charges in the store's base currency. Shopify documents this in [local currencies](https://help.shopify.com/en/manual/markets/customizations/local-currencies) and [international payments](https://help.shopify.com/en/manual/international/payments).

## Remaining launch steps

1. Rotate or revoke the Admin API credential that was exposed during setup. Do not put its replacement in this repository or chat. Only the public Storefront token belongs in the React app.
2. In Shopify Headless, enable product listings, product tags, and cart read/write permissions; copy the public Storefront token. Inventory quantity permission is not required by the React storefront.
3. Review the imported catalog in JPY, add accurate inventory and needed variants, then publish the approved products to Headless.
4. Activate a payment provider that supports the actual business location and JPY. Complete provider verification and Shopify configuration.
5. Finish the Japan market, shipping rates, tax settings, policies, and customer account configuration.
6. Add the three required variables to Vercel Production, push the reviewed code to the production branch, and redeploy.
7. Test product/variant loading, cart persistence and edits, Shopify checkout, successful and failed test payments, and Shopify order creation.
8. Keep `lunivashop.com` for the final launch step. The React storefront stays on Vercel and checkout is hosted by Shopify.

Vercel's Hobby plan is limited to personal, non-commercial use. Because Luniva is a sales storefront, use Vercel Pro for the commercial deployment or choose a host whose plan permits commercial use; see Vercel's [Hobby plan terms](https://vercel.com/docs/plans/hobby).

## Credentials and safety

Do not commit `.env.local`, public/private API tokens, Admin API credentials, or customer information. The public Storefront API token is browser-visible by design; Admin and private Storefront API tokens must remain secret. The Admin credential exposed in the setup conversation still needs to be rotated or revoked in the app that issued it.

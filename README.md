# Checkout Countdown Block

This project currently contains one Shopify Checkout UI extension: `announcement-countdown-block`. It renders a merchant-configurable announcement with a countdown to a shared event end time. The extension targets `purchase.checkout.block.render`.

## Local development

Install dependencies with `pnpm install`, then run `pnpm dev`. The script uses `shopify.app.countdown-block.toml` and the development store selected in Shopify CLI. Run `pnpm build` to build the app without starting a preview.

In Shopify admin, open **Settings → Checkout → Customize**, choose **Add app block**, and select `announcement-countdown-block`. Set `text` to include `{countdown}`, then set `event_start` and `event_end`. The block appears only between those two times. The merchant can choose Banner or Box styling and optionally limit visibility to specific product variants. See [extension settings](./extensions/announcement-countdown-block/README.md).

## Installing on other stores

This is currently an [extension-only app](https://shopify.dev/docs/apps/build/app-extensions/build-extension-only-app). Shopify supports extension-only apps with **custom distribution** only. A [custom install link](https://shopify.dev/docs/apps/launch/distribution/select-distribution-method) can install the app on one store, or on multiple stores in the same Shopify Plus organization. To distribute to unrelated merchants, move this extension into a hosted Shopify app, set a hosted `application_url`, choose **Public distribution** in the Dev Dashboard, and complete Shopify App Store review. A [public listing with limited visibility](https://shopify.dev/docs/apps/launch/distribution/visibility) can still be installed through its listing link.

The `purchase.checkout.block.render` target is available on checkout steps for [Shopify Plus stores](https://shopify.dev/docs/api/checkout-extensions). After installing the app, each merchant must [add and configure the block](https://shopify.dev/docs/apps/build/checkout/test-checkout-ui-extensions) in the checkout editor.

The current app configuration points to Shopify's default extension-only App Home URL and is for local development/custom distribution. Do not select a distribution method on a production app until its hosting and audience are decided; [Shopify doesn't allow changing the distribution method afterward](https://shopify.dev/docs/apps/launch/distribution/select-distribution-method).

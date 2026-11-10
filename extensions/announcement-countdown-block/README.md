# Checkout Countdown Announcement Block

独立的 Checkout UI Extension，使用 `purchase.checkout.block.render` 动态区块展示可配置通知条。安装后需在 Checkout Editor 中将该区块添加到需要的位置。

## 配置

- `component_type`：选择 `banner` 或 `box`，代码默认 `banner`
- `variant_ids`：可选；填写后仅当 Checkout 包含其中任意 Variant 时显示，多个 ID 用逗号分隔，同时支持纯数字 ID 和完整 Shopify Variant GID
- `banner_tone`：仅用于 Banner，可选 `auto`、`info`、`success`、`warning` 或 `critical`，代码默认 `warning`
- `icon`：仅用于 Box，选择 Shopify Checkout 官方图标或 `none`，代码默认 `none`
- `bg_color`：仅用于 Box，可选 `subdued`、`base` 或 `transparent`，代码默认 `subdued`
- `border_color`：仅用于 Box，可选 `base` 或 `none`，代码默认 `base`
- `box_text_size`：仅用于 Box，可选 `paragraph` 或 `heading`，代码默认 `paragraph`
- `countdown_text_color`：仅用于 Box，选择 Shopify 支持的语义 tone，代码默认 `critical`
- `text`：默认 `Your order is reserved for {countdown}`；可用 `{countdown}` 插入倒计时
- `event_start` / `event_end`：活动起止时间，默认不配置

当 `text` 包含 `{countdown}` 时，商家在 Checkout Editor 中统一设置 `event_start` 和 `event_end`。两个时间都必须有效，通知条仅在活动区间内显示。剩余天数大于 `0` 时格式为 `天 : 时 : 分 : 秒`，Box 中预留 `120px`；天数为 `0` 时隐藏天数并显示为 `时 : 分 : 秒`，Box 中预留 `95px`。倒计时内部不会断行，空间不足时会整体换到下一行。当 `text` 不含 `{countdown}` 时，不启用计时器、忽略活动时间，并将通知作为普通文本常驻显示。

当 `variant_ids` 留空时，不限制商品；填写后会监听 Checkout 购物车行及 bundle components，只有命中任意配置的 Variant ID 时才显示整个组件。

## Shopify 样式限制

Checkout UI Extension 不能渲染任意 HTML 或覆盖组件 CSS。Banner 的颜色和内置状态图标由 `banner_tone` 决定，完整通知文本通过 `heading` 输出，因此不支持固定倒计时宽度或单独设置倒计时颜色。Box 支持可选官方图标及有限的背景、边框和倒计时文本 tone。两种组件都会跟随商店 Checkout Branding。

/// <reference types="@shopify/ui-extensions/checkout" />

import "@shopify/ui-extensions/preact";
import { Fragment, render } from "preact";
import { useEffect, useState } from "preact/hooks";
import {
  useCartLines,
  useSettings,
} from "@shopify/ui-extensions/checkout/preact";

import {
  COUNTDOWN_TOKEN,
  getAnnouncementState,
  parseEventTime,
} from "./countdown";

const DEFAULT_TEXT = "Your order is reserved for {countdown}";
const COUNTDOWN_INLINE_SIZE_WITH_DAYS = "120px";
const COUNTDOWN_INLINE_SIZE_WITHOUT_DAYS = "95px";
const ICON_TYPES = new Set([
  "cart",
  "note",
  "settings",
  "reset",
  "map",
  "menu",
  "search",
  "circle",
  "filter",
  "image",
  "alert-circle",
  "alert-triangle-filled",
  "alert-triangle",
  "arrow-down",
  "arrow-left",
  "arrow-right",
  "arrow-up-right",
  "arrow-up",
  "bag",
  "bullet",
  "calendar",
  "camera",
  "caret-down",
  "cash-dollar",
  "categories",
  "gift-card",
  "check-circle",
  "check-circle-filled",
  "check",
  "chevron-down",
  "chevron-left",
  "chevron-right",
  "chevron-up",
  "clipboard",
  "clock",
  "credit-card",
  "delete",
  "delivered",
  "delivery",
  "disabled",
  "discount",
  "edit",
  "email",
  "empty",
  "external",
  "geolocation",
  "globe",
  "grid",
  "info-filled",
  "info",
  "list-bulleted",
  "location",
  "lock",
  "menu-horizontal",
  "menu-vertical",
  "minus",
  "mobile",
  "order",
  "organization",
  "plus",
  "profile",
  "question-circle-filled",
  "question-circle",
  "reorder",
  "return",
  "savings",
  "star-filled",
  "star-half",
  "star",
  "store",
  "truck",
  "upload",
  "x-circle-filled",
  "x-circle",
  "x",
]);

export default function extension() {
  render(<Extension />, document.body);
}

function Extension() {
  const settings = useSettings();
  const cartLines = useCartLines();
  const text = getTextSetting(settings.text);
  const hasCountdown = text.includes(COUNTDOWN_TOKEN);
  const eventStart = getOptionalString(settings.event_start);
  const eventEnd = getOptionalString(settings.event_end);
  const matchesVariant = matchesConfiguredVariant(
    settings.variant_ids,
    cartLines,
  );
  const now = useClock(
    hasCountdown && matchesVariant,
    eventStart,
    eventEnd,
  );
  const announcementState = getAnnouncementState({
    text,
    eventStart,
    eventEnd,
    now,
  });

  if (
    !matchesVariant ||
    text.trim() === "" ||
    announcementState.type === "hidden"
  ) {
    return null;
  }

  const countdown =
    announcementState.type === "countdown"
      ? announcementState.countdown
      : null;

  if (getComponentType(settings.component_type) === "box") {
    return <BoxAnnouncement settings={settings} text={text} countdown={countdown} />;
  }

  return (
    <s-banner
      tone={getBannerTone(settings.banner_tone)}
      heading={formatAnnouncementText(text, countdown)}
    />
  );
}

function BoxAnnouncement({settings, text, countdown}) {
  const icon = getIconType(settings.icon);
  const background = getBoxBackground(settings.bg_color);
  const border = getBoxBorder(settings.border_color);
  const textSize = getBoxTextSize(settings.box_text_size);
  const countdownTone = getCountdownTone(settings.countdown_text_color);

  return (
    <s-query-container>
      <s-box>
        <s-box
          background={background}
          border={border}
          borderRadius='base'
          padding='large'
        >
          <s-grid
            gridTemplateColumns={icon ? 'auto minmax(0, 1fr)' : 'minmax(0, 1fr)'}
            alignItems='start'
            gap='@container (inline-size > 400px) small-100, small-300'
          >
            {icon ? (
              <s-icon
                type={icon}
                size='base'
                tone='neutral'
              />
            ) : null}

            <AnnouncementText
              text={text}
              countdown={countdown}
              textSize={textSize}
              countdownTone={countdownTone}
            />
          </s-grid>
        </s-box>
      </s-box>
    </s-query-container>
  )
}

function AnnouncementText({text, countdown, textSize, countdownTone}) {
  if (countdown === null) {
    return <AnnouncementTextSegment textSize={textSize}>{text}</AnnouncementTextSegment>;
  }

  const parts = text.split(COUNTDOWN_TOKEN);

  return (
    <s-stack
      direction='inline'
      alignItems='center'
      gap='none'
    >
      {parts.map((part, index) => (
        <Fragment key={index}>
          {part ? (
            <AnnouncementTextSegment textSize={textSize}>
              {preserveBoundarySpaces(part)}
            </AnnouncementTextSegment>
          ) : null}
          {index < parts.length - 1 ? (
            <s-box minInlineSize={getCountdownInlineSize(countdown)}>
              <AnnouncementTextSegment
                textSize={textSize}
                tone={countdownTone}
              >
                {countdown}
              </AnnouncementTextSegment>
            </s-box>
          ) : null}
        </Fragment>
      ))}
    </s-stack>
  )
}

function AnnouncementTextSegment({textSize, tone = undefined, children}) {
  if (textSize === "paragraph") {
    return (
      <s-paragraph>
        <s-text type="strong" tone={tone}>
          {children}
        </s-text>
      </s-paragraph>
    );
  }

  return (
    <s-heading accessibilityRole="presentation">
      {tone ? <s-text tone={tone}>{children}</s-text> : children}
    </s-heading>
  );
}

function preserveBoundarySpaces(value) {
  return value
    .replace(/^ +/, (spaces) => "\u00A0".repeat(spaces.length))
    .replace(/ +$/, (spaces) => "\u00A0".repeat(spaces.length));
}

function getCountdownInlineSize(countdown) {
  return countdown.split(":").length === 3
    ? COUNTDOWN_INLINE_SIZE_WITHOUT_DAYS
    : COUNTDOWN_INLINE_SIZE_WITH_DAYS;
}

function useClock(enabled, eventStart, eventEnd) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const currentTime = Date.now();
    setNow(currentTime);

    const endTime = parseEventTime(eventEnd);
    if (!enabled || endTime === null || currentTime >= endTime) {
      return undefined;
    }

    const intervalId = setInterval(() => {
      const nextTime = Date.now();
      setNow(nextTime);

      if (nextTime >= endTime) {
        clearInterval(intervalId);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [enabled, eventStart, eventEnd]);

  return now;
}

function getTextSetting(value) {
  return typeof value === "string" ? value : DEFAULT_TEXT;
}

function getOptionalString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function matchesConfiguredVariant(value, cartLines) {
  const configuredIds = new Set(
    getOptionalString(value)
      .split(/[,，]/)
      .map(normalizeVariantId)
      .filter(Boolean),
  );

  if (configuredIds.size === 0) {
    return true;
  }

  return cartLines.some((line) => {
    if (configuredIds.has(normalizeVariantId(line.merchandise.id))) {
      return true;
    }

    return line.lineComponents.some((component) =>
      configuredIds.has(normalizeVariantId(component.merchandise.id)),
    );
  });
}

function normalizeVariantId(value) {
  const variantId = getOptionalString(value);
  const gidMatch = variantId.match(
    /^gid:\/\/shopify\/ProductVariant\/(.+)$/i,
  );

  return gidMatch ? gidMatch[1] : variantId;
}

function getComponentType(value) {
  return getOptionalString(value).toLowerCase() === "box" ? "box" : "banner";
}

function formatAnnouncementText(text, countdown) {
  return countdown === null
    ? text
    : text.split(COUNTDOWN_TOKEN).join(countdown);
}

function getBannerTone(value) {
  switch (getOptionalString(value).toLowerCase()) {
    case "auto":
      return "auto";
    case "info":
      return "info";
    case "success":
      return "success";
    case "critical":
      return "critical";
    default:
      return "warning";
  }
}

function getBoxBackground(value) {
  switch (getOptionalString(value).toLowerCase()) {
    case "base":
      return "base";
    case "transparent":
      return "transparent";
    default:
      return "subdued";
  }
}

function getBoxBorder(value) {
  return getOptionalString(value).toLowerCase() === "none"
    ? "none"
    : "base base solid";
}

function getBoxTextSize(value) {
  return getOptionalString(value).toLowerCase() === "heading"
    ? "heading"
    : "paragraph";
}

/** @returns {import('preact').JSX.IntrinsicElements['s-icon']['type']} */
function getIconType(value) {
  const icon = getOptionalString(value).toLowerCase();
  return ICON_TYPES.has(icon)
    ? /** @type {import('preact').JSX.IntrinsicElements['s-icon']['type']} */ (icon)
    : "";
}

function getCountdownTone(value) {
  switch (getOptionalString(value).toLowerCase()) {
    case "auto":
      return "auto";
    case "neutral":
      return "neutral";
    case "info":
      return "info";
    case "success":
      return "success";
    case "warning":
      return "warning";
    default:
      return "critical";
  }
}

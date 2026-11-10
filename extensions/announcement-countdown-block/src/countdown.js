export const COUNTDOWN_TOKEN = "{countdown}";

const SECOND_IN_MS = 1000;
const MINUTE_IN_SECONDS = 60;
const HOUR_IN_SECONDS = 60 * MINUTE_IN_SECONDS;
const DAY_IN_SECONDS = 24 * HOUR_IN_SECONDS;
const NON_BREAKING_SPACE = "\u00A0";

export function parseEventTime(value) {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

export function getAnnouncementState({text, eventStart, eventEnd, now}) {
  if (!text.includes(COUNTDOWN_TOKEN)) {
    return {type: "static"};
  }

  const startTime = parseEventTime(eventStart);
  const endTime = parseEventTime(eventEnd);

  if (
    startTime === null ||
    endTime === null ||
    startTime >= endTime ||
    now < startTime ||
    now >= endTime
  ) {
    return {type: "hidden"};
  }

  return {
    type: "countdown",
    countdown: formatCountdown(endTime - now),
  };
}

export function formatCountdown(milliseconds) {
  let remainingSeconds = Math.max(
    0,
    Math.ceil(milliseconds / SECOND_IN_MS),
  );

  const days = Math.floor(remainingSeconds / DAY_IN_SECONDS);
  remainingSeconds %= DAY_IN_SECONDS;

  const hours = Math.floor(remainingSeconds / HOUR_IN_SECONDS);
  remainingSeconds %= HOUR_IN_SECONDS;

  const minutes = Math.floor(remainingSeconds / MINUTE_IN_SECONDS);
  const seconds = remainingSeconds % MINUTE_IN_SECONDS;

  const values = days > 0
    ? [String(days), padTwo(hours), padTwo(minutes), padTwo(seconds)]
    : [padTwo(hours), padTwo(minutes), padTwo(seconds)];

  return values
    .join(`${NON_BREAKING_SPACE}:${NON_BREAKING_SPACE}`);
}

function padTwo(value) {
  return String(value).padStart(2, "0");
}

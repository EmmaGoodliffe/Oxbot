import type { Week } from "./commitment";
import { gregToOxDate, toInt } from "./date";

const jsToLocalTime = (d: Date) => d.toLocaleTimeString().slice(0, 5);

const jsToUtcTime = (d: Date) =>
  d.toUTCString().split(" ").slice(-2)[0].slice(0, 5);

export const addTimes = (a: string, b: string) => {
  const aDate = new Date();
  const [aHours, aMins] = a.split(":").map(toInt);
  aDate.setHours(aHours);
  aDate.setMinutes(aMins);
  const [bHours, bMins] = b.split(":").map(toInt);
  const date = new Date(aDate.valueOf() + (bHours * 60 + bMins) * 60 * 1000);
  if (aDate.toLocaleDateString("en-GB") !== date.toLocaleDateString("en-GB")) {
    return null;
  }
  return jsToLocalTime(date);
};

export const localToUtcTime = (local: string) => {
  const [hours, mins] = local.split(":").map(toInt);
  const d = new Date();
  d.setHours(hours);
  d.setMinutes(mins);
  return (
    d.getUTCHours().toString().padStart(2, "0") +
    ":" +
    d.getUTCMinutes().toString().padStart(2, "0")
  );
};

export const utcToLocalTime = (utc: string) => {
  const [hours, mins] = utc.split(":").map(toInt);
  const d = new Date();
  d.setUTCHours(hours);
  d.setUTCMinutes(mins);
  return (
    d.getHours().toString().padStart(2, "0") +
    ":" +
    d.getMinutes().toString().padStart(2, "0")
  );
};

const gregDate = (year: number, month: number, date: number) =>
  `${year}-${month.toString().padStart(2, "0")}-${date
    .toString()
    .padStart(2, "0")}`;

export const jsToGregDate = (date: Date) =>
  gregDate(date.getFullYear(), date.getMonth() + 1, date.getDate());

const jsToUtcGregDate = (date: Date) =>
  gregDate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());

export const getNow = () => {
  const d = new Date();
  return {
    localDate: jsToGregDate(d),
    utcDate: jsToUtcGregDate(d),
    localTime: jsToLocalTime(d),
    utcTime: jsToUtcTime(d),
  };
};

export const getDuration = (a?: string, b?: string | null) => {
  if (typeof a !== "string" || typeof b !== "string") {
    return null;
  }
  const [aHours, aMins] = a.split(":").map(toInt);
  const [bHours, bMins] = b.split(":").map(toInt);
  let hours = bHours - aHours;
  let mins = bMins - aMins;
  if (mins < 0) {
    hours--;
    mins += 60;
  }
  if (hours < 0) {
    return null;
  }
  return { hours, mins };
};

export const getDurationAsTime = (a?: string, b?: string | null) => {
  const duration = getDuration(a, b);
  if (duration === null) {
    throw new Error("Bad duration");
  }
  const { hours, mins } = duration;
  return (
    hours.toString().padStart(2, "0") + ":" + mins.toString().padStart(2, "0")
  );
};

export const displayDuration = (a?: string, b?: string | null) => {
  const duration = getDuration(a, b);
  if (duration === null) {
    return ".";
  }
  const { hours, mins } = duration;
  if (hours === 0) {
    return `${mins} mins`;
  } else {
    return `${hours} hrs ${mins} mins`;
  }
};

const getUtcLonNoon = () => {
  // From https://stackoverflow.com/a/64262840
  const gmtOffsetString = Intl.DateTimeFormat("en", {
    timeZoneName: "short",
    timeZone: "Europe/London",
  })
    .formatToParts()
    .find(i => i.type === "timeZoneName")?.value; // `GMT` or `GMT+1`
  const offset = toInt(gmtOffsetString?.slice(3) ?? 0);
  return `${12 - offset}:00`;
};

export const isAwake = (week: Week) => {
  const utcLonNoon = getUtcLonNoon();
  const now = getNow();
  const timeSinceLonNoon = getDuration(utcLonNoon, now.utcTime);
  const isPastLonNoon = timeSinceLonNoon !== null;
  const lad = week.latest_active_day;
  const wasActiveToday = lad && lad === gregToOxDate(now.utcDate)?.day;
  return { isPastLonNoon, wasActiveToday, utcLonNoon };
};

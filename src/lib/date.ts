export const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export const terms = ["MT", "HT", "TT"] as const;

export interface OxDate {
  year: number;
  term: (typeof terms)[number];
  week: number;
  day: (typeof days)[number];
}

const toInt = (x: number | string) =>
  typeof x === "number" ? Math.floor(x) : parseInt(x);

export const oxDate = (
  year: number | string,
  term: OxDate["term"],
  week: number | string,
  day: string // TODO: specify type
): OxDate | undefined => {
  // 2023 TT 11 Sat
  const y = toInt(year);
  if (y < 2022 || y > 2026) return undefined;
  const w = toInt(week);
  // if (w < -1 || w > 10) return undefined;
  if (!days.includes(day as OxDate["day"])) return undefined;
  return {
    year: y,
    term,
    week: w,
    day: day as OxDate["day"],
  };
};

const termDates = [
  { year: 2022, term: "MT", dates: ["Sun 09 Oct", "Sat 03 Dec"] },
  { year: 2023, term: "HT", dates: ["Sun 15 Jan", "Sat 11 Mar"] },
  { year: 2023, term: "TT", dates: ["Sun 23 Apr", "Sat 17 Jun"] },
  { year: 2023, term: "MT", dates: ["Sun 08 Oct", "Sat 02 Dec"] },
  { year: 2024, term: "HT", dates: ["Sun 14 Jan", "Sat 09 Mar"] },
  { year: 2024, term: "TT", dates: ["Sun 21 Apr", "Sat 15 Jun"] },
] as const;

const getWeekDiff = (since: string, now: string) =>
  Math.floor((Date.parse(now) - Date.parse(since)) / (7 * 24 * 3600 * 1000));

export const gregToOxDate = (date: string) => {
  const day = days[new Date(date).getDay()];
  // Within term time
  for (let i = 0; i < termDates.length; i++) {
    const term = termDates[i];
    const [start, end] = term.dates.map(d => d + " " + term.year);
    if (getWeekDiff(start, date) >= 0 && getWeekDiff(date, end) >= 0) {
      return oxDate(term.year, term.term, getWeekDiff(start, date) + 1, day);
    }
  }
  // Between term times
  for (let i = 0; i < termDates.length - 1; i++) {
    const term = termDates[i];
    const [, end] = term.dates.map(d => d + " " + term.year);
    const nextTerm = termDates[i + 1];
    const [nextStart] = nextTerm.dates.map(d => d + " " + term.year);
    const weeksAfterCurrent = getWeekDiff(end, date);
    const weeksBeforeNext = getWeekDiff(date, nextStart);
    if (weeksAfterCurrent >= 0 && weeksBeforeNext >= 0) {
      if (weeksAfterCurrent <= weeksBeforeNext) {
        return oxDate(term.year, term.term, weeksAfterCurrent + 1 + 8, day);
      } else {
        return oxDate(nextTerm.year, nextTerm.term, -weeksBeforeNext - 1, day);
      }
    }
  }
  throw new Error("Bad Gregorian date");
};

const gregDate = (year: number, month: number, date: number) =>
  `${year}-${month.toString().padStart(2, "0")}-${date
    .toString()
    .padStart(2, "0")}`;

export const jsToGregDate = (date: Date) =>
  gregDate(date.getFullYear(), date.getMonth() + 1, date.getDate());

export const oxToGregDate = (oxDate: OxDate) => {
  const daysIntoTerm = 7 * (oxDate.week - 1) + days.indexOf(oxDate.day);
  const matchingDate = termDates.find(
    term => oxDate.year === term.year && oxDate.term === term.term
  );
  if (matchingDate === undefined) {
    throw new Error("Couldn't convert Ox date to Gregorian");
  }
  const startNum = Date.parse(matchingDate.dates[0] + " " + matchingDate.year);
  return jsToGregDate(new Date(startNum + daysIntoTerm * (24 * 3600 * 1000)));
};

const js = new Date();
const greg = jsToGregDate(js);
const ox = gregToOxDate(greg);
const composite = ox === undefined ? undefined : oxToGregDate(ox);
if (greg !== composite) {
  console.error({ js: js.toString(), greg, ox, composite });
  throw new Error("Date is broken");
}

export const timeInputToInt = (t: string) => {
  if (t.length !== 5) {
    throw new Error("Wrong length");
  }
  const result = toInt(t.replace(":", ""));
  if (isNaN(result)) {
    throw new Error("NaN");
  }
  return result;
};

export const intToTimeInput = (t: number) => {
  if (isNaN(t)) {
    throw new Error("NaN");
  }
  const padded = t.toString().padStart(4, "0");
  return padded.slice(0, 2) + ":" + padded.slice(2, 4);
};

const dateToTimeInput = (d: Date) => d.toLocaleTimeString("en-GB").slice(0, 5);

export const addTimes = (a: number, b: string) => {
  const aDate = new Date();
  const [aHours, aMins] = intToTimeInput(a).split(":").map(toInt);
  aDate.setHours(aHours);
  aDate.setMinutes(aMins);
  const [bHours, bMins] = b.split(":").map(toInt);
  const date = new Date(aDate.valueOf() + (bHours * 60 + bMins) * 60 * 1000);
  if (aDate.toLocaleDateString("en-GB") !== date.toLocaleDateString("en-GB")) {
    return null;
  }
  const time = dateToTimeInput(date);
  return timeInputToInt(time);
};

const getDuration = (a?: number, b?: number | null) => {
  if (typeof a !== "number" || typeof b !== "number") {
    return null;
  }
  const [aHours, aMins] = intToTimeInput(a).split(":").map(toInt);
  const [bHours, bMins] = intToTimeInput(b).split(":").map(toInt);
  let hours = bHours - aHours;
  let mins = bMins - aMins;
  if (hours < 0) {
    return null;
  } else if (mins < 0) {
    hours--;
    mins += 60;
  }
  return { hours, mins };
};

export const getDurationAsTimeInput = (a?: number, b?: number | null) => {
  const duration = getDuration(a, b);
  if (duration === null) {
    throw new Error("Bad duration");
  }
  const { hours, mins } = duration;
  return (
    hours.toString().padStart(2, "0") + ":" + mins.toString().padStart(2, "0")
  );
};

export const displayDuration = (a?: number, b?: number | null) => {
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

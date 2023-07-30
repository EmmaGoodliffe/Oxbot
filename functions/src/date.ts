import { getNow, jsToGregDate } from "./time";

export const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export const terms = ["MT", "HT", "TT"] as const;

export interface OxDate {
  year: number;
  term: (typeof terms)[number];
  week: number;
  day: (typeof days)[number];
}

export const toInt = (x: number | string) =>
  typeof x === "number" ? Math.floor(x) : parseInt(x);

export const oxDate = (
  year: number | string,
  term: OxDate["term"],
  week: number | string,
  day: OxDate["day"]
): OxDate | undefined => {
  const y = toInt(year);
  if (y < 2022 || y > 2026) return undefined;
  const w = toInt(week);
  return { year: y, term, week: w, day };
};

export const getWeekId = (date: OxDate | Omit<OxDate, "day">) =>
  `${date.year.toString().slice(2, 4)}-${date.term}-${date.week}`;

const termDates = [
  { year: 2022, term: "MT", dates: ["Sun 09 Oct", "Sat 03 Dec"] },
  { year: 2023, term: "HT", dates: ["Sun 15 Jan", "Sat 11 Mar"] },
  { year: 2023, term: "TT", dates: ["Sun 23 Apr", "Sat 17 Jun"] },
  { year: 2023, term: "MT", dates: ["Sun 08 Oct", "Sat 02 Dec"] },
  { year: 2024, term: "HT", dates: ["Sun 14 Jan", "Sat 09 Mar"] },
  { year: 2024, term: "TT", dates: ["Sun 21 Apr", "Sat 15 Jun"] },
] as const;

export const gregToOxDate = (date: string) => {
  const getWeekDiff = (since: string, now: string) => {
    const sinceDate = new Date(new Date(since).toDateString());
    const nowDate = new Date(new Date(now).toDateString());
    return Math.floor(
      (nowDate.valueOf() - sinceDate.valueOf()) / (7 * 24 * 3600 * 1000)
    );
  };

  const getNextDay = (date: string) => {
    const result = new Date(date);
    result.setDate(result.getDate() + 1);
    return jsToGregDate(result);
  };

  const day = days[new Date(date).getDay()];
  // Within term time
  for (let i = 0; i < termDates.length; i++) {
    const term = termDates[i];
    const [start, end] = term.dates.map(d => d + " " + term.year);
    if (getWeekDiff(start, date) >= 0 && getWeekDiff(date, end) >= 0) {
      const week = getWeekDiff(start, date) + 1;
      return oxDate(term.year, term.term, week, day);
    }
  }
  // Between term times
  for (let i = 0; i < termDates.length - 1; i++) {
    const term = termDates[i];
    const [, end] = term.dates.map(d => d + " " + term.year);
    const ninth = getNextDay(end);
    const nextTerm = termDates[i + 1];
    const [nextStart] = nextTerm.dates.map(d => d + " " + term.year);
    const weeksAfterNinth = getWeekDiff(ninth, date);
    const weeksBeforeNext = getWeekDiff(date, nextStart);
    if (weeksAfterNinth >= 0 && weeksBeforeNext >= 0) {
      if (weeksAfterNinth <= weeksBeforeNext) {
        return oxDate(term.year, term.term, weeksAfterNinth + 9, day);
      } else {
        return oxDate(nextTerm.year, nextTerm.term, -weeksBeforeNext, day);
      }
    }
  }
  throw new Error("Bad Gregorian date");
};

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

const greg = getNow().localDate;
const ox = gregToOxDate(greg);
const composite = ox === undefined ? undefined : oxToGregDate(ox);
if (greg !== composite) {
  console.error({ greg, ox, composite });
  throw new Error("Dates are broken");
}

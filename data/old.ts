import timetable from './timetable.json';
import { keyValuesToObj } from '../src/lib/db';
import { Commitment } from '../functions/src/types';

const titles = [
  "Week",
  "Day",
  "9am",
  "10am",
  "11am",
  "12pm",
  "Afternoon",
] as const;
const data = timetable.MT;

const days = data.map(d => keyValuesToObj(titles, d));
// const days = days_ as ((typeof days_)[number] & {Day: "Monday"|"Tuesday"|"Wednesday"|"Thursday"|"Friday"})[]

console.log(days.map(d => d.Afternoon));

const cellToCom = (
  d: (typeof days)[number],
  key: (typeof titles)[number]
): Commitment | null => {
  if (key === "Week" || key === "Day") return null;
  // "13.00 - 17.00 Practicals 18.00 - 19.00 Language Opt"
  if (key === "Afternoon") return afternoonToComs(d);
  const startHour = parseInt(key);
  const endHour = startHour + 1;
  return {
    type: "lecture",
    day: d.Day.slice(0, 3) as Commitment["day"],
    time: `${startHour.toString().padStart(2, "0")}:00`,
    endTime: `${endHour.toString().padStart(2, "0")}:00`,
    loca,
  };
};

const daysToComs = (d: (typeof days)[number]): Commitment[] => {};

const daysToBatch = (ds: typeof days) =>
  ds.map(
    (d): Batched => ({
      date: { year: 2023, term: "MT", week: parseInt(d.Week) },
      commitments: daysToComs(d),
    })
  );

// const go = async () => {
//   await navigator.clipboard.writeText(JSON.stringify(days))
// }

// go().then(() => console.log('done'))

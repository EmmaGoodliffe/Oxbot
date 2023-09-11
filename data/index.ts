import lectures from "./lectures";
import { keyValuesToObj } from "../src/lib/db";
import type { Batched, Commitment } from "../functions/src/types";
import labs from "./labs";

type WithoutFirst<A extends readonly unknown[]> = Exclude<A[number], A[0]>;
type Col<N extends number> = WithoutFirst<
  (typeof lectures)[number]["table"]
>[N];

type Term = Col<2>;
type Room = Col<4>;

type Titles = (typeof lectures)[number]["table"][0];
type Values = WithoutFirst<(typeof lectures)[number]["table"]>;

const jsonToTable = <K extends readonly string[], V extends readonly unknown[]>(
  table: readonly [K, ...V[]] // don't make this generic
) => {
  const [titles, ...data] = table;
  return data.map(row => keyValuesToObj(titles, row));
};

const time = (x: string /* "9.00" */) =>
  x.trim().replace(".", ":").padStart(5, "0");

const getCode = (title: (typeof lectures)[number]["title"]) =>
  ((
    {
      "Intro to year 2": "#",
      "Introduction to Physics in Schools option": "#",
      Electromagnetism: "EM",
      "Probability and Statistics": "P&S",
      "Mathematical Methods": "MM",
      "Analogue Electronics": "AE",
      "Statistical and Thermal Physics": "S&TP",
      "Quantum Mechanics": "QM",
    } as const
  )[title]);

const getArea = (room: Room) =>
  ((
    {
      "Martin Wood Lecture Theatre, Clarendon": "Dept",
      "Lindemann Lecture Theatre, Clarendon": "Dept",
    } as const
  )[room]);

const getYear = (term: Term) => (term === "Michaelmas" ? 2023 : 2024);

const getTerm = (term: Term) =>
  (({ Michaelmas: "MT", Hilary: "HT", Trinity: "TT" } as const)[term]);

const lectureBatches = lectures.map(series =>
  jsonToTable<Titles, Values>(series.table).map((lecture, i): Batched => {
    const [start, end] = lecture.Time.split("-");
    return {
      commitment: {
        type: "lecture",
        day: lecture.Day.slice(0, 3) as Commitment["day"],
        time: time(start),
        endTime: time(end),
        location: {
          area: getArea(lecture.Room),
          within: lecture.Room,
        },
        details: {
          number: i.toString(),
          year: "2",
          code: getCode(series.title),
        },
        tag: new Date().toISOString(),
      },
      date: {
        year: getYear(lecture.Term),
        term: getTerm(lecture.Term),
        week: parseInt(lecture.Week),
      },
    };
  })
);

interface Lab {
  date: Batched["date"];
  day: Commitment["day"];
  time: Commitment["time"];
  endTime: Commitment["endTime"];
}

const combineLabs = (a: Lab, b: Lab) => {
  if (
    a.date.year === b.date.year &&
    a.date.term === b.date.term &&
    a.date.week === b.date.week &&
    a.day === b.day &&
    a.endTime === b.time
  ) {
    return [{ ...a, endTime: b.endTime }];
  } else {
    return [a, b];
  }
};

const recursivelyCombineLabs = (labs: Lab[], n: number): Lab[] => {
  const combined: Lab[] = [];
  for (let i = 0; i < labs.length - 1; i += 2) {
    combined.push(...combineLabs(labs[i], labs[i + 1]));
  }
  if (n > 100) {
    throw new Error("Recursion panic");
  }
  if (labs.length === combined.length) {
    return combined;
  } else {
    return recursivelyCombineLabs(combined, n + 1);
  }
};

const labBatches = recursivelyCombineLabs(
  jsonToTable(labs.table).map(lab => {
    const [start, end] = lab.Time.split("-");
    return {
      day: lab.Day.slice(0, 3) as Commitment["day"],
      time: time(start),
      endTime: time(end),
      date: {
        year: getYear(lab.Term),
        term: getTerm(lab.Term),
        week: parseInt(lab.Week),
      },
    };
  }),
  0
).map(
  (lab): Batched => ({
    commitment: {
      type: "lab",
      day: lab.day,
      time: lab.time,
      endTime: lab.endTime,
      location: {
        area: "Labs",
      },
      details: {},
      tag: new Date().toISOString(),
    },
    date: lab.date,
  })
);

const seriesDetails = lectures.map(series => ({
  code: getCode(series.title),
  title: series.title,
  paper: series.paper,
  rec: series.rec,
}));

console.log({ lectureBatches, labBatches, seriesDetails });

// delay = s => new Promise(rs => setTimeout(rs, s * 1000)); rows = document.querySelectorAll('tr'); table = [...rows].map(r => Array.from(r.querySelectorAll('td')).map(td => td.innerText.trim().replace(/\s/g, ' '))); text = JSON.stringify({ table, rec: document.querySelector('#materialsContent3 a')?.innerText?.trim() ?? null, title: document.querySelector('#overviewContent').childNodes[4].textContent.trim(), paper: document.querySelector('#overviewContent').childNodes[10].textContent.trim() }); go = async () => {await delay(4); console.log('copy'); await navigator.clipboard.writeText(text)}; go()

import lectures from "./lectures";
import { keyValuesToObj } from "../src/lib/db";
import { Batched, Commitment } from "../functions/src/types";

type Terms = Exclude<(typeof lectures)[number]["table"][number][2], "Term">;
type Rooms = Exclude<(typeof lectures)[number]["table"][number][4], "Room">;

const jsonToTable = <K extends string>(
  table: readonly [readonly K[], ...(readonly string[])[]]
) => {
  const [titles, ...data] = table;
  return data.map(row => keyValuesToObj(titles, row));
};

const time = (x: string /* "9.00" */) =>
  x.trim().replace(".", ":").padStart(5, "0");

const getCode = (title: (typeof lectures)[number]["title"]) =>
  ((
    {
      Electromagnetism: "EM",
      "Probability and Statistics": "P&S",
      "Mathematical Methods": "MM",
      "Analogue Electronics": "AE",
      "Statistical and Thermal Physics": "S&TP",
    } as const
  )[title]);

const getArea = (room: Rooms) =>
  (({ "Lindemann Lecture Theatre, Clarendon": "Dept" } as const)[room]);

const getYear = (term: Terms) => (term === "Michaelmas" ? 2023 : 2024);

const getTerm = (term: Terms) =>
  (({ Michaelmas: "MT", Hilary: "HT", Trinity: "TT" } as const)[term]);

const coms = lectures.map(series =>
  jsonToTable(series.table).map((lecture, i): Batched => {
    const [start, end] = lecture.Time.split("-");
    const term = lecture.Term as Terms;
    const room = lecture.Room as Rooms;
    return {
      commitment: {
        type: "lecture",
        day: lecture.Day.slice(0, 3) as Commitment["day"],
        time: time(start),
        endTime: time(end),
        location: {
          area: getArea(room),
          within: room,
        },
        details: {
          number: i.toString(),
          year: "2",
          code: getCode(series.title),
        },
      },
      date: {
        year: getYear(term),
        term: getTerm(term),
        week: parseInt(lecture.Week),
      },
    };
  })
);

const seriesDetails = lectures.map(series => ({
  code: getCode(series.title),
  title: series.title,
  paper: series.paper,
  rec: series.rec,
}));

// delay = s => new Promise(rs => setTimeout(rs, s * 1000)); rows = document.querySelectorAll('tr'); table = [...rows].map(r => Array.from(r.querySelectorAll('td')).map(td => td.innerText.trim().replace(/\s/g, ' '))); text = JSON.stringify({ table, rec: document.querySelector('#materialsContent3 a').innerText.trim(), title: document.querySelector('#overviewContent').childNodes[4].textContent.trim(), paper: document.querySelector('#overviewContent').childNodes[10].textContent.trim() }); go = async () => {await delay(4); console.log('copy'); await navigator.clipboard.writeText(text)}; go()

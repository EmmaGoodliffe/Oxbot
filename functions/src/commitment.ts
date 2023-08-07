import { days, toInt } from "./date";
import { getDuration, utcToLocalTime } from "./time";

export const requiredComDetails = {
  tute: ["tutor", "subject"],
  training: ["sport"],
} as const;

type ComType = keyof typeof requiredComDetails;

export const comTypes = Object.keys(requiredComDetails) as ComType[];

interface Com<T extends ComType> {
  /** Type of commitment */
  type: T;
  /** Day of the week */
  day: (typeof days)[number];
  /** Start time in the form `00:00` */
  time: string;
  /** End time in the form `00:00` where `null` corresponds to indefinite */
  endTime: string | null;
  /** Location of commitment */
  location: {
    /** Area code where `undefined` corresponds to a default defined by `type` */
    area?: "Trin" | "Iff" | "Dept";
    /** Location within `area`, e.g. room number */
    within?: string;
    /** Journey time in minutes where `undefined` corresponds to a default defined by `area` */
    journey?: number;
  };
  /** Custom details dependent on the `type` */
  details: Record<(typeof requiredComDetails)[T][number], string>;
}
// TODO: make this clearer; possible avenues shown in https://github.com/Microsoft/TypeScript/issues/1213#issuecomment-1215039765
type DistributeComOverUnion<T> = T extends ComType ? Com<T> : never;
export type Commitment = DistributeComOverUnion<ComType>;

export interface Week {
  /** Commitments scheduled during the week */
  commitments: Commitment[];
  /** The most recent day on which user activity was logged */
  latest_active_day?: Commitment["day"];
}

const getArea = (com: Commitment) =>
  com.location.area ?? ({ tute: "Trin", training: "Iff" } as const)[com.type];

export const displayCom = (
  com: Commitment
): {
  day: Commitment["day"];
  utcTime: string;
  utcEndTime: string | null;
  localTime: string;
  localEndTime: string | null;
  title: string;
  description?: string;
  location: string;
} => {
  const result = {
    day: com.day,
    utcTime: com.time,
    utcEndTime: com.endTime,
    localTime: utcToLocalTime(com.time),
    localEndTime: com.endTime ? utcToLocalTime(com.endTime) : null,
    location: com.location.within
      ? `${com.location.within} in ${getArea(com)}`
      : getArea(com),
  };
  if (com.type === "tute") {
    return {
      ...result,
      title: `${com.details.tutor} tute`,
      description: com.details.subject,
    };
  } else if (com.type === "training") {
    return { ...result, title: `${com.details.sport} training` };
  }
  throw new Error("Unknown commitment type");
};

export const sortCommitmentsByTime = (coms: Commitment[]) =>
  [...coms].sort((a, b) => (getDuration(a.time, b.time) === null ? 1 : -1));

export const getPrepTime = (com: Commitment) => {
  const area = getArea(com);
  const journey = { Trin: 10, Iff: 20, Dept: 10 }[area];
  return journey + 15;
};

const isTime = (x: unknown) => {
  if (typeof x !== "string") return false;
  if (x.length !== 5) return false;
  const [hours, mins] = x.split(":").map(toInt);
  return !isNaN(hours) && !isNaN(mins);
};

const isArea = (x: unknown): x is Commitment["location"]["area"] => {
  if (x === undefined) return true;
  if (typeof x !== "string") return false;
  return ["Trin", "Iff", "Dept"].includes(x);
};

// type KeysOfUnion<T> = T extends {} ? keyof T : never;
// TODO: Test
// export const getJsonCommitmentValidity = (
//   json: unknown
// ):
//   | boolean
//   | keyof Commitment
//   | `location.${keyof Commitment["location"]}`
//   | `details.${KeysOfUnion<Commitment["details"]>}` => {
//   if (!(json instanceof Object)) return false;
//   // TODO: More safety here
//   const missingProperty = (
//     ["type", "day", "time", "endTime", "location", "details"] as const
//   ).find(p => !json.hasOwnProperty(p));
//   if (missingProperty) return missingProperty;
//   const k = json as Record<keyof Commitment, unknown>;
//   if (!comTypes.includes(k.type as Commitment["type"])) return "type";
//   if (!days.includes(k.day as Commitment["day"])) return "day";
//   if (!isTime(k.time)) return "time";
//   if (k.endTime !== null && !isTime(k.endTime)) return "endTime";
//   if (!(k.location instanceof Object)) return "location";
//   const { area, within, journey } = k.location as Commitment["location"];
//   if (!isArea(area)) return "location.area";
//   if (!["string", "undefined"].includes(typeof within))
//     return "location.within";
//   if (!["number", "undefined"].includes(typeof journey))
//     return "location.journey";
//   if (!(k.details instanceof Object)) return "details";
//   const t = k.type as Commitment["type"];
//   const d = k.details;
//   const missingDetail = requiredComDetails[t].find(v => !d.hasOwnProperty(v));
//   if (missingDetail) return `details.${missingDetail}`;
//   if (!Object.values(d).every(v => typeof v === "string")) return "details";
//   return true;
// };

// const isJsonCommitment = (json: unknown): json is Commitment =>
//   getJsonCommitmentValidity(json) === true;

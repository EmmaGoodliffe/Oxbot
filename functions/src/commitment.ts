import { days } from "./date";
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
  latest_active_day: Commitment["day"];
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

// TODO: ensure `00:00` is after `23:00`
export const sortCommitmentsByTime = (coms: Commitment[]) =>
  [...coms].sort((a, b) => (getDuration(a.time, b.time) === null ? -1 : 1));

export const getPrepTime = (com: Commitment) => {
  const area = getArea(com);
  const journey = { Trin: 10, Iff: 20, Dept: 10 }[area];
  return journey + 15;
};

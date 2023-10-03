import { toInt } from "./date";
import { getDuration, utcToLocalTime } from "./time";
import type { Commitment } from "./types";

export const requiredComDetails = {
  tute: ["tutor", "subject"],
  training: ["sport"],
  lecture: ["year", "code", "number"],
  lab: [],
  other: ["title", "commute", "within"],
} as const;

export const areas = ["Trin", "Iff", "Dept", "Labs"] as const;

const getArea = (com: Commitment) =>
  com.location.area ??
  (
    {
      tute: "Trin",
      training: "Iff",
      lecture: "Dept",
      lab: "Labs",
      other: undefined,
    } as const
  )[com.type];

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
  location: string | undefined;
  tag?: string;
} => {
  const result = {
    day: com.day,
    utcTime: com.time,
    utcEndTime: com.endTime,
    localTime: utcToLocalTime(com.time),
    localEndTime: com.endTime ? utcToLocalTime(com.endTime) : null,
    location: com.location.room
      ? `${com.location.room} in ${getArea(com)}`
      : getArea(com),
    tag: com.tag,
  };
  if (com.type === "tute") {
    return {
      ...result,
      title: `${com.details.tutor} tute`,
      description: com.details.subject,
    };
  } else if (com.type === "training") {
    return { ...result, title: `${com.details.sport} training` };
  } else if (com.type === "lecture") {
    return {
      ...result,
      title: `${com.details.code} lecture`,
      description: `#${com.details.number}`,
    };
  } else if (com.type === "lab") {
    return { ...result, title: "Lab" };
  } else if (com.type === "other") {
    return { ...result, title: com.details.title };
  }
  throw new Error("Unknown commitment type");
};

export const sortCommitmentsByTime = (coms: Commitment[]) =>
  coms
    .map((com, i) => ({ com, index: i }))
    .sort((a, b) => (getDuration(a.com.time, b.com.time) === null ? 1 : -1));

export function areaToCommute(area: Commitment["location"]["area"]): number;
export function areaToCommute(area: string | undefined): number | undefined;
export function areaToCommute(area: string | undefined): number | undefined {
  return { Trin: 5, Iff: 20, Dept: 10, Labs: 10 }[area ?? ""];
}

const parseCommute = (x: string) =>
  isNaN(toInt(x)) ? areaToCommute(x) : toInt(x);

export const getPrepTime = (com: Commitment) => {
  const area = getArea(com);
  const commute =
    (area
      ? areaToCommute(area)
      : com.type === "other"
      ? parseCommute(com.details.commute)
      : undefined) ?? 0;
  return 20 + commute;
};

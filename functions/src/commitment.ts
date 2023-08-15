import { getDuration, utcToLocalTime } from "./time";
import type { Commitment } from "./types";

export const requiredComDetails = {
  tute: ["tutor", "subject"],
  training: ["sport"],
} as const;

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

import { days } from "./date";
import { getDuration } from "./time";

export const requiredComDetails = {
  tute: ["tutor", "subject"],
  training: ["sport"],
} as const;

type ComType = keyof typeof requiredComDetails;

export const comTypes = Object.keys(requiredComDetails) as ComType[];

interface Com<T extends ComType> {
  day: (typeof days)[number];
  time: string;
  endTime: string | null;
  type: T;
  details: Record<(typeof requiredComDetails)[T][number], string>;
}
// TODO: make this clearer; possible avenues shown in https://github.com/Microsoft/TypeScript/issues/1213#issuecomment-1215039765
type DistributeComOverUnion<T> = T extends ComType ? Com<T> : never;
export type Commitment = DistributeComOverUnion<ComType>;

export interface Week {
  commitments: Commitment[];
}

export const displayCom = (
  com: Commitment
): {
  day: Commitment["day"];
  time: string;
  endTime: string | null;
  title: string;
  description?: string;
} => {
  const result = {
    day: com.day,
    time: com.time,
    endTime: com.endTime,
  };
  if (com.type === "tute") {
    return {
      ...result,
      title: `${com.details.tutor} tute`,
      description: com.details.subject,
    };
  }
  if (com.type === "training") {
    return { ...result, title: `${com.details.sport} training` };
  }
  throw new Error("Unknown commitment type");
};

export const sortCommitmentsByTime = (coms: Commitment[]) =>
  [...coms].sort((a, b) => {
    const dur = getDuration(a.time, b.time);
    if (dur === null) {
      return 1;
    }
    return dur.hours < 0 || dur.mins < 0 ? 1 : -1;
  });

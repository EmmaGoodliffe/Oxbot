import { type days, intToTimeInput } from "./date";

export const requiredComDetails = {
  tute: ["tutor", "subject"],
  training: ["sport"],
} as const;

type ComType = keyof typeof requiredComDetails;

export const comTypes = Object.keys(requiredComDetails) as ComType[];

interface Com<T extends ComType> {
  day: (typeof days)[number];
  time: number;
  endTime: number | null;
  type: T;
  details: Record<(typeof requiredComDetails)[T][number], string>;
}
// TODO: make this clearer; possible avenues shown in https://github.com/Microsoft/TypeScript/issues/1213#issuecomment-1215039765
type DistributeComOverUnion<T> = T extends ComType ? Com<T> : never;
export type Commitment = DistributeComOverUnion<ComType>;

export const displayCom = (com: Commitment) => {
  const result = {
    day: com.day,
    time: intToTimeInput(com.time),
    endTime: com.endTime === null ? null : intToTimeInput(com.endTime),
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

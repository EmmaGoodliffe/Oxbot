import { requiredComDetails } from "./commitment";
import { days, type OxDate } from "./date";

type ApiOkRes<T extends object> = {
  status: number;
  info: string;
  result: T;
};
type ApiErrorRes = {
  status: number;
  info: string;
  error: string;
};
export type ApiRes<T extends object = Record<string, unknown>> =
  | ApiOkRes<T>
  | ApiErrorRes;

export const isErrorRes = <T extends object>(
  res: ApiRes<T>
): res is ApiErrorRes => typeof (res as ApiErrorRes).error === "string";

type ComType = keyof typeof requiredComDetails;

export const comTypes = Object.keys(requiredComDetails) as ComType[];

interface Com<T extends ComType> {
  /** Type of commitment */
  type: T;
  /** Day of the week */
  day: (typeof days)[number];
  /**
   * Start time in the form `00:00`
   * @minLength 5
   * @maxLength 5
   */
  time: string;
  /**
   * End time in the form `00:00` where `null` corresponds to indefinite
   * @minLength 5
   * @maxLength 5
   */
  endTime: string | null;
  /** Location of commitment */
  location: {
    /** Area code where `undefined` corresponds to a default defined by `type` */
    area?: "Trin" | "Iff" | "Dept" | "Labs";
    /** Location within `area`, e.g. room number */
    within?: string;
    /** Journey time in minutes where `undefined` corresponds to a default defined by `area` */
    journey?: number;
  };
  /** Custom details dependent on the `type` */
  details: Record<(typeof requiredComDetails)[T][number], string>;
  /** An optional tag shared between related commitments as a reference for future operations */
  tag?: string;
}
// Could be improved via https://github.com/Microsoft/TypeScript/issues/1213#issuecomment-1215039765
type DistributeComOverUnion<T> = T extends ComType ? Com<T> : never;
export type Commitment = DistributeComOverUnion<ComType>;

export interface Week {
  /** Commitments scheduled during the week */
  commitments: Commitment[];
  /** The most recent day on which user activity was logged */
  latest_active_day?: Commitment["day"];
}

interface Tokens {
  tokens: string[];
}

export type Collection = "weeks" | "tokens";

export type Data<C extends Collection> = C extends "weeks"
  ? Week
  : C extends "tokens"
  ? Tokens
  : never;

export type Id<C extends Collection> = C extends "weeks"
  ? `${number}-${OxDate["term"]}-${number}`
  : C extends "tokens"
  ? "default"
  : never;

/** Element of batch job for adding commitments */
export interface Batched {
  /** Date of commitment */
  date: { year: number; term: OxDate["term"]; week: number };
  /** Commitment to add to that week */
  commitment: Required<Commitment>;
}

export interface WikiWord {
  wiki_feed: {
    "?xml": string; // empty
    feed: {
      id: string; // URL
      title: string;
      link: string[]; // empty
      updated: string; // time code
      subtitle: string;
      generator: string; // irrelevant
      entry: {
        id: string; // URL
        title: string;
        link: string; // empty
        updated: string; // time code, e.g. `2023-08-14T00:00:00Z`
        summary: string; // HTML
        author: { name: string };
      }[];
    };
  };
  word: string;
  classification: string;
  definition: string;
  url: string;
}

type Zip<T extends readonly unknown[], U extends readonly unknown[]> = {
  [K in keyof T]: [T[K], K extends keyof U ? U[K] : never];
};
type PairsToObj<Ps extends [PropertyKey, unknown]> = {
  [P in Ps as P[0]]: P[1];
};
export type KeyValuesToObj<
  K extends readonly string[],
  V extends readonly unknown[]
> = PairsToObj<Zip<K, V>[number]>;

import {
  arrayUnion,
  getDoc,
  doc as ref,
  setDoc,
  type UpdateData,
  updateDoc,
} from "firebase/firestore";
import { getWeekId, type OxDate } from "../../functions/src/date";
import type { Commitment, Week } from "../../functions/src/commitment";
import type { Firestore } from "firebase/firestore";
import type { Writable } from "svelte/store";

export const delay = (sec: number) =>
  new Promise<void>(res => setTimeout(() => res(), sec * 1000));

export const keyValuesToObj = <T>(keys: readonly string[], values: T[]) => {
  const obj: Record<string, T> = {};
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = values[i];
    obj[key] = value;
  }
  return obj;
};

const unique = <T>(arr: T[]) => Array.from(new Set(arr));

interface Tokens {
  tokens: string[];
}

type Collection = "weeks" | "tokens";

type Data<C extends Collection> = C extends "weeks"
  ? Week
  : C extends "tokens"
  ? Tokens
  : never;

type DbPartial<T> = (Partial<T> & { [P in keyof T]?: T[P] }) | UpdateData<T>;

// TODO: caching

const read = async <C extends Collection>(
  db: Firestore,
  collection: C,
  id: string
) => {
  const doc = await getDoc(ref(db, collection, id));
  return doc.data() as Data<C> | undefined;
};

const set = <C extends Collection>(
  db: Firestore,
  collection: C,
  id: string,
  data: Data<C>
) => setDoc(ref(db, collection, id), data);

/** Note: will throw error if there is not already a document */
const update = <C extends Collection>(
  db: Firestore,
  collection: C,
  id: string,
  data: DbPartial<Data<C>>
) => updateDoc(ref(db, collection, id), data);

const updateOrCreate = async <C extends Collection>(
  db: Firestore,
  collection: C,
  id: string,
  updateData: DbPartial<Data<C>>,
  createData: Data<C>
) => {
  try {
    await update(db, collection, id, updateData);
  } catch (err) {
    await set(db, collection, id, createData);
  }
};

// type DistributePickerOverUnion<
//   T extends {},
//   K extends keyof T,
//   P
// > = K extends any ? (T[K] extends P ? K : never) : never;
// type PickedKeys<T extends {}, P> = DistributePickerOverUnion<T, keyof T, P>;
// type PickType<T extends {}, P> = Pick<T, PickedKeys<T, P>>;

export const wake = async (db: Firestore, date: OxDate) => {
  const id = getWeekId(date);
  const data = { latest_active_day: date.day };
  updateOrCreate(db, "weeks", id, data, { ...data, commitments: [] });
};

export const getWeek = async (db: Firestore, date: OxDate) => {
  await delay(4);
  return read(db, "weeks", getWeekId(date));
};

export const addCommitment = async (
  db: Firestore,
  date: OxDate,
  com: Commitment,
  progressA: Writable<number>,
  progressB: Writable<number>
) => {
  progressA.set(0);
  progressB.set(0);
  const id = getWeekId(date);
  progressA.set(100);
  await updateOrCreate(
    db,
    "weeks",
    id,
    { commitments: arrayUnion(com) },
    { commitments: [com] }
  );
  progressB.set(100);
};

export const editCommitment = async (
  db: Firestore,
  date: OxDate,
  index: number,
  newCom: Commitment,
  progressA: Writable<number>,
  progressB: Writable<number>
) => {
  progressA.set(0);
  progressB.set(0);
  const id = getWeekId(date);
  const prevData = await getWeek(db, date);
  progressA.set(100);
  if (prevData === undefined) {
    throw new Error("No previous week document");
  } else {
    const { commitments } = prevData;
    commitments[index] = newCom;
    await update(db, "weeks", id, { commitments });
  }
  progressB.set(100);
};

export const deleteCommitment = async (
  db: Firestore,
  date: OxDate,
  index: number
) => {
  const id = getWeekId(date);
  const prevData = await getWeek(db, date);
  if (prevData === undefined) {
    throw new Error("No previous week document");
  } else {
    const { commitments } = prevData;
    commitments.splice(index, 1);
    await update(db, "weeks", id, { commitments });
  }
};

export const updateToken = async (db: Firestore, token: string) => {
  const data = await read(db, "tokens", "default");
  const tokens = data?.tokens ?? [];
  const newTokens = unique([...tokens, token]);
  if (tokens.length === newTokens.length) {
    console.log("Skipped token");
  } else {
    await update(db, "tokens", "default", { tokens: newTokens });
  }
};

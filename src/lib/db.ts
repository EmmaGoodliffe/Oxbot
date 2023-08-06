import { doc as ref, getDoc, setDoc, updateDoc } from "firebase/firestore";
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

type Schemas = {
  weeks: Week;
  tokens: { tokens: string[] };
};

// TODO: caching

const read = async <T extends "weeks" | "tokens">(
  db: Firestore,
  collection: T,
  id: string
) => {
  const doc = await getDoc(ref(db, collection, id));
  return doc.data() as Schemas[T] | undefined;
};

const set = <T extends "weeks" | "tokens">(
  db: Firestore,
  collection: T,
  id: string,
  data: Schemas[T]
) => setDoc(ref(db, collection, id), data);

/** Weird version of `Partial<T>` necessary to satisfy DB */
type DbPartial<T> = Partial<T> & { [K in keyof T]?: T[K] };

const update = <T extends "weeks" | "tokens">(
  db: Firestore,
  collection: T,
  id: string,
  data: DbPartial<Schemas[T]>
) => updateDoc(ref(db, collection, id), data);

export const wake = async (db: Firestore, date: OxDate) => {
  const id = getWeekId(date);
  update(db, "weeks", id, { latest_active_day: date.day });
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
  const prevData = await getWeek(db, date);
  progressA.set(100);
  // TODO: See https://firebase.google.com/docs/firestore/manage-data/add-data#update_elements_in_an_array
  if (prevData === undefined) {
    await set(db, "weeks", id, { commitments: [com] });
  } else {
    await update(db, "weeks", id, {
      commitments: [...prevData.commitments, com],
    });
  }
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
  index: number,
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
    commitments.splice(index, 1);
    await update(db, "weeks", id, { commitments });
  }
  progressB.set(100);
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

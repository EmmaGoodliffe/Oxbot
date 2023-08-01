import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
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

export const getWeek = async (db: Firestore, date: OxDate) => {
  return (await getDoc(doc(db, "weeks", getWeekId(date)))).data() as
    | Week
    | undefined;
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
  if (prevData === undefined) {
    const week: Week = { commitments: [com] };
    await setDoc(doc(db, "weeks", id), week);
  } else {
    const week: Week = { commitments: [...prevData.commitments, com] };
    await updateDoc(doc(db, "weeks", id), { ...week });
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
    const week: Week = { commitments };
    await updateDoc(doc(db, "weeks", id), { ...week });
  }
  progressB.set(100);
};

export const updateToken = async (db: Firestore, token: string) => {
  const theDoc = doc(db, "tokens", "default");
  const data = (await getDoc(theDoc)).data() as
    | { tokens: string[] }
    | undefined;
  const tokens = data?.tokens ?? [];
  const newTokens = unique([...tokens, token]);
  if (tokens.length === newTokens.length) {
    console.log("Skipped token");
  } else {
    await updateDoc(theDoc, { tokens: newTokens });
  }
};

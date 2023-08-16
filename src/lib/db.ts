import {
  arrayUnion,
  getDoc,
  doc as ref,
  setDoc,
  type UpdateData,
  updateDoc,
} from "firebase/firestore";
import { type OxDate, getWeekId } from "../../functions/src/date";
import type {
  Batched,
  Commitment,
  Collection,
  Data,
  Id,
} from "../../functions/src/types";
import type { Firestore } from "firebase/firestore";
import type { Writable } from "svelte/store";
import { localToUtcTime } from "../../functions/src/time";

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

type DbPartial<T> = (Partial<T> & { [P in keyof T]?: T[P] }) | UpdateData<T>;

// TODO: caching

const read = async <C extends Collection>(
  db: Firestore,
  collection: C,
  id: Id<C>
) => {
  const doc = await getDoc(ref(db, collection, id));
  return doc.data() as Data<C> | undefined;
};

const set = <C extends Collection>(
  db: Firestore,
  collection: C,
  id: Id<C>,
  data: Data<C>
) => setDoc(ref(db, collection, id), data);

/** Note: will throw error if there is not already a document */
const update = <C extends Collection>(
  db: Firestore,
  collection: C,
  id: Id<C>,
  data: DbPartial<Data<C>>
) => updateDoc(ref(db, collection, id), data);

const updateOrCreate = async <C extends Collection>(
  db: Firestore,
  collection: C,
  id: Id<C>,
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

export const addCommitments = async (
  db: Firestore,
  date: Omit<OxDate, "day">,
  coms: Commitment[],
  progressA?: Writable<number>,
  progressB?: Writable<number>
) => {
  progressA && progressA.set(0);
  progressB && progressB.set(0);
  const id = getWeekId(date);
  progressA && progressA.set(100);
  await updateOrCreate(
    db,
    "weeks",
    id,
    { commitments: arrayUnion(...coms) },
    { commitments: coms }
  );
  progressB && progressB.set(100);
};

export const addCommitment = (
  db: Firestore,
  date: OxDate,
  com: Commitment,
  progressA: Writable<number>,
  progressB: Writable<number>
) => addCommitments(db, date, [com], progressA, progressB);

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

export const addBatchedCommitments = async (
  db: Firestore,
  batch: Batched[],
  progressA: Writable<number>,
  progressB: Writable<number>
) => {
  progressA.set(0);
  progressB.set(0);
  const batchWithIds = batch.map(b => ({
    date: b.date,
    commitment: {
      ...b.commitment,
      time: localToUtcTime(b.commitment.time),
      endTime: b.commitment.endTime
        ? localToUtcTime(b.commitment.endTime)
        : null,
    },
    id: getWeekId(b.date),
  }));
  const ids = unique(batchWithIds.map(b => b.id));
  if (ids.length > 20) {
    throw new Error(`Too many documents: ${ids.length}`);
  }
  const matchingBatches = ids.map(id => batchWithIds.filter(b => b.id === id));
  const promises = ids.map((_id, i) => {
    const batch = matchingBatches[i];
    const coms = batch.map(b => b.commitment);
    return addCommitments(db, batch[0].date, coms);
  });
  const firstHalf = promises.slice(0, promises.length / 2);
  const secondHalf = promises.slice(promises.length / 2);
  await Promise.all(firstHalf);
  progressA.set(100);
  await Promise.all(secondHalf);
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

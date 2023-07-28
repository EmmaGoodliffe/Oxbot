// import { onSchedule } from "firebase-functions/v2/scheduler";
// import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import { onRequest } from "firebase-functions/v2/https";

// const EVERY_TWO_MINUTES = "0-58/2 * * * *";

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const db = admin.firestore();

const sendToDefaultTokens = async (notification: {
  title: string;
  body?: string;
}) => {
  const doc = await db.collection("tokens").doc("default").get();
  const data = doc.data() as { tokens: string[] } | undefined;
  const tokens = data?.tokens;
  const token = tokens && tokens.length && tokens.slice(-1)[0];
  if (!token) {
    console.log("No tokens");
    throw new Error("No tokens");
  }
  // TODO: change to `.sendEachForMulticast`
  return await admin.messaging().send({
    token,
    notification,
  });
};

export const testable = onRequest(
  { region: "europe-west1" },
  async (request, response) => {
    try {
      const result = await sendToDefaultTokens({
        title: "vibrations",
      });
      response.json({ status: "Message sent 2", result });
    } catch (err) {
      response.json({ status: "Message not sent", error: err });
    }
  }
);

// export const sched = onSchedule(
//   { region: "europe-west1", schedule: EVERY_TWO_MINUTES },
//   async e => {
//     console.log("SCHED SCHED SCHED");
//     logger.log("SCHED SCHED SCHED succeeded at", e.scheduleTime);
//   }
// );

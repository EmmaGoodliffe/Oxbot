// import { onSchedule } from "firebase-functions/v2/scheduler";
// import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import { onRequest } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { displayCom, Week } from "./commitment";
import {
  displayDuration,
  getDuration,
  getNow,
  getWeekId,
  gregToOxDate,
} from "./date";

/** every 10 minutes */
const CRON = "0-50/10 * * * *";
const { TG_BOT_KEY, TG_CHAT_ID } = process.env;

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const db = admin.firestore();

const notifyDefaultTokens = async (notification: {
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

export const notify = onRequest(
  { region: "europe-west1" },
  async (req, res) => {
    try {
      const result = await notifyDefaultTokens({
        title: "vibrations",
      });
      res.json({ info: "Notification sent", result });
    } catch (err) {
      res.status(500).json({ info: "Notification not sent", error: err });
    }
  }
);

const sendTg = async (text: string) => {
  // TODO: encode URL so line breaks work
  const url = `https://api.telegram.org/bot${TG_BOT_KEY}/sendMessage?chat_id=${TG_CHAT_ID}&text=${text}&parse_mode=Markdown`;
  const result = await fetch(url);
  return (await result.json()) as Record<string, unknown>;
};

// export const tg = onRequest({ region: "europe-west1" }, async (req, res) => {
//   const text = req.params[0] ?? "No content";
//   try {
//     const result = await sendTg(text);
//     res.json({ info: "TG sent", result });
//   } catch (err) {
//     res.status(500).json({ info: "TG not sent", error: err });
//   }
// });

const sendTgSummary = async () => {
  const today = gregToOxDate(getNow().utcDate);
  if (today === undefined) {
    // TODO: find status code for bad date request
    return { status: 200, info: "No date to summarise" };
  }
  const now = getNow().utcTime;
  const id = getWeekId(today);
  const doc = await db.collection("weeks").doc(id).get();
  const data = doc.data() as Week | undefined;
  const coms = data?.commitments ?? [];
  const upcomingComs = coms
    .filter(com => com.day === today.day)
    .filter(com => {
      const dur = getDuration(now, com.time);
      console.log(JSON.stringify({ now, com, dur }));
      return dur?.hours === 0 && dur.mins <= 30;
    })
    .map(
      com =>
        `*${displayCom(com).title}* ${displayCom(com).description ?? ""} in ` +
        "`" +
        displayDuration(now, com.time) +
        "`"
    );
  if (upcomingComs.length) {
    const result = await sendTg(upcomingComs.join("\n"));
    // TODO: find status code for sent/created
    return { status: 200, info: "Sent summary", result };
  } else {
    // TODO: find status code for did nothing
    return { status: 200, info: "No summary to send" };
  }
};

export const summarise = onRequest(
  { region: "europe-west1" },
  async (req, res) => {
    try {
      const result = await sendTgSummary();
      res.status(result.status).json(result);
    } catch (err) {
      res.status(500).json({ info: "Summary failed", error: err });
    }
  }
);

export const schedule = onSchedule(
  { region: "europe-west1", schedule: CRON },
  async () => {
    console.log("Starting scheduled jobs...");
    try {
      const result = await sendTgSummary();
      console.log("Scheduled jobs finished:", result.info);
    } catch (err) {
      console.log("Scheduled jobs failed:", err);
    }
  }
);

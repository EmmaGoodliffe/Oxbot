// import { onSchedule } from "firebase-functions/v2/scheduler";
// import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import { onRequest } from "firebase-functions/v2/https";
import {
  dateToTimeInput,
  displayDuration,
  getDuration,
  getWeekId,
  gregToOxDate,
  jsToGregDate,
  timeInputToInt,
} from "./date";
import { Week, displayCom } from "./commitment";
import { onSchedule } from "firebase-functions/v2/scheduler";

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
      res.json({ status: "Notification sent", result });
    } catch (err) {
      res.status(500).json({ status: "Notification not sent", error: err });
    }
  }
);

const sendTg = async (text: string) => {
  const url = `https://api.telegram.org/bot${TG_BOT_KEY}/sendMessage?chat_id=${TG_CHAT_ID}&text=${text}&parse_mode=Markdown`;
  const result = await fetch(url);
  return await result.json();
};

// export const tg = onRequest({ region: "europe-west1" }, async (req, res) => {
//   const text = req.params[0] ?? "No content";
//   try {
//     const result = await sendTg(text);
//     res.json({ status: "TG sent", result });
//   } catch (err) {
//     res.status(500).json({ status: "TG not sent", error: err });
//   }
// });

const sendTgSummary = async () => {
  const js = new Date();
  const greg = jsToGregDate(js);
  const today = gregToOxDate(greg);
  if (today === undefined) {
    return;
  }
  const now = timeInputToInt(dateToTimeInput(js));
  const id = getWeekId(today);
  const doc = await db.collection("weeks").doc(id).get();
  const data = doc.data() as Week | undefined;
  const coms = data?.commitments ?? [];
  const upcomingComs = coms
    .filter(com => com.day === today.day)
    .filter(com => {
      const dur = getDuration(now, com.time);
      return dur?.hours === 0 && dur.mins <= 30;
    })
    .map(com => {
      return (
        `*${displayCom(com).title}* ${displayCom(com).description} in ` +
        "`" +
        displayDuration(now, com.time) +
        "`"
      );
    });
  if (upcomingComs.length) {
    const result = await sendTg(upcomingComs.join("\n"));
    console.log("Sent summary");
    return result;
  } else {
    console.log("No summary to send");
  }
};

export const summarise = onRequest(
  { region: "europe-west1" },
  async (req, res) => {
    try {
      const result = await sendTgSummary();
      res.json({ status: "Summary succeeded", result });
    } catch (err) {
      res.status(500).json({ status: "Summary failed", error: err });
    }
  }
);

// FB functions emulator does not support pub/sub
export const schedule = onSchedule(
  { region: "europe-west1", schedule: CRON },
  async () => {
    try {
      console.log("Preparing scheduled summary...");
      await sendTgSummary();
    } catch (err) {
      console.log("Scheduled summary failed:", err);
    }
  }
);

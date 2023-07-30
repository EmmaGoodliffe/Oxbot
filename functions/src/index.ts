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
import { Response } from "express";

/** every 10 minutes */
const CRON = "0-50/10 * * * *";
const { TG_BOT_KEY, TG_CHAT_ID } = process.env;

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const db = admin.firestore();

type ApiRes = Response<
  { status: number; info: string } & (
    | { result: Record<string, unknown> }
    | { error: unknown }
  )
>;

const post = (url: string, data: Record<string, unknown>) =>
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

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
  async (req, res: ApiRes) => {
    try {
      const message_id = await notifyDefaultTokens({
        title: "vibrations",
      });
      // TODO: find status code for sent/created
      res.status(200).json({
        status: 200,
        info: "Notification sent",
        result: { message_id },
      });
    } catch (err) {
      res
        .status(500)
        .json({ status: 500, info: "Error sending notification", error: err });
    }
  }
);

type TgResult =
  | { ok: true; description?: string; result: Record<string, unknown> }
  | { ok: false; description: string; error_code: number };

const sendTg = async (text: string) => {
  // const url = `https://api.telegram.org/bot${TG_BOT_KEY}/sendMessage?chat_id=${TG_CHAT_ID}&text=${text}&parse_mode=Markdown`;
  const url = `https://api.telegram.org/bot${TG_BOT_KEY}/sendMessage`;
  const response = await post(url, {
    chat_id: TG_CHAT_ID,
    text,
    parse_mode: "Markdown",
  });
  const result = (await response.json()) as TgResult;
  if (result.ok) {
    return {
      status: 200,
      info: result.description ?? "TG sent",
      result: result.result,
    };
  } else {
    return {
      status: result.error_code,
      info: "Error from TG",
      error: result.description,
    };
  }
};

export const tg = onRequest(
  { region: "europe-west1" },
  async (req, res: ApiRes) => {
    const text = req.params[0].split("/").join("\n") ?? "No content";
    const result = await sendTg(text);
    res.status(result.status).json(result);
  }
);

const sendTgSummary = async () => {
  const today = gregToOxDate(getNow().utcDate);
  if (today === undefined) {
    throw new Error("Bad date");
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
    return result;
  } else {
    // TODO: find status code for did nothing
    return { status: 200, info: "No summary to send", result: {} };
  }
};

export const summarise = onRequest(
  { region: "europe-west1" },
  async (req, res: ApiRes) => {
    try {
      const result = await sendTgSummary();
      res.status(result.status).json(result);
    } catch (err) {
      res.status(500).json({ status: 500, info: "Summary failed", error: err });
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

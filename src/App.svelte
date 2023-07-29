<script lang="ts">
  // import { getAnalytics } from "firebase/analytics";
  import { initializeApp } from "firebase/app";
  import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
  import { connectFunctionsEmulator, getFunctions } from "firebase/functions";
  import {
    getMessaging,
    getToken,
    isSupported,
    onMessage,
  } from "firebase/messaging";
  import { writable } from "svelte/store";
  import { getNow, gregToOxDate, type OxDate } from "../functions/src/date";
  import AddCom from "./AddCom.svelte";
  import EditCom from "./EditCom.svelte";
  import { getWeek, updateToken } from "./lib/db";
  import NotesNav from "./NotesNav.svelte";
  import ThisWeek from "./ThisWeek.svelte";
  import Toasts from "./Toasts.svelte";
  import Today from "./Today.svelte";
  import type { Commitment } from "../functions/src/commitment";
  import type { NotificationPayload } from "firebase/messaging";

  const firebaseConfig = {
    apiKey: "AIzaSyC7Aq56CIoRfwsfhxQgr8UY1v16nXs45Mw",
    authDomain: "oxbottle.firebaseapp.com",
    projectId: "oxbottle",
    storageBucket: "oxbottle.appspot.com",
    messagingSenderId: "319428478311",
    appId: "1:319428478311:web:1a21408c77e2c480cb5bc2",
    measurementId: "G-HS6P4M1WHD",
  };
  const app = initializeApp(firebaseConfig);
  // getAnalytics(app);
  const db = getFirestore(app);
  const functions = getFunctions(app);
  const DEV = window.location.hostname === "localhost";
  DEV && connectFunctionsEmulator(functions, "127.0.0.1", 5001);
  try {
    DEV && connectFirestoreEmulator(db, "127.0.0.1", 8080);
  } catch (err) {
    console.warn("Emulator failed");
  }

  const today = gregToOxDate(getNow().date);
  if (today === undefined) {
    throw new Error("Today is not an Ox date");
  }
  let weekProm = getWeek(db, today);
  const selectedComDate = writable<OxDate | undefined>();
  const selectedComIndex = writable<number | undefined>();
  const selectedCom = writable<Commitment | undefined>();
  const toasts = writable<NotificationPayload[]>([]);

  const refresh = () => {
    weekProm = getWeek(db, today);
    selectedComDate.set(undefined);
    selectedComIndex.set(undefined);
    selectedCom.set(undefined);
    return weekProm;
  };

  const toast = (not: NotificationPayload) => toasts.update(t => [...t, not]);

  const toastJson = (title: string, obj: unknown) =>
    toast({
      title,
      body: JSON.stringify({ simple: `${obj}`, json: obj }),
    });

  const prepDevice = async () => {
    try {
      const permission =
        "Notification" in window && (await Notification.requestPermission());
      const canMessage = await isSupported();
      toast({ title: "v4" });
      toastJson("context", {
        isSecureContext,
        permission,
        canMessage,
      });
      if (canMessage) {
        const messaging = getMessaging(app);
        toast({ title: "initialised" });
        onMessage(messaging, payload => {
          console.log("foreground message", payload);
          toast(payload.notification ?? { title: "Payload is empty" });
        });
        toast({ title: "handled" });
        const token = await getToken(messaging, {
          vapidKey:
            "BIqB5oWedkOFrejyLqEQw-8lFwmHXFl7ZeehuAR9iklFxH1wQPOtZP4bgRfAZqw744h_pcLaDO29Iq6NmfVkJuE",
        });
        toast({ title: "got token" });
        if (token) {
          await updateToken(db, token);
          toast({ title: "updated DB" });
        } else {
          toast({ title: "No token" });
        }
      } else {
        toast({ title: "No messaging" });
      }
    } catch (err) {
      toastJson("Error preparing", err);
    }
  };

  // TODO: telegram
  // TODO: alarms
  // TODO: commitments via JSON
  // TODO: delete commitments
  // TODO: notes
  // TODO: lectures: commitment, notes, slides, recording
  // TODO: budget reports
</script>

<Toasts {toasts} />
<div class="w-11/12 mx-auto pb-6">
  <button class="button" on:click={prepDevice}>Prep device</button>

  <h1>Notes</h1>
  <NotesNav />

  <h1>Schedule</h1>
  <Today {today} {weekProm} />
  <ThisWeek
    {today}
    {weekProm}
    selectCom={(date, index, com) => {
      selectedComDate.set(date);
      selectedComIndex.set(index);
      selectedCom.set(com);
    }}
  />

  <h1>Commitments</h1>
  <EditCom
    {db}
    date={$selectedComDate}
    index={$selectedComIndex}
    com={$selectedCom}
    {refresh}
  />
  <AddCom {db} {today} {refresh} />
</div>

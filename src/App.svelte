<script lang="ts">
  // import { getAnalytics } from "firebase/analytics";
  import { initializeApp } from "firebase/app";
  import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
  import {
    connectFunctionsEmulator,
    getFunctions,
    httpsCallable,
  } from "firebase/functions";

  import {
    getMessaging,
    getToken,
    isSupported,
    onMessage,
  } from "firebase/messaging";
  import { writable } from "svelte/store";
  import { gregToOxDate } from "../functions/src/date";
  import { getNow } from "../functions/src/time";
  import AddCom from "./AddCom.svelte";
  import Dialog from "./Dialog.svelte";
  import EditCom from "./EditCom.svelte";
  import { getWeek, updateToken, wake } from "./lib/db";
  import { appendToast } from "./lib/toast";
  import Nav from "./Nav.svelte";
  import NotesNav from "./NotesNav.svelte";
  import Toasts from "./Toasts.svelte";
  import Today from "./Today.svelte";
  import Week from "./Week.svelte";
  import Word from "./Word.svelte";
  import type { Toast } from "./lib/toast";
  import type { OxDate } from "../functions/src/date";
  import type { ApiRes, Commitment, WikiWord } from "../functions/src/types";
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
  const DEV =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";
  DEV && connectFunctionsEmulator(functions, "127.0.0.1", 5001);
  try {
    DEV && connectFirestoreEmulator(db, "127.0.0.1", 8080);
  } catch (err) {
    console.warn("Emulators failed");
  }
  const getWord = httpsCallable<unknown, ApiRes<WikiWord>>(functions, "word");

  const today = gregToOxDate(getNow().localDate);
  if (today === undefined) {
    throw new Error("Today is not an Ox date");
  }
  const week = writable<OxDate>(today);
  let thisWeekProm = getWeek(db, today);
  let weekProm = thisWeekProm;
  const selectedComDate = writable<OxDate | undefined>();
  const selectedComIndex = writable<number | undefined>();
  const selectedCom = writable<Commitment | undefined>();
  const newComDate = writable<OxDate>(today);
  const toasts = writable<Toast[]>([]);
  let dialogMode: "add" | "edit" | null = null;

  $: weekProm = getWeek(db, $week);

  $: {
    if (dialogMode === null) {
      document.querySelector("dialog")?.close();
    } else {
      document.querySelector("dialog")?.showModal();
    }
  }

  const refresh = () => {
    dialogMode = null;
    thisWeekProm = getWeek(db, today);
    weekProm = getWeek(db, $week);
    selectedComDate.set(undefined);
    selectedComIndex.set(undefined);
    selectedCom.set(undefined);
    return thisWeekProm;
  };

  const toast = (not: NotificationPayload) => appendToast(toasts, not);

  const addCom = (date: OxDate) => {
    selectedComDate.set(undefined);
    selectedComIndex.set(undefined);
    selectedCom.set(undefined);
    newComDate.set(date);
    dialogMode = null;
    dialogMode = "add";
  };

  const selectCom = (date: OxDate, index: number, com: Commitment) => {
    selectedComDate.set(date);
    selectedComIndex.set(index);
    selectedCom.set(com);
    dialogMode = null;
    dialogMode = "edit";
  };

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

  // TODO: use `time` element
  // TODO: make use of `com` vs `commitment` consistent
  // TODO: notes
  // TODO: lectures: commitment, notes, slides, recording
  // TODO: budget reports
</script>

<Toasts {toasts} />
<div class="w-11/12 mx-auto pb-6">
  <Nav {db} {today} {thisWeekProm} {toast} {wake}>
    <button class="button action" on:click={prepDevice}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        class="fill-text"
        ><path
          d="M12 22a2.98 2.98 0 0 0 2.818-2H9.182A2.98 2.98 0 0 0 12 22zm8.707-5.707L19 14.586V10c0-3.217-2.185-5.926-5.145-6.743C13.562 2.52 12.846 2 12 2s-1.562.52-1.855 1.258C7.185 4.074 5 6.783 5 10v4.586l-1.707 1.707A.997.997 0 0 0 3 17v1a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-1a.997.997 0 0 0-.293-.707zM16 12h-3v3h-2v-3H8v-2h3V7h2v3h3v2z"
        /></svg
      >
      <span>Device</span>
    </button>
  </Nav>

  <Word {getWord} />

  <h1>Notes</h1>
  <NotesNav />

  <h1>Schedule</h1>
  <Today {today} {thisWeekProm} />
  <Week {today} {week} {weekProm} {addCom} {selectCom} />

  <Dialog
    title={dialogMode === null
      ? ""
      : { add: "Add commitment", edit: "Edit commitment" }[dialogMode]}
    onClose={() => (dialogMode = null)}
  >
    {#if dialogMode === "add"}
      <AddCom {db} date={newComDate} {refresh} />
    {:else if dialogMode === "edit"}
      <EditCom
        {db}
        date={$selectedComDate}
        index={$selectedComIndex}
        com={$selectedCom}
        {refresh}
      />
    {/if}
  </Dialog>
</div>

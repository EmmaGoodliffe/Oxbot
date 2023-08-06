import { gregToOxDate, oxToGregDate } from "../functions/src/date";
import { getNow } from "../functions/src/time";
import "./app.css";
import App from "./App.svelte";

const greg = getNow().localDate;
const ox = gregToOxDate(greg);
const composite = ox === undefined ? undefined : oxToGregDate(ox);
if (greg !== composite) {
  console.log({ greg, ox, composite });
  throw new Error("Dates are broken");
}

const el = document.getElementById("app");
if (el === null) {
  throw new Error("No #app");
}

const app = new App({
  target: el,
});

export default app;

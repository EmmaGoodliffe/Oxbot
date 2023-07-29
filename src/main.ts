import "./app.css";
import App from "./App.svelte";

const el = document.getElementById("app");
if (el === null) {
  throw new Error("No #app");
}

const app = new App({
  target: el,
});

export default app;

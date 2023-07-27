/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

// TODO: clean

import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging/sw";

const sw = self as unknown as ServiceWorkerGlobalScope;
console.log("sw 3");

const firebaseApp = initializeApp({
  apiKey: "AIzaSyC7Aq56CIoRfwsfhxQgr8UY1v16nXs45Mw",
  authDomain: "oxbottle.firebaseapp.com",
  projectId: "oxbottle",
  storageBucket: "oxbottle.appspot.com",
  messagingSenderId: "319428478311",
  appId: "1:319428478311:web:1a21408c77e2c480cb5bc2",
  measurementId: "G-HS6P4M1WHD",
});

const messaging = getMessaging(firebaseApp);
console.log({ messaging });

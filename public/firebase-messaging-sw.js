importScripts(
  "https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js"
);

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
  apiKey: "AIzaSyC7Aq56CIoRfwsfhxQgr8UY1v16nXs45Mw",
  authDomain: "oxbottle.firebaseapp.com",
  projectId: "oxbottle",
  storageBucket: "oxbottle.appspot.com",
  messagingSenderId: "319428478311",
  appId: "1:319428478311:web:1a21408c77e2c480cb5bc2",
  measurementId: "G-HS6P4M1WHD",
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

console.log("fb sw 4");

// If the `notification` property is specified in the message, you don't need all this
// TODO: clean

// If you would like to customize notifications that are received in the
// background (Web app is closed or not in browser focus) then you should
// implement this optional method.
// Keep in mind that FCM will still show notification messages automatically
// and you should use data messages for custom notifications.
// For more info see:
// https://firebase.google.com/docs/cloud-messaging/concept-options
// messaging.onBackgroundMessage(payload => {
//   console.log(
//     "[firebase-messaging-sw.js] Received background message ",
//     payload
//   );
//   self.registration.showNotification("Background Message Title", {
//     body: "Background Message body.",
//     icon: "/favicon.png",
//   });
// });

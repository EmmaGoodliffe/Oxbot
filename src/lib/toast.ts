import type { NotificationPayload } from "firebase/messaging";
import type { Writable } from "svelte/store";

export interface Toast {
  not: NotificationPayload;
  visible: boolean;
}

export const appendToast = (toastStore: Writable<Toast[]>, not: NotificationPayload) =>
  toastStore.update(t => [...t, { not, visible: true }]);

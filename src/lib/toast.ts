import type { NotificationPayload } from "firebase/messaging";

export interface Toast {
  not: NotificationPayload;
  visible: boolean;
}

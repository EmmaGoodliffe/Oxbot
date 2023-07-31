/** Absolute BS required until TS 5.2.0 is released from typescript/lib/lib.dom.d.ts */
export type P = {
  popover: string | null;
  hidePopover(): void;
  showPopover(): void;
  togglePopover(force?: boolean): void;
};

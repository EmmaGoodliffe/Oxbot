/**
 * Absolute BS required until TS 5.2.0 is released;
 * code from {@link https://github.com/microsoft/TypeScript/blob/6074b9d12b70757fe68ab2b4da059ea363c4df04/lib/lib.dom.d.ts#L10049}
 * @see {@link https://github.com/microsoft/TypeScript/releases} for release updates
 */
export type P = {
  popover: string | null;
  hidePopover(): void;
  showPopover(): void;
  togglePopover(force?: boolean): void;
};

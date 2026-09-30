/**
 * One-shot confirmation handed from one screen to the next (e.g. "Check saved"
 * shown on the asset page after the check form navigates back).
 * In-memory only: a reload shouldn't replay an old confirmation.
 */
export interface Flash {
  /** Route the message belongs to, so it never shows on the wrong screen. */
  assetId: string;
  text: string;
}

let pending: Flash | undefined;

export function setFlash(flash: Flash): void {
  pending = flash;
}

/** Non-destructive read, safe inside React state initialisers (StrictMode calls them twice). */
export function peekFlash(assetId: string): Flash | undefined {
  return pending?.assetId === assetId ? pending : undefined;
}

export function clearFlash(): void {
  pending = undefined;
}

let focusSearch = false;

/** Ask the asset list to focus its search box on arrival (e.g. from Home's "Find an asset"). */
export function requestSearchFocus(): void {
  focusSearch = true;
}

export function consumeSearchFocus(): boolean {
  const requested = focusSearch;
  focusSearch = false;
  return requested;
}

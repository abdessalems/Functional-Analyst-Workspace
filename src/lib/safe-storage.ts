/**
 * localStorage that cannot break the app.
 *
 * Safari in Private Browsing throws on `setItem`, and a browser configured to
 * block site data can throw on plain access. Both happen on phones far more
 * often than on desktop, and an exception thrown inside a click handler takes
 * the whole page down through the error boundary — the tap simply appears to
 * do nothing.
 *
 * Preferences are a convenience, never a requirement: if storage is
 * unavailable the workspace still works, it just forgets between visits.
 */
export function readSetting(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeSetting(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage unavailable — carry on without persisting.
  }
}

export function isInAppBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  // Covers Instagram, Facebook, Messenger in-app browsers
  return /Instagram|FBAN|FBAV|FB_IAB|Messenger/i.test(ua);
}

export function isAndroid(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android/i.test(navigator.userAgent || "");
}

export function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent || "");
}

/**
 * Attempts to escape Instagram's in-app browser on Android by opening
 * the URL via an explicit Chrome intent. This does NOT work on iOS —
 * Apple blocks apps from forcing a switch to Safari, so iOS users must
 * be shown a manual "tap ⋮ → Open in Browser" instruction instead.
 */
export function escapeToSystemBrowser(url: string): void {
  if (isAndroid()) {
    const stripped = url.replace(/^https?:\/\//, "");
    window.location.href = `intent://${stripped}#Intent;scheme=https;package=com.android.chrome;end`;
  } else {
    window.location.href = url;
  }
}
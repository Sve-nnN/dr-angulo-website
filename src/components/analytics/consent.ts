const STORAGE_KEY = "cookie_consent";
const CONSENT_EVENT = "cookie-consent-changed";

export type ConsentValue = "granted" | "denied";

export function getStoredConsent(): ConsentValue | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STORAGE_KEY) as ConsentValue | null;
}

export function setStoredConsent(value: ConsentValue) {
  window.localStorage.setItem(STORAGE_KEY, value);
  window.dispatchEvent(new Event(CONSENT_EVENT));
}

/** Para useSyncExternalStore: se suscribe a cambios de consentimiento (misma pestaña y otras). */
export function subscribeConsent(callback: () => void) {
  window.addEventListener(CONSENT_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CONSENT_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function getConsentServerSnapshot(): ConsentValue | null {
  return null;
}

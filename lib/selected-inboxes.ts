"use client";

import { parseEmailList } from "@/lib/contact";

export const SELECTED_INBOXES_KEY = "gbp-selected-email-to";
export const SELECTED_INBOXES_EVENT = "gbp-selected-email-to";

export function readSelectedInboxes() {
  try {
    return parseEmailList(
      JSON.parse(sessionStorage.getItem(SELECTED_INBOXES_KEY) || "[]"),
    );
  } catch {
    return [];
  }
}

export function writeSelectedInboxes(addresses: string[]) {
  const unique = parseEmailList(addresses);
  if (unique.length === 0) sessionStorage.removeItem(SELECTED_INBOXES_KEY);
  else sessionStorage.setItem(SELECTED_INBOXES_KEY, JSON.stringify(unique));
  window.dispatchEvent(new Event(SELECTED_INBOXES_EVENT));
  return unique;
}

export function mergeSelectedInboxes(incoming: string[]) {
  return writeSelectedInboxes([...readSelectedInboxes(), ...incoming]);
}

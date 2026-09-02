"use client";

import { useEffect, useSyncExternalStore } from "react";
import { parseEmailList } from "@/lib/contact";
import {
  SELECTED_INBOXES_EVENT,
  SELECTED_INBOXES_KEY,
  mergeSelectedInboxes,
  writeSelectedInboxes,
} from "@/lib/selected-inboxes";

function subscribe(onStoreChange: () => void) {
  window.addEventListener(SELECTED_INBOXES_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(SELECTED_INBOXES_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getSnapshot() {
  return sessionStorage.getItem(SELECTED_INBOXES_KEY) || "[]";
}

function getServerSnapshot() {
  return "[]";
}

function fillCompose(addresses: string[]) {
  const textarea = document.getElementById(
    "customTo",
  ) as HTMLTextAreaElement | null;
  if (textarea) textarea.value = addresses.join("\n");
  const audience = document.getElementById("audience") as HTMLSelectElement | null;
  if (audience && addresses.length) audience.value = "custom";
}

export function SelectedInboxSync({
  incoming,
  sent,
}: {
  incoming: string[];
  sent?: string;
}) {
  const storedRaw = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const incomingKey = incoming.join(",");
  let stored: string[] = [];
  try {
    stored = parseEmailList(JSON.parse(storedRaw));
  } catch {
    stored = parseEmailList(storedRaw);
  }
  const addresses = sent ? [] : parseEmailList([...stored, ...incoming]);

  useEffect(() => {
    if (sent) {
      writeSelectedInboxes([]);
      fillCompose([]);
      return;
    }
    fillCompose(mergeSelectedInboxes(incoming));
  }, [incomingKey, incoming, sent]);

  if (addresses.length === 0) return null;

  return (
    <div
      className="mt-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950"
      role="status"
    >
      <p>
        Ready to email {addresses.length} selected inbox
        {addresses.length === 1 ? "" : "es"}. Audience is set to Specific
        addresses. Check more rows on Customers, Users, or Agencies if you
        want both kinds of inboxes, then return here. Review the message,
        send a test, then Send email.
      </p>
      <button
        type="button"
        className="mt-2 text-sm font-medium text-primary hover:underline"
        onClick={() => {
          writeSelectedInboxes([]);
          fillCompose([]);
        }}
      >
        Clear selected
      </button>
    </div>
  );
}

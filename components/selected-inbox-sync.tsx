"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { parseEmailList } from "@/lib/contact";

const STORAGE_KEY = "gbp-selected-email-to";
const CHANGE_EVENT = "gbp-selected-email-to";

function readStored() {
  try {
    return parseEmailList(JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "[]"));
  } catch {
    return [];
  }
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getSnapshot() {
  return sessionStorage.getItem(STORAGE_KEY) || "[]";
}

function getServerSnapshot() {
  return "[]";
}

function writeStored(addresses: string[]) {
  if (addresses.length === 0) sessionStorage.removeItem(STORAGE_KEY);
  else sessionStorage.setItem(STORAGE_KEY, JSON.stringify(addresses));
  window.dispatchEvent(new Event(CHANGE_EVENT));
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
  const stored = useMemo(() => {
    try {
      return parseEmailList(JSON.parse(storedRaw));
    } catch {
      return [];
    }
  }, [storedRaw]);
  const addresses = sent ? [] : parseEmailList([...stored, ...incoming]);

  useEffect(() => {
    if (sent) {
      writeStored([]);
      fillCompose([]);
      return;
    }
    const merged = parseEmailList([...readStored(), ...incoming]);
    writeStored(merged);
    fillCompose(merged);
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
          writeStored([]);
          fillCompose([]);
        }}
      >
        Clear selected
      </button>
    </div>
  );
}

"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type KeywordFieldProps = {
  value: string[];
  onChange: (keywords: string[]) => void;
  disabled?: boolean;
};

export function KeywordField({
  value,
  onChange,
  disabled,
}: KeywordFieldProps) {
  const [draft, setDraft] = useState("");

  function addKeyword(raw: string) {
    const next = raw
      .split(/[\n,]+/)
      .map((item) => item.trim())
      .filter(Boolean);
    if (next.length === 0) return;
    const merged = [...value];
    for (const item of next) {
      if (!merged.some((existing) => existing.toLowerCase() === item.toLowerCase())) {
        merged.push(item);
      }
    }
    onChange(merged);
    setDraft("");
  }

  return (
    <div className="space-y-2">
      <Input
        value={draft}
        disabled={disabled}
        placeholder="Type a keyword and press Enter"
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            addKeyword(draft);
          }
          if (event.key === "Backspace" && draft === "" && value.length > 0) {
            onChange(value.slice(0, -1));
          }
        }}
        onBlur={() => addKeyword(draft)}
      />
      {value.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {value.map((keyword) => (
            <Badge
              key={keyword}
              variant="secondary"
              className="gap-1 bg-accent px-2.5 py-1 text-accent-foreground"
            >
              {keyword}
              <button
                type="button"
                disabled={disabled}
                aria-label={`Remove ${keyword}`}
                onClick={() =>
                  onChange(value.filter((item) => item !== keyword))
                }
                className="rounded-full p-0.5 hover:bg-white/70"
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Add the phrases customers actually search — one at a time, or paste a
          comma-separated list.
        </p>
      )}
    </div>
  );
}

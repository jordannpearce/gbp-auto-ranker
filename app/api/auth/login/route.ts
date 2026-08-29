import { NextResponse } from "next/server";
import {
  COOKIE_NAME,
  checkPassword,
  sessionCookieOptions,
  sessionToken,
} from "@/lib/auth";
import { redirectTo } from "@/lib/http";

function safeNext(value: string) {
  return value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/dashboard";
}

async function readLogin(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const body = (await request.json().catch(() => null)) as {
      password?: string;
      next?: string;
    } | null;
    return {
      password: body?.password?.trim() ?? "",
      next: safeNext(body?.next || "/dashboard"),
      viaForm: false,
    };
  }

  const form = await request.formData().catch(() => null);
  return {
    password: String(form?.get("password") ?? "").trim(),
    next: safeNext(String(form?.get("next") ?? "/dashboard")),
    viaForm: true,
  };
}

export async function POST(request: Request) {
  const { password, next, viaForm } = await readLogin(request);

  if (!checkPassword(password)) {
    if (viaForm) {
      return redirectTo(
        `/dashboard/login?error=1&next=${encodeURIComponent(next)}`,
      );
    }
    return NextResponse.json(
      { error: "That password does not match." },
      { status: 401 },
    );
  }

  const token = await sessionToken();
  if (viaForm) {
    const response = redirectTo(next);
    response.cookies.set(COOKIE_NAME, token, sessionCookieOptions());
    return response;
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, token, sessionCookieOptions());
  return response;
}

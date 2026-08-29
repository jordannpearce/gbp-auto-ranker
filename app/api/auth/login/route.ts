import { NextResponse } from "next/server";
import {
  COOKIE_NAME,
  createSessionToken,
  sessionCookieOptions,
} from "@/lib/session";
import { redirectTo } from "@/lib/http";
import { verifyPassword } from "@/lib/passwords";
import { getUserByEmail } from "@/lib/users";

function safeNext(value: string) {
  return value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  const viaForm = contentType.includes("form");
  let email = "";
  let password = "";
  let next = "/dashboard";

  if (viaForm) {
    const form = await request.formData();
    email = String(form.get("email") ?? "").trim();
    password = String(form.get("password") ?? "");
    next = safeNext(String(form.get("next") ?? "/dashboard"));
  } else {
    const body = (await request.json().catch(() => null)) as {
      email?: string;
      password?: string;
      next?: string;
    } | null;
    email = body?.email?.trim() ?? "";
    password = body?.password ?? "";
    next = safeNext(body?.next || "/dashboard");
  }

  const user = await getUserByEmail(email);
  const ok = user ? await verifyPassword(password, user.passwordHash) : false;
  if (!user || !ok) {
    if (viaForm) {
      return redirectTo(
        `/login?error=1&next=${encodeURIComponent(next)}`,
      );
    }
    return NextResponse.json(
      { error: "That email or password does not match." },
      { status: 401 },
    );
  }

  const token = await createSessionToken(user.id);
  if (viaForm) {
    const response = redirectTo(next);
    response.cookies.set(COOKIE_NAME, token, sessionCookieOptions());
    return response;
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, token, sessionCookieOptions());
  return response;
}

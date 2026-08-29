import { NextResponse } from "next/server";
import { COOKIE_NAME, sessionCookieOptions } from "@/lib/auth";
import { redirectTo } from "@/lib/http";

export async function POST(request: Request) {
  const wantsRedirect =
    !(request.headers.get("content-type") || "").includes("application/json");
  const response = wantsRedirect
    ? redirectTo("/dashboard/login")
    : NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, "", {
    ...sessionCookieOptions(),
    maxAge: 0,
  });
  return response;
}

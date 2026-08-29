import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_NAME, readSessionUserId } from "@/lib/session";

const PUBLIC_DASHBOARD = ["/dashboard/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/dashboard/login") {
    const login = new URL("/login", request.url);
    login.search = request.nextUrl.search;
    return NextResponse.redirect(login);
  }

  const isDashboard =
    pathname.startsWith("/dashboard") &&
    !PUBLIC_DASHBOARD.includes(pathname);
  const isPublicIntake =
    pathname === "/api/customers" && request.method === "POST";
  const isProtectedApi =
    (pathname.startsWith("/api/customers") && !isPublicIntake) ||
    pathname.startsWith("/api/agencies") ||
    pathname.startsWith("/api/team") ||
    pathname.startsWith("/api/emails");

  if (!isDashboard && !isProtectedApi) {
    return NextResponse.next();
  }

  const userId = await readSessionUserId(
    request.cookies.get(COOKIE_NAME)?.value,
  );
  if (userId) {
    return NextResponse.next();
  }

  if (isProtectedApi) {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("form")) {
      return NextResponse.redirect(new URL("/login?next=%2Fdashboard", request.url));
    }
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const login = new URL("/login", request.url);
  login.searchParams.set("next", pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/customers",
    "/api/customers/:path*",
    "/api/agencies/:path*",
    "/api/team",
    "/api/team/:path*",
    "/api/emails",
    "/api/emails/:path*",
  ],
};

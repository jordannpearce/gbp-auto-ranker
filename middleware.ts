import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_NAME, isValidSession } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isDashboard =
    pathname.startsWith("/dashboard") && pathname !== "/dashboard/login";
  const isPublicIntake =
    pathname === "/api/customers" && request.method === "POST";
  const isProtectedApi =
    pathname.startsWith("/api/customers") && !isPublicIntake;

  if (!isDashboard && !isProtectedApi) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (await isValidSession(token)) {
    return NextResponse.next();
  }

  if (isProtectedApi) {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("form")) {
      return NextResponse.redirect(
        new URL("/dashboard/login?next=%2Fdashboard", request.url),
      );
    }
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const login = new URL("/dashboard/login", request.url);
  login.searchParams.set("next", pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/customers", "/api/customers/:path*"],
};

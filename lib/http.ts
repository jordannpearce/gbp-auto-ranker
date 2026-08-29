import { NextResponse } from "next/server";

export function redirectTo(path: string) {
  const response = new NextResponse(null, { status: 303 });
  response.headers.set("Location", path);
  return response;
}

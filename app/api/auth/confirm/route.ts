import {
  COOKIE_NAME,
  createSessionToken,
  sessionCookieOptions,
} from "@/lib/session";
import { redirectTo } from "@/lib/http";
import { notifyWelcome } from "@/lib/notify";
import { confirmUserByToken } from "@/lib/users";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") || "";
  if (!token) {
    return redirectTo(
      `/confirm?error=${encodeURIComponent("That confirmation link is missing a token.")}`,
    );
  }

  const result = await confirmUserByToken(token);
  if ("error" in result) {
    if (result.error === "expired") {
      return redirectTo(
        `/confirm?error=${encodeURIComponent("That confirmation link has expired.")}&email=${encodeURIComponent(result.user?.email || "")}`,
      );
    }
    return redirectTo(
      `/confirm?error=${encodeURIComponent("That confirmation link is invalid or was already used.")}`,
    );
  }

  await notifyWelcome(result.user);
  const response = redirectTo("/dashboard?confirmed=1");
  response.cookies.set(
    COOKIE_NAME,
    await createSessionToken(result.user.id),
    sessionCookieOptions(),
  );
  return response;
}

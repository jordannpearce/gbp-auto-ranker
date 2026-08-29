import { cookies } from "next/headers";
import { COOKIE_NAME, readSessionUserId } from "@/lib/session";
import { getUser, toPublicUser } from "@/lib/users";

export {
  COOKIE_NAME,
  createSessionToken,
  readSessionUserId,
  sessionCookieOptions,
} from "@/lib/session";

export async function isValidSession(token: string | undefined | null) {
  return Boolean(await readSessionUserId(token));
}

export async function getCurrentUser() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  const userId = await readSessionUserId(token);
  if (!userId) return null;
  const user = await getUser(userId);
  return user ? toPublicUser(user) : null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) return null;
  return user;
}

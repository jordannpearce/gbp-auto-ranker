const COOKIE_NAME = "gbp_session";

function password() {
  return process.env.DASHBOARD_PASSWORD || "gbp-admin";
}

function secret() {
  return process.env.DASHBOARD_SECRET || "change-this-dashboard-secret";
}

function toHex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function sessionToken() {
  const payload = `gbp-auto-ranker:${password()}:${secret()}`;
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(payload),
  );
  return toHex(digest);
}

export async function isValidSession(token: string | undefined | null) {
  if (!token) return false;
  const expected = await sessionToken();
  if (token.length !== expected.length) return false;
  let mismatch = 0;
  for (let i = 0; i < token.length; i += 1) {
    mismatch |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return mismatch === 0;
}

export function checkPassword(input: string) {
  return input === password();
}

export { COOKIE_NAME };

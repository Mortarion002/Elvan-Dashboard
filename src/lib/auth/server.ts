import { createNeonAuth } from "@neondatabase/auth/next/server";

const DEFAULT_NEON_AUTH_BASE_URL =
  "https://ep-autumn-shape-aodsxmjn.neonauth.c-2.ap-southeast-1.aws.neon.tech/neondb/auth";
const LOCAL_BUILD_COOKIE_SECRET =
  "local-build-only-neon-auth-cookie-secret-please-set-env";

function getCookieSecret(): string {
  const secret = process.env.NEON_AUTH_COOKIE_SECRET;
  if (secret) {
    return secret;
  }

  if (process.env.VERCEL) {
    throw new Error("Missing NEON_AUTH_COOKIE_SECRET in Vercel environment variables.");
  }

  return LOCAL_BUILD_COOKIE_SECRET;
}

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL ?? DEFAULT_NEON_AUTH_BASE_URL,
  cookies: {
    secret: getCookieSecret(),
    sameSite: "lax",
  },
  logLevel: "warn",
});

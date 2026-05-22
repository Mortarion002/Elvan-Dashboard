import { auth } from "@/lib/auth/server";

export default auth.middleware({
  loginUrl: "/auth/sign-in",
});

export const config = {
  matcher: [
    "/auth/callback",
    "/reddit/:path*",
    "/x/:path*",
    "/product-hunt/:path*",
    "/hacker-news/:path*",
    "/campaign-clicks/:path*",
  ],
};

export { auth as proxy } from "@/auth";

export const config = {
  matcher: [
    "/reddit/:path*",
    "/x/:path*",
    "/product-hunt/:path*",
    "/hacker-news/:path*",
    "/campaign-clicks/:path*",
  ],
};

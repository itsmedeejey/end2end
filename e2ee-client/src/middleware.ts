import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const isProtectedRoute = (pathname: string): boolean => {
  return pathname === "/" || pathname.startsWith("/chat");
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken")?.value;

  if (isProtectedRoute(pathname) && !accessToken) {
    const redirectUrl = new URL("/login", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  if (pathname === "/login" && accessToken) {
    const redirectUrl = new URL("/", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/chat/:path*", "/login"],
};

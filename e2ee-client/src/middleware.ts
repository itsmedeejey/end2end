import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const isProtectedRoute = (pathname: string): boolean => {
  return pathname === "/" || pathname.startsWith("/chat");
};

const shouldUseEdgeCookieGuard = (request: NextRequest): boolean => {
  const backendUrl = process.env.NEXT_PUBLIC_SERVER_URL;
  if (!backendUrl) {
    return true;
  }

  try {
    const backendHost = new URL(backendUrl).hostname;
    return backendHost === request.nextUrl.hostname;
  } catch {
    return true;
  }
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!shouldUseEdgeCookieGuard(request)) {
    return NextResponse.next();
  }

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

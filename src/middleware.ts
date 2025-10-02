import { NextResponse, NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;

  const isAuthRoute = ["/login", "/signup", "/profile"].includes(
    request.nextUrl.pathname
  );
  //   const isHomeRoute = request.nextUrl.pathname === "/";

  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  } else if (!token && !isAuthRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/", "/login", "/signup", "/profile/:path*"],
};

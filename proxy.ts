import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE, getSessionSecret, verifySessionToken } from "@/lib/session";

// Every route except /login and static assets requires a valid session. Pages
// and server actions re-check the session themselves (see lib/auth.ts); this
// is the first line of defence.
export function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (verifySessionToken(token, getSessionSecret())) {
    return NextResponse.next();
  }
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: ["/((?!login|_next/static|_next/image|favicon.ico).*)"],
};

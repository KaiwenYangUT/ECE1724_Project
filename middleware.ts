import { NextRequest, NextResponse } from "next/server";

import { verifyToken } from "@/lib/auth/jwt";

function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");

  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length).trim();
  }

  return request.cookies.get("token")?.value ?? null;
}

export async function middleware(request: NextRequest) {
  const token = extractToken(request);

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await verifyToken(token);

  if (!payload) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  const pathname = request.nextUrl.pathname;
  const isOrganizerRoute = pathname.startsWith("/api/organizer");
  const isStaffRoute = pathname.startsWith("/api/staff");

  if (isOrganizerRoute && payload.role !== "ORGANIZER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (isStaffRoute && payload.role !== "STAFF" && payload.role !== "ORGANIZER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", payload.sub);
  requestHeaders.set("x-user-role", payload.role);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/api/protected/:path*", "/api/organizer/:path*", "/api/staff/:path*"],
};

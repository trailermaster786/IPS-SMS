import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // Public routes that don't require auth
  const publicRoutes = ["/", "/login", "/api/auth", "/api/webhooks"];
  if (publicRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
    if (token && pathname === "/login") {
      return NextResponse.redirect(new URL(`/dashboard/${token.role?.toLowerCase()}`, request.url));
    }
    return NextResponse.next();
  }

  // Check if user is authenticated
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Check if user needs to change password
  if (token.mustChangePassword && pathname !== "/change-password") {
    return NextResponse.redirect(new URL("/change-password", request.url));
  }

  // Role-based dashboard access
  if (pathname.startsWith("/dashboard")) {
    const role = token.role as string;
    const rolePath = pathname.split("/")[2]; // e.g., "admin" from "/dashboard/admin/..."

    if (rolePath !== role.toLowerCase()) {
      return NextResponse.redirect(new URL(`/dashboard/${role.toLowerCase()}`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function proxy(req) {
    const token = req.cookies.get("token")?.value;
    const path = req.nextUrl.pathname;

    if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const role = decoded.role;

        // Role-path enforcement
        if (path.startsWith("/superadmin") && role !== "SUPER_ADMIN") {
            return NextResponse.redirect(new URL("/unauthorized", req.url));
        }

        if (path.startsWith("/manager") && role !== "PROJECT_MANAGER") {
            return NextResponse.redirect(new URL("/unauthorized", req.url));
        }

        if (path.startsWith("/supervisor") && role !== "SUPERVISOR") {
            return NextResponse.redirect(new URL("/unauthorized", req.url));
        }

        return NextResponse.next();
    } catch {
        // Invalid / expired token
        return NextResponse.redirect(new URL("/login", req.url));
    }
}

export const config = {
    matcher: [
        "/superadmin/:path*",
        "/manager/:path*",
        "/supervisor/:path*",
    ],
};

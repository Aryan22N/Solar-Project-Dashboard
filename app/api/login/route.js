import { prisma } from "@/lib/db";
import { loginSchema } from "@/lib/validators/loginSchema";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req) {
    try {
        const body = await req.json();

        // Zod validation
        const result = loginSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: result.error.issues[0].message },
                { status: 400 }
            );
        }

        const { phone, dob } = result.data;

        // Look up user by phone using Prisma Client
        const user = await prisma.user.findUnique({
            where: {
                phone: phone,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: "Invalid phone number or date of birth" },
                { status: 401 }
            );
        }

        // Compare DOB against bcrypt hash stored in DB
        const passwordMatch = await bcrypt.compare(dob, user.dob);
        if (!passwordMatch) {
            return NextResponse.json(
                { error: "Invalid phone number or date of birth" },
                { status: 401 }
            );
        }

        // Sign JWT
        const token = jwt.sign(
            {
                id: user.id,
                phone: user.phone,
                role: user.role,
                name: user.name,
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        // Build response with httpOnly cookie
        const response = NextResponse.json({
            message: "Login successful",
            role: user.role,
            name: user.name,
        });

        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24, // 1 day
        });

        return response;
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

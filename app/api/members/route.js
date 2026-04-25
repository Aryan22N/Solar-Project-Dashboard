import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET(req) {
    try {
        const user = await getUser();
        if (!user || user.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const members = await prisma.user.findMany({
            where: {
                role: {
                    in: ["PROJECT_MANAGER", "SUPERVISOR"]
                }
            },
            select: {
                id: true,
                name: true,
                phone: true,
                role: true,
                created_at: true,
            },
            orderBy: { created_at: "desc" }
        });

        return NextResponse.json(members);
    } catch (error) {
        console.error("GET members error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const user = await getUser();
        if (!user || user.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const name = body.name?.trim();
        const phone = body.phone?.trim();
        const password = body.password?.trim();
        const role = body.role?.trim();

        if (!phone || !password || !role) {
            return NextResponse.json({ error: "Phone, password, and role are required" }, { status: 400 });
        }

        if (phone.length !== 10 || !/^\d+$/.test(phone)) {
            return NextResponse.json({ error: "Phone number must be 10 digits" }, { status: 400 });
        }

        if (password.length !== 8 || !/^\d+$/.test(password)) {
            return NextResponse.json({ error: "Password (DOB) must be 8 digits (DDMMYYYY)" }, { status: 400 });
        }

        if (!["PROJECT_MANAGER", "SUPERVISOR"].includes(role)) {
            return NextResponse.json({ error: "Invalid role specified" }, { status: 400 });
        }

        // Check if phone already exists
        const existingUser = await prisma.user.findUnique({
            where: { phone }
        });

        if (existingUser) {
            return NextResponse.json({ error: "Phone number is already registered" }, { status: 400 });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newMember = await prisma.user.create({
            data: {
                name: name || null,
                phone: phone,
                dob: hashedPassword, // Store password in dob field as per existing schema
                role: role
            },
            select: {
                id: true,
                name: true,
                phone: true,
                role: true,
                created_at: true,
            }
        });

        return NextResponse.json(newMember, { status: 201 });
    } catch (error) {
        console.error("Create member error:", error);
        return NextResponse.json({ error: "Failed to create member" }, { status: 500 });
    }
}

import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function PUT(req, { params }) {
    try {
        const user = await getUser();
        if (!user || user.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: idParam } = await params;
        const id = parseInt(idParam);
        if (isNaN(id)) {
            return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
        }

        const body = await req.json();
        const name = body.name?.trim();
        const phone = body.phone?.trim();
        const password = body.password?.trim();
        const role = body.role?.trim();

        if (!phone || !role) {
            return NextResponse.json({ error: "Phone and role are required" }, { status: 400 });
        }

        if (phone.length !== 10 || !/^\d+$/.test(phone)) {
            return NextResponse.json({ error: "Phone number must be 10 digits" }, { status: 400 });
        }

        if (!["PROJECT_MANAGER", "SUPERVISOR"].includes(role)) {
            return NextResponse.json({ error: "Invalid role specified" }, { status: 400 });
        }

        // Check if phone already exists for a different user
        const existingUser = await prisma.user.findFirst({
            where: {
                phone: phone,
                id: { not: id }
            }
        });

        if (existingUser) {
            return NextResponse.json({ error: "Phone number is already registered to another user" }, { status: 400 });
        }

        const updateData = {
            name: name || null,
            phone: phone,
            role: role
        };

        // If password is provided, hash it and update dob field
        if (password && password !== "") {
            if (password.length !== 8 || !/^\d+$/.test(password)) {
                return NextResponse.json({ error: "Password (DOB) must be 8 digits (DDMMYYYY)" }, { status: 400 });
            }
            const salt = await bcrypt.genSalt(10);
            updateData.dob = await bcrypt.hash(password, salt);
        }

        const updatedMember = await prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                name: true,
                phone: true,
                role: true,
                created_at: true,
            }
        });

        return NextResponse.json(updatedMember);
    } catch (error) {
        console.error("Update member error:", error);
        return NextResponse.json({ error: "Failed to update member" }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const user = await getUser();
        if (!user || user.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: idParam } = await params;
        const id = parseInt(idParam);
        if (isNaN(id)) {
            return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
        }

        // Check if user has related records (optional, depending on cascade rules)
        // If not cascade, Prisma might throw an error if relations exist. 
        // We will just let Prisma throw and catch it to inform the user.
        
        await prisma.user.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Member deleted successfully" });
    } catch (error) {
        console.error("Delete member error:", error);
        // Specifically catch Prisma relation violation error (P2003)
        if (error.code === 'P2003') {
            return NextResponse.json({ error: "Cannot delete this member because they have associated records (e.g., payment requests)." }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to delete member" }, { status: 500 });
    }
}

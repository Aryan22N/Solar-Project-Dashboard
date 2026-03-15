import { prisma } from "@/lib/db";
import { getUser, hasRole } from "@/lib/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET: Fetch all progress updates for a project
export async function GET(req, { params }) {
    try {
        const user = await getUser();
        if (!user || !hasRole(user, ["SUPER_ADMIN", "PROJECT_MANAGER", "SUPERVISOR"])) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const project_id = parseInt(id);
        const updates = await prisma.projectProgress.findMany({
            where: { project_id },
            include: {
                user: {
                    select: { name: true, role: true }
                }
            },
            orderBy: { created_at: "desc" }
        });

        return NextResponse.json(updates);
    } catch (error) {
        console.error("GET progress error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// POST: Add a progress update (PM and Supervisor)
export async function POST(req, { params }) {
    try {
        const user = await getUser();
        if (!user || !hasRole(user, ["PROJECT_MANAGER", "SUPERVISOR"])) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const project_id = parseInt(id);
        const body = await req.json();
        const { percentage, date, notes } = body;

        if (!date) {
            return NextResponse.json({ error: "Date is required" }, { status: 400 });
        }

        const newUpdate = await prisma.projectProgress.create({
            data: {
                project_id,
                user_id: user.id,
                percentage: percentage ? parseInt(percentage) : 0,
                date,
                notes
            }
        });

        return NextResponse.json(newUpdate, { status: 201 });
    } catch (error) {
        console.error("POST progress error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

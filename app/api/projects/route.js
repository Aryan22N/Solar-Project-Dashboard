import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const projects = await prisma.project.findMany({
            orderBy: { name: "asc" }
        });

        return NextResponse.json(projects);
    } catch (error) {
        console.error("GET projects error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const user = await getUser();
        if (!user || user.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name, description } = await req.json();

        if (!name) {
            return NextResponse.json({ error: "Project name is required" }, { status: 400 });
        }

        const project = await prisma.project.create({
            data: {
                name,
                description: description || "",
            },
        });

        return NextResponse.json(project, { status: 201 });
    } catch (error) {
        console.error("Project creation error:", error);
        return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
    }
}

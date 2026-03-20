import { prisma } from "@/lib/db";
import { getUser, hasRole } from "@/lib/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req, { params }) {
    try {
        const user = await getUser();
        if (!user || !hasRole(user, ["SUPER_ADMIN"])) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const project_id = parseInt(id);

        const project = await prisma.project.findUnique({
            where: { id: project_id },
        });

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        if (project.status === "ACTIVE") {
            return NextResponse.json({ error: "Project is already active" }, { status: 400 });
        }

        await prisma.project.update({
            where: { id: project_id },
            data: { status: "ACTIVE" }
        });

        return NextResponse.json({ message: "Project unarchived successfully" });
    } catch (error) {
        console.error("Unarchive project error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

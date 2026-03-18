import { prisma } from "@/lib/db";
import { getUser, hasRole } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
    try {
        const user = await getUser();
        if (!user || !hasRole(user, "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const project_id = parseInt(id);

        // 1. Fetch current progress entries with user details for archiving
        const progressEntries = await prisma.projectProgress.findMany({
            where: { project_id },
            include: { user: { select: { name: true, role: true } } }
        });

        // 2. Archive to ArchivedProgress table
        if (progressEntries.length > 0) {
            const archivedData = progressEntries.map(p => ({
                percentage: p.percentage,
                date: p.date,
                notes: p.notes,
                project_id: p.project_id,
                user_name: p.user.name || "Unknown",
                user_role: p.user.role,
                original_created_at: p.created_at
            }));

            await prisma.archivedProgress.createMany({
                data: archivedData
            });

            // 3. Delete active progress entries
            await prisma.projectProgress.deleteMany({
                where: { project_id }
            });
        }

        // 4. Update project status to FINISHED
        const updatedProject = await prisma.project.update({
            where: { id: project_id },
            data: { status: "FINISHED" }
        });

        return NextResponse.json({ 
            success: true, 
            message: "Project finished and progress archived",
            project: updatedProject
        });
    } catch (error) {
        console.error("Finish project error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

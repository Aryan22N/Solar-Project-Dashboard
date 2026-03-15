import { prisma } from "@/lib/db";
import { getUser, hasRole } from "@/lib/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET: Fetch all progress updates across all projects
export async function GET(req) {
    try {
        const user = await getUser();
        if (!user || !hasRole(user, ["SUPER_ADMIN", "PROJECT_MANAGER", "SUPERVISOR"])) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const updates = await prisma.projectProgress.findMany({
            include: {
                project: {
                    select: { name: true }
                },
                user: {
                    select: { name: true, role: true }
                }
            },
            orderBy: { created_at: "desc" }
        });

        const archived = await prisma.archivedProgress.findMany({
            include: {
                project: {
                    select: { name: true }
                }
            },
            orderBy: { archived_at: "desc" }
        });

        const mappedArchived = archived.map(a => ({
            id: `arch-${a.id}`,
            percentage: a.percentage,
            date: a.date,
            notes: a.notes,
            created_at: a.original_created_at,
            is_archived: true,
            project: a.project,
            user: {
                name: a.user_name,
                role: a.user_role
            }
        }));

        const allUpdates = [...updates, ...mappedArchived].sort((a, b) => 
            new Date(b.created_at) - new Date(a.created_at)
        );

        return NextResponse.json(allUpdates);
    } catch (error) {
        console.error("GET all progress error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

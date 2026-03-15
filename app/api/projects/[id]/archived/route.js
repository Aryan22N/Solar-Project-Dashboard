import { prisma } from "@/lib/db";
import { getUser, hasRole } from "@/lib/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
    try {
        const user = await getUser();
        if (!user || !hasRole(user, ["SUPER_ADMIN", "PROJECT_MANAGER", "SUPERVISOR"])) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const project_id = parseInt(id);

        const archived = await prisma.archivedProgress.findMany({
            where: { project_id },
            orderBy: { archived_at: "desc" }
        });

        // Map archived data to a similar structure as active progress
        return NextResponse.json(archived.map(a => ({
            id: `arch-${a.id}`,
            percentage: a.percentage,
            date: a.date,
            notes: a.notes,
            created_at: a.original_created_at,
            is_archived: true,
            user: {
                name: a.user_name,
                role: a.user_role
            }
        })));
    } catch (error) {
        console.error("GET archived progress error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

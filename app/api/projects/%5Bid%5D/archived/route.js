import { prisma } from "@/lib/db";
import { getUser, hasRole } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
    try {
        const user = await getUser();
        if (!user || !hasRole(user, ["SUPER_ADMIN", "PROJECT_MANAGER"])) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const project_id = parseInt(id);

        const archivedUpdates = await prisma.archivedProgress.findMany({
            where: { project_id },
            orderBy: { original_created_at: "desc" }
        });

        // Add a flag and map fields to match ProjectProgress component expectations
        const formattedUpdates = archivedUpdates.map(update => ({
            id: `archived-${update.id}`,
            percentage: update.percentage,
            date: update.date,
            notes: update.notes,
            created_at: update.original_created_at,
            is_archived: true,
            user: {
                name: update.user_name,
                role: update.user_role
            }
        }));

        return NextResponse.json(formattedUpdates);
    } catch (error) {
        console.error("GET archived progress error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

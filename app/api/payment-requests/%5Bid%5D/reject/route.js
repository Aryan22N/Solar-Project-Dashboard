import { prisma } from "@/lib/db";
import { getUser, hasRole } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
    try {
        const user = await getUser();
        if (!user || (!hasRole(user, "PROJECT_MANAGER") && !hasRole(user, "SUPER_ADMIN"))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const idStrings = id.split(",");
        const requestIds = idStrings.map(s => parseInt(s.trim())).filter(n => !isNaN(n));

        if (requestIds.length === 0) {
            return NextResponse.json({ error: "Invalid ID(s)" }, { status: 400 });
        }

        const requests = await prisma.paymentRequest.findMany({
            where: { id: { in: requestIds } },
            select: { project_id: true, created_at: true, id: true }
        });

        if (requests.length === 0) {
            return NextResponse.json({ error: "Requests not found" }, { status: 404 });
        }

        // Collect projects and their earliest request creation time today for reversion
        const projectReversionMap = {}; // { project_id: earliest_created_at }

        for (const r of requests) {
            if (!projectReversionMap[r.project_id] || r.created_at < projectReversionMap[r.project_id]) {
                projectReversionMap[r.project_id] = r.created_at;
            }
        }

        // Revert progress for each involved project
        for (const [projectId, earliestTime] of Object.entries(projectReversionMap)) {
            await prisma.projectProgress.deleteMany({
                where: {
                    project_id: parseInt(projectId),
                    created_at: {
                        gte: earliestTime
                    }
                }
            });
        }

        // Update all identified requests to REJECTED
        await prisma.paymentRequest.updateMany({
            where: { id: { in: requestIds } },
            data: { status: "REJECTED" }
        });

        return NextResponse.json({ success: true, count: requestIds.length, newStatus: "REJECTED" });
    } catch (error) {
        console.error("Reject request error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

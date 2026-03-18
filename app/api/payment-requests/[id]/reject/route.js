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
        const requestId = parseInt(id);

        // Fetch the request to know which project it belongs to and when it was created
        const request = await prisma.paymentRequest.findUnique({
            where: { id: requestId },
            select: { project_id: true, created_at: true }
        });

        if (!request) {
            return NextResponse.json({ error: "Request not found" }, { status: 404 });
        }

        const project_id = request.project_id;
        const requestCreatedAt = request.created_at;

        // Delete all progress entries for this project created on or after this request's creation time
        // This effectively reverts the progress bar and deletes notes added with/after the request today.
        await prisma.projectProgress.deleteMany({
            where: {
                project_id: project_id,
                created_at: {
                    gte: requestCreatedAt
                }
            }
        });

        await prisma.paymentRequest.update({
            where: { id: requestId },
            data: { status: "REJECTED" }
        });

        return NextResponse.json({ success: true, requestId, newStatus: "REJECTED" });
    } catch (error) {
        console.error("Reject request error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

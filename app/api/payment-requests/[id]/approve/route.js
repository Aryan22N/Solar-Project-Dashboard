import { prisma } from "@/lib/db";
import { getUser, hasRole } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const requestId = parseInt(id);

        const request = await prisma.paymentRequest.findUnique({
            where: { id: requestId }
        });

        if (!request) {
            return NextResponse.json({ error: "Request not found" }, { status: 404 });
        }

        let nextStatus;

        if (hasRole(user, "PROJECT_MANAGER")) {
            if (request.status !== "PENDING_PM") {
                return NextResponse.json({ error: "Invalid status transition" }, { status: 400 });
            }
            nextStatus = "PENDING_ADMIN";
        } else if (hasRole(user, "SUPER_ADMIN")) {
            if (request.status !== "PENDING_ADMIN") {
                return NextResponse.json({ error: "Invalid status transition" }, { status: 400 });
            }
            nextStatus = "PAID";
        } else {
            return NextResponse.json({ error: "Unauthorized role" }, { status: 401 });
        }

        const updateData = { status: nextStatus };
        if (hasRole(user, "PROJECT_MANAGER")) {
            updateData.pm_id = user.id;
        }

        const updatedRequest = await prisma.paymentRequest.update({
            where: { id: requestId },
            data: updateData,
            include: { project: true, materials: true }
        });

        return NextResponse.json(updatedRequest);
    } catch (error) {
        console.error("Approve request error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

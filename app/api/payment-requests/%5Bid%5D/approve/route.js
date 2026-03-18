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
        // Support bulk approval via comma-separated IDs (e.g., "10,11,12")
        const idStrings = id.split(",");
        const requestIds = idStrings.map(s => parseInt(s.trim())).filter(n => !isNaN(n));

        if (requestIds.length === 0) {
            return NextResponse.json({ error: "Invalid ID(s)" }, { status: 400 });
        }

        const requests = await prisma.paymentRequest.findMany({
            where: { id: { in: requestIds } }
        });

        if (requests.length === 0) {
            return NextResponse.json({ error: "Requests not found" }, { status: 404 });
        }

        let nextStatus;
        const role = hasRole(user, "PROJECT_MANAGER") ? "PROJECT_MANAGER" : (hasRole(user, "SUPER_ADMIN") ? "SUPER_ADMIN" : null);

        if (role === "PROJECT_MANAGER") {
            // Check if all are PENDING_PM
            if (requests.some(r => r.status !== "PENDING_PM")) {
                return NextResponse.json({ error: "Some requests have invalid status for PM approval" }, { status: 400 });
            }
            nextStatus = "PENDING_ADMIN";
        } else if (role === "SUPER_ADMIN") {
            // Check if all are PENDING_ADMIN
            if (requests.some(r => r.status !== "PENDING_ADMIN")) {
                return NextResponse.json({ error: "Some requests have invalid status for Admin approval" }, { status: 400 });
            }
            nextStatus = "PAID";
        } else {
            return NextResponse.json({ error: "Unauthorized role" }, { status: 401 });
        }

        const updateData = { status: nextStatus };
        if (role === "PROJECT_MANAGER") {
            updateData.pm_id = user.id;
        }

        await prisma.paymentRequest.updateMany({
            where: { id: { in: requestIds } },
            data: updateData
        });

        return NextResponse.json({ success: true, count: requestIds.length, newStatus: nextStatus });
    } catch (error) {
        console.error("Approve request error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

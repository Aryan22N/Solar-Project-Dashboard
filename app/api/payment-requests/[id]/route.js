import { prisma } from "@/lib/db";
import { getUser, hasRole } from "@/lib/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// PATCH: Update an existing payment request (Owner Supervisor only)
export async function PATCH(req, { params }) {
    try {
        const user = await getUser();
        if (!user || !hasRole(user, "SUPERVISOR")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const requestId = parseInt(id);
        const body = await req.json();
        const { date, notes } = body;

        // Verify ownership
        const existingRequest = await prisma.paymentRequest.findUnique({
            where: { id: requestId }
        });

        if (!existingRequest) {
            return NextResponse.json({ error: "Request not found" }, { status: 404 });
        }

        if (existingRequest.supervisor_id !== user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const updatedRequest = await prisma.paymentRequest.update({
            where: { id: requestId },
            data: {
                date: date !== undefined ? date : undefined,
                notes: notes !== undefined ? notes : undefined
            }
        });

        return NextResponse.json(updatedRequest);
    } catch (error) {
        console.error("PATCH payment request error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

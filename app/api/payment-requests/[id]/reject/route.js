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

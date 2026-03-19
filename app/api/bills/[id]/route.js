import { prisma } from "@/lib/db";
import { getUser, hasRole } from "@/lib/auth";
import { NextResponse } from "next/server";
import { imagekit } from "@/lib/imagekit";

export async function DELETE(req, { params }) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const billId = parseInt(id);

        const bill = await prisma.bill.findUnique({
            where: { id: billId }
        });

        if (!bill) {
            return NextResponse.json({ error: "Bill not found" }, { status: 404 });
        }

        // Check if user is the creator or a SUPER_ADMIN
        if (bill.creator_id !== user.id && !hasRole(user, "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Delete from ImageKit if exists
        if (bill.image_file_id) {
            try {
                await imagekit.deleteFile(bill.image_file_id);
            } catch (ikError) {
                console.error("ImageKit delete error for bill:", ikError);
            }
        }

        await prisma.bill.delete({
            where: { id: billId }
        });

        return NextResponse.json({ success: true, billId });
    } catch (error) {
        console.error("DELETE bill error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

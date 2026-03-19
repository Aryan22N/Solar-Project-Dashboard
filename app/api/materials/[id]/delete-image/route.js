import { prisma } from "@/lib/db";
import { getUser, hasRole } from "@/lib/auth";
import { NextResponse } from "next/server";
import { imagekit } from "@/lib/imagekit";

// DELETE: Remove image from ImageKit and DB for a specific material
export async function DELETE(req, { params }) {
    try {
        const user = await getUser();
        if (!user || !hasRole(user, "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const materialId = parseInt(id);

        const material = await prisma.material.findUnique({
            where: { id: materialId },
            select: { image_file_id: true }
        });

        if (!material) {
            return NextResponse.json({ error: "Material not found" }, { status: 404 });
        }

        // 1. Delete from ImageKit if exists
        if (material.image_file_id) {
            try {
                console.log(`Attempting to delete image from ImageKit: ${material.image_file_id}`);
                const ikResponse = await imagekit.deleteFile(material.image_file_id);
                console.log("ImageKit delete response:", ikResponse);
            } catch (ikError) {
                console.error("ImageKit delete error in gallery:", ikError);
                // Log more details about the error if available
                if (ikError.message) console.error("Error message:", ikError.message);
                if (ikError.stack) console.error("Error stack:", ikError.stack);
                // Continue to update DB even if IK delete fails (e.g. if already deleted manually)
            }
        }

        // 2. Clear DB record
        await prisma.material.update({
            where: { id: materialId },
            data: {
                image_url: null,
                image_file_id: null
            }
        });

        return NextResponse.json({ success: true, materialId });
    } catch (error) {
        console.error("DELETE material image error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

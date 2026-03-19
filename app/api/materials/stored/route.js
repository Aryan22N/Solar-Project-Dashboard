import { prisma } from "@/lib/db";
import { getUser, hasRole } from "@/lib/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET: Fetch all materials from requests that have images
export async function GET(req) {
    try {
        const user = await getUser();
        if (!user || !hasRole(user, "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const projectId = searchParams.get("project_id");

        const where = {
            OR: [
                { image_url: { not: null } },
                { image_file_id: { not: null } }
            ]
        };

        if (projectId && projectId !== "all") {
            where.request = { project_id: parseInt(projectId) };
        }

        // Fetch Bills as well
        const billWhere = {};
        if (projectId && projectId !== "all") {
            billWhere.project_id = parseInt(projectId);
        }

        const bills = await prisma.bill.findMany({
            where: billWhere,
            include: {
                project: { select: { name: true } },
                creator: { select: { name: true } }
            },
            orderBy: { created_at: "desc" }
        });

        const materials = await prisma.material.findMany({
            where,
            include: {
                request: {
                    include: {
                        project: { select: { name: true } },
                        supervisor: { select: { name: true } }
                    }
                }
            },
            orderBy: {
                request: {
                    created_at: "desc"
                }
            }
        });

        // Flatten for easier UI consumption
        const formattedMaterials = materials.map(m => ({
            id: m.id,
            type: "MATERIAL",
            name: m.name,
            quantity: m.quantity,
            url: m.image_url,
            fileId: m.image_file_id,
           projectName: m.request?.project?.name || "Unknown",
            projectId: m.request?.project_id,
            date: m.request?.created_at,
            status: m.request?.status,
            supervisorName: m.request?.supervisor?.name || "Self"
        })).filter(m => m.url || m.fileId);

        const formattedBills = bills.map(b => ({
            id: b.id,
            type: "BILL",
            name: b.name,
            url: b.image_url,
            fileId: b.image_file_id,
            projectName: b.project?.name || "Unknown",
            projectId: b.project_id,
            date: b.created_at,
            supervisorName: b.creator?.name || "Manager",
            status: "BILL/QR"
        })).filter(b => b.url || b.fileId);

        const combined = [...formattedMaterials, ...formattedBills].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );

        return NextResponse.json(combined);
    } catch (error) {
        console.error("GET stored materials error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

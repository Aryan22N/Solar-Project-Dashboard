import { prisma } from "@/lib/db";
import { getUser, hasRole } from "@/lib/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET: Fetch requests based on role
export async function GET() {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let requests;

        if (hasRole(user, "SUPERVISOR")) {
            requests = await prisma.paymentRequest.findMany({
                where: { supervisor_id: user.id },
                include: { project: true, materials: true },
                orderBy: { created_at: "desc" }
            });
        } else if (hasRole(user, "PROJECT_MANAGER")) {
            requests = await prisma.paymentRequest.findMany({
                where: { status: "PENDING_PM" },
                include: { project: true, materials: true, supervisor: { select: { name: true } } },
                orderBy: { created_at: "desc" }
            });
        } else if (hasRole(user, "SUPER_ADMIN")) {
            requests = await prisma.paymentRequest.findMany({
                include: { 
                    project: true, 
                    materials: true, 
                    supervisor: { select: { name: true } },
                    pm: { select: { name: true } }
                },
                orderBy: { created_at: "desc" }
            });
        }

        return NextResponse.json(requests);
    } catch (error) {
        console.error("GET payment requests error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// POST: Create a new request (Supervisor only)
export async function POST(req) {
    try {
        const user = await getUser();
        if (!user || !hasRole(user, "SUPERVISOR")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { project_id, materials, total_amount } = body;

        if (!project_id || !materials || !materials.length) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const newRequest = await prisma.paymentRequest.create({
            data: {
                project_id: parseInt(project_id),
                supervisor_id: user.id,
                total_amount: parseFloat(total_amount),
                status: "PENDING_PM",
                materials: {
                    create: materials.map(m => ({
                        name: m.name,
                        quantity: parseInt(m.quantity),
                        unit_price: parseFloat(m.unit_price)
                    }))
                }
            },
            include: { materials: true }
        });

        return NextResponse.json(newRequest, { status: 201 });
    } catch (error) {
        console.error("POST payment request error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

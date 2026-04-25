import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    const requests = await prisma.paymentRequest.findMany({
        where: { status: "PENDING_PM" },
        include: { materials: true, supervisor: { select: { name: true } } },
        orderBy: { created_at: "desc" }
    });

    const clubbedMap = {};
    for (const req of requests) {
        const clubKey = `${req.project_id}-PM_GROUP`;
        if (!clubbedMap[clubKey]) {
            clubbedMap[clubKey] = {
                ...req,
                isClubbed: true,
                requestIds: [req.id],
                _materials: [...req.materials],
                _total_amount: parseFloat(req.total_amount),
                _supervisor_names: [req.supervisor?.name || "Self"],
                subRequests: [req]
            };
        } else {
            clubbedMap[clubKey].requestIds.push(req.id);
            clubbedMap[clubKey]._materials.push(...req.materials);
            clubbedMap[clubKey]._total_amount += parseFloat(req.total_amount);
            if (req.supervisor?.name && !clubbedMap[clubKey]._supervisor_names.includes(req.supervisor.name)) {
                clubbedMap[clubKey]._supervisor_names.push(req.supervisor.name);
            }
            clubbedMap[clubKey].subRequests.push(req);
        }
    }

    const finalRequests = Object.values(clubbedMap).map(c => ({
        ...c,
        materials: c._materials,
        total_amount: c._total_amount,
        supervisor: { name: c._supervisor_names.join(", ") }
    }));

    return NextResponse.json(finalRequests);
}

import { prisma } from "@/lib/db";
import { getUser, hasRole } from "@/lib/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req, { params }) {
    try {
        const user = await getUser();
        if (!user || !hasRole(user, ["SUPER_ADMIN"])) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const project_id = parseInt(id);

        // 1. Fetch the project and its progress updates (including author details)
        const project = await prisma.project.findUnique({
            where: { id: project_id },
            include: {
                progress_updates: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                role: true
                            }
                        }
                    }
                }
            }
        });

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        if (project.status === "FINISHED") {
            return NextResponse.json({ error: "Project is already finished" }, { status: 400 });
        }

        // 2. Archive notes and update project status in a transaction
        await prisma.$transaction(async (tx) => {
            // Create archived records
            if (project.progress_updates.length > 0) {
                await tx.archivedProgress.createMany({
                    data: project.progress_updates.map(update => ({
                        project_id: project_id,
                        percentage: update.percentage,
                        date: update.date,
                        notes: update.notes,
                        user_name: update.user.name,
                        user_role: update.user.role,
                        original_created_at: update.created_at
                    }))
                });

                // Delete original progress records
                await tx.projectProgress.deleteMany({
                    where: { project_id }
                });
            }

            // Update project status
            await tx.project.update({
                where: { id: project_id },
                data: { status: "FINISHED" }
            });
        });

        return NextResponse.json({ message: "Project finished and notes archived successfully" });
    } catch (error) {
        console.error("Finish project error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

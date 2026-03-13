import "dotenv/config";
import { prisma } from "../lib/db.js";

async function main() {
    const projects = [
        { name: "Green Valley Solar Park", description: "Large scale solar installation in Green Valley." },
        { name: "City Center Rooftop", description: "Residential rooftop solar panels for City Center apartments." },
        { name: "Desert Power Plant", description: "Massive solar array in the eastern desert." },
    ];

    for (const project of projects) {
        await prisma.project.upsert({
            where: { id: 0 }, // Dummy where for upsert if we don't have unique strings, but we'll use create if not exist logic
            update: {},
            create: project,
        });
    }

    console.log("Seeded 3 projects.");
}

// Custom simple seed logic since we don't have unique names in schema but want a clean seed
async function simpleSeed() {
    const count = await prisma.project.count();
    if (count === 0) {
        await prisma.project.createMany({
            data: [
                { name: "Green Valley Solar Park", description: "Large scale solar installation in Green Valley." },
                { name: "City Center Rooftop", description: "Residential rooftop solar panels for City Center apartments." },
                { name: "Desert Power Plant", description: "Massive solar array in the eastern desert." },
            ]
        });
        console.log("Successfully seeded projects.");
    } else {
        console.log("Projects already exist, skipping seed.");
    }
}

simpleSeed()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        // We don't need to disconnect if the lib/db.js doesn't manage it explicitly in a way that blocks
    });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis;

function makePrisma() {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
    return new PrismaClient({ adapter });
}

const initialPrisma = globalForPrisma.prisma || makePrisma();

// Check if the instance is stale (missing new models)
if (initialPrisma && !initialPrisma.paymentRequest && process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = makePrisma();
} else {
    globalForPrisma.prisma = initialPrisma;
}

export const prisma = globalForPrisma.prisma;

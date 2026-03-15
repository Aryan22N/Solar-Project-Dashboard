import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis;

function makePrisma() {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
    return new PrismaClient({ adapter });
}

// In development, we use a global variable so that the value is preserved
// across hot reloads. This prevents connections from growing exponentially.
// If you update your schema, you might need to restart your dev server.
export const prisma = (() => {
    if (globalForPrisma.prisma) {
        // Force refresh if new models are missing from the global instance
        if (!globalForPrisma.prisma.archivedProgress && process.env.NODE_ENV !== "production") {
            delete globalForPrisma.prisma;
        } else {
            return globalForPrisma.prisma;
        }
    }
    return makePrisma();
})();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

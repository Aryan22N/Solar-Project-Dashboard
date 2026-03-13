import "dotenv/config";
import { prisma } from "../lib/db.js";

async function debug() {
    console.log("=== Prisma Client Keys ===");
    console.log(Object.keys(prisma).filter(k => !k.startsWith("_")));
}

debug().catch(console.error);

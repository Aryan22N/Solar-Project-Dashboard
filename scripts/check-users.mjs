import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import bcrypt from "bcryptjs";

// Load .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env.local") });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const users = await prisma.user.findMany({
    select: { id: true, phone: true, role: true, name: true, dob: true }
});
console.log("=== Users in DB ===");
users.forEach(u => {
    console.log(`ID: ${u.id} | Phone: ${u.phone} | Name: ${u.name} | Role: ${u.role}`);
    console.log(`  dob hash: ${u.dob}`);
});

// Verify the password "22-05-2006" against each hash
console.log("\n=== Verifying '22-05-2006' against each user's dob hash ===");
for (const u of users) {
    const match = await bcrypt.compare("22-05-2006", u.dob);
    console.log(`  ${u.phone} (${u.name}): ${match ? "✅ MATCH" : "❌ NO MATCH"}`);
}

await prisma.$disconnect();

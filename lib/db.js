import { neon } from "@neondatabase/serverless";

// Neon serverless driver uses HTTP — no TCP/DNS pooler issues
const sql = neon(process.env.DATABASE_URL);

export { sql };

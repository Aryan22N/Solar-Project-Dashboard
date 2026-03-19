import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  try {
    const materials = await prisma.material.findMany({
      include: { request: true }
    });
    console.log("TOTAL_MATERIALS_IN_DB:", materials.length);
    
    materials.forEach(m => {
      console.log(`- ID: ${m.id}, Name: ${m.name}, URL: ${m.image_url ? 'EXISTS' : 'NULL'}, FileID: ${m.image_file_id || 'NULL'}, ReqStatus: ${m.request.status}`);
    });

  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();

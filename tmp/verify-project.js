import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const admin = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' }
    });
    
    if (!admin) {
      console.log('No SUPER_ADMIN found');
    } else {
      console.log(`Found SUPER_ADMIN: ${admin.phone}`);
    }
    
    // Test creating a project directly via Prisma to verify schema and DB connection
    const testProject = await prisma.project.create({
      data: {
        name: 'Test Project ' + Date.now(),
        description: 'Test Description'
      }
    });
    
    console.log(`Successfully created project: ${testProject.name}`);
    
    // List projects to verify
    const projects = await prisma.project.findMany();
    console.log(`Total projects: ${projects.length}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

import dotenv from "dotenv";

dotenv.config();
dotenv.config({ path: '.env.local' });

const { prisma } = await import("../lib/db.js");

async function main() {
    console.log("Creating/Fetching test user...");
    let user = await prisma.user.findUnique({ where: { phone: '9999999999' } });
    if (!user) {
         user = await prisma.user.create({
             data: { phone: '9999999999', dob: '01-01-1990', role: 'SUPERVISOR', name: 'Test Supervisor' }
         });
    }

    const totalProjects = 300;
    const batchSize = 10;
    
    for (let b = 0; b < totalProjects / batchSize; b++) {
        console.log(`Processing batch ${b + 1} of ${totalProjects / batchSize}...`);
        
        // 1. Create Projects
        let createdProjects = [];
        for (let i = 0; i < batchSize; i++) {
            const projectNum = (b * batchSize) + i + 1;
            const pd = {
                name: `Test Project ${projectNum}`,
                description: `This is test project number ${projectNum}`,
                status: 'ACTIVE',
                expense_heads: ['Materials', 'Labor'],
            };
            createdProjects.push(await prisma.project.create({ data: pd }));
        }
        
        // 2. Create PaymentRequests
        const requestsData = [];
        const numRequests = 150;
        
        for (let p of createdProjects) {
            const totalExpenseTarget = 12000 + Math.random() * 3000;
            const avgExpensePerRequest = totalExpenseTarget / numRequests;
            
            for (let r = 0; r < numRequests; r++) {
                const requestAmount = Math.max(1, (avgExpensePerRequest * (0.8 + Math.random() * 0.4))).toFixed(2);
                requestsData.push({
                    project_id: p.id,
                    supervisor_id: user.id,
                    total_amount: requestAmount,
                    status: 'PENDING_PM'
                });
            }
        }
        
        await prisma.paymentRequest.createMany({ data: requestsData });
        
        // 3. Fetch requests to get their IDs
        // To be safe, we only get requests for these projects
        const requests = await prisma.paymentRequest.findMany({
            where: { project_id: { in: createdProjects.map(p => p.id) } },
            select: { id: true, total_amount: true, project_id: true },
            // we order by id to keep it deterministic but it doesn't strictly matter
        });
        
        // 4. Create Materials
        const materialsData = requests.map((req, index) => ({
            request_id: req.id,
            name: `Material ${index + 1}`,
            quantity: 1,
            unit_price: req.total_amount
        }));

        await prisma.material.createMany({ data: materialsData });
        
        console.log(`Created ${batchSize} projects with their items in batch ${b + 1}.`);
    }
    
    console.log("Seeding complete!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

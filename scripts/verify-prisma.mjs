import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Checking models...')
  const models = Object.keys(prisma)
  console.log('Models found:', models.filter(m => !m.startsWith('_')))
  
  if (prisma.archivedProgress) {
    console.log('✅ ArchivedProgress model found in client')
  } else {
    console.error('❌ ArchivedProgress model MISSING from client')
  }

  // Try a query (even if empty)
  try {
    await prisma.projectProgress.findMany({
      include: { user: true }
    })
    console.log('✅ include: { user: true } works')
  } catch (err) {
    console.error('❌ include: { user: true } FAILED:', err.message)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

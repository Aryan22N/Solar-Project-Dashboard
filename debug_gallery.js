const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const materials = await prisma.material.findMany({
    include: { request: true }
  });
  console.log("Found materials:", materials.length);
  const withImages = materials.filter(m => m.image_url);
  console.log("With images:", withImages.length);
  const paidWithImages = withImages.filter(m => m.request.status === "PAID");
  console.log("PAID with images:", paidWithImages.length);
  
  if (paidWithImages.length > 0) {
    console.log("Example PAID with image:", paidWithImages[0]);
  } else if (withImages.length > 0) {
    console.log("Example with image (status):", withImages[0].request.status);
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

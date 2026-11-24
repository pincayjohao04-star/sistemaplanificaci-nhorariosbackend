const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("========== CARRERAS ==========");

  const carreras = await prisma.carrera.findMany();

  console.table(carreras);
}

main()
  .catch((error) => {
    console.error("ERROR:", error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
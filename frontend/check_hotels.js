const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const hotels = await prisma.hotel.findMany({ select: { id: true, hotelName: true }, take: 15 });
  console.log(JSON.stringify(hotels, null, 2));
  await prisma.$disconnect();
}

main();


const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const analysis = await prisma.analysis.findMany({
      include: { hotel: true }
    });
    console.log('--- ANALYSIS RECORDS ---');
    analysis.forEach(a => {
      console.log(`ID: ${a.id}, Hotel: ${a.hotel?.hotelName}, Estrategia: ${a.estrategia.substring(0, 50)}...`);
    });

    const hotel = await prisma.hotel.findUnique({
      where: { hotelDbId: 243 }
    });
    console.log('\n--- TARGET HOTEL ---');
    console.log(hotel);

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();

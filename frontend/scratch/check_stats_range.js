
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const stats = await prisma.statistics.findMany({
      where: { hotelId: 31 },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      take: 20
    });
    console.log('Last stats records:');
    stats.forEach(s => console.log(`${s.month}/${s.year}`));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();

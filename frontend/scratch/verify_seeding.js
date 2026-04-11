
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const hotelId = 31;
  try {
    const analysis = await prisma.analysis.findFirst({
        where: { hotelId }
    });
    console.log('--- STRATEGY ---');
    console.log(analysis);

    const stats = await prisma.statistics.findMany({
        where: { hotelId },
        orderBy: [{ year: 'asc' }, { month: 'asc' }]
    });
    console.log('\n--- MONTHLY STATS ---');
    stats.forEach(s => {
        console.log(`${s.month}/${s.year}: Ingresos €${s.ingresos.toLocaleString()}, Ocupación ${s.ocupacion.toFixed(1)}%, ROI ${s.roi}%`);
    });
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();

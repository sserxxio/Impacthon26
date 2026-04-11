
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- SYSTEM CHECK ---');
  console.log('Current Date:', new Date().toLocaleString());
  
  const stats = await prisma.statistics.findMany({
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
    take: 10
  });
  
  console.log('\n--- DATA IN DB (Last 10) ---');
  stats.forEach(s => {
    console.log(`Hotel ${s.hotelId}: ${s.month}/${s.year} (Created: ${s.createdAt})`);
  });
}

main().finally(() => prisma.$disconnect());

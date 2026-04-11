
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const hotelId = 31; // Eurostars Torre Sevilla internal ID

  try {
    console.log('--- CLEANUP AND RESEED ---');

    // 1. Delete all statistics from March 2025 onwards for ALL hotels
    // This removes the 2027 mess and all recent data.
    const deletedLegacy = await prisma.statistics.deleteMany({
      where: {
        OR: [
          { year: { gt: 2025 } },
          { year: 2025, month: { gte: 3 } }
        ]
      }
    });
    console.log(`Deleted ${deletedLegacy.count} statistics records from March 2025 onwards.`);

    // 2. Re-seed hotel 31 with the Excelencia Torre trend
    // Range: April 2025 to March 2026 (previous month)
    const monthsData = [];
    const endYear = 2026;
    const endMonth = 3; // March

    for (let i = 11; i >= 0; i--) {
        let targetMonth = endMonth - i;
        let targetYear = endYear;
        while (targetMonth < 1) {
            targetMonth += 12;
            targetYear -= 1;
        }

        let multiplier = 1.0;
        
        // Baseline before Oct 2025
        if (targetYear < 2025 || (targetYear === 2025 && targetMonth < 10)) {
            multiplier = 0.82 + Math.random() * 0.1; 
        } 
        // During Strategy (Oct 2025 - Feb 2026)
        else if ((targetYear === 2025 && targetMonth >= 10) || (targetYear === 2026 && targetMonth <= 2)) {
            const monthsIntoStrategy = (targetYear === 2025) ? (targetMonth - 10) : (targetMonth + 2);
            multiplier = 1.0 + (monthsIntoStrategy * 0.12) + Math.random() * 0.1;
        }
        // After Strategy (March 2026)
        else if (targetYear === 2026 && targetMonth === 3) {
            multiplier = 1.7 + Math.random() * 0.1; // Success peak
        }

        const baselineIngresos = 85000;
        const ingresos = Math.round(baselineIngresos * multiplier);
        const costes = Math.round(ingresos * (0.45 - (multiplier * 0.05)));
        const marketingGasto = Math.round(ingresos * 0.07);
        const utilidad = ingresos - costes - marketingGasto;
        const ocupacion = Math.min(98, 45 + (multiplier - 0.8) * 65 + Math.random() * 5);
        const adr = Math.round(135 * multiplier);
        const roi = Math.round((utilidad / costes) * 100 * 100) / 100;

        monthsData.push({
            hotelId,
            month: targetMonth,
            year: targetYear,
            ingresos,
            costes,
            marketingGasto,
            utilidad,
            roi,
            ocupacion,
            adr,
            reservas: Math.round(ocupacion * 2.4),
            huespedes: Math.round(ocupacion * 4.8),
            puntuacion: Math.round((3.9 + (multiplier - 0.8) * 0.9 + Math.random() * 0.3) * 10) / 10,
            resenas: Math.round(30 + i * 8),
            createdAt: new Date(targetYear, targetMonth - 1, 15),
        });
    }

    console.log(`Inserting ${monthsData.length} records for Hotel 31...`);
    for (const data of monthsData) {
        await prisma.statistics.create({ data });
    }

    console.log('✅ CLEANUP AND RESEED COMPLETED');
    console.log('Timeline ends in March 2026. Future data removed.');

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();

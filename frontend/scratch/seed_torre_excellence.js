
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const hotelId = 31; // Eurostars Torre Sevilla internal ID
  const hotelDbId = 243;

  try {
    console.log('--- RESETTING DATA FOR HOTEL 31 (Eurostars Torre Sevilla) ---');

    // 1. Delete all statistics for this hotel
    const deletedStats = await prisma.statistics.deleteMany({
      where: { hotelId }
    });
    console.log(`Deleted ${deletedStats.count} statistics records.`);

    // 2. Delete existing Analysis titled 'Excelencia Torre' or similar
    // Actually the user said "existente", but since my check showed 0 records, I will ensure it exists.
    const deletedAnalysis = await prisma.analysis.deleteMany({
      where: { hotelId }
    });
    console.log(`Deleted ${deletedAnalysis.count} analysis records.`);

    // 3. Create 'Excelencia Torre' strategy
    // We'll set the createdAt to reflect when it was theoretically "created" (e.g. Oct 2025)
    // Note: Analysis model has estrategia, anuncio, etc.
    const strategy = await prisma.analysis.create({
      data: {
        hotelId,
        estrategia: 'Excelencia Torre: Plan Maestro de Optimización. Foco en Luxury Experience y Revenue Directo.',
        anuncio: 'Experimenta la grandeza de Sevilla desde el punto más alto. Reserva directa con ventajas exclusivas.',
        segmentoObjeto: 'Viajeros de negocios y turismo de lujo',
        diferencadores: 'Vistas panorámicas, servicio 5 estrellas, ubicación premium',
        recomendaciones: JSON.stringify([
          { titulo: 'Optimización de ADR', impacto: 'Alto' },
          { titulo: 'Mejora de Reputación Digital', impacto: 'Medio-Alto' }
        ]),
        createdAt: new Date('2025-10-15T12:00:00Z'), // Started in Oct 2025
      }
    });
    console.log(`Created strategy 'Excelencia Torre' with ID: ${strategy.id}`);

    // 4. Generate 12 months of Statistics ending in March 2026
    const monthsData = [];
    const endYear = 2026;
    const endMonthSymbolic = 3; // March

    for (let i = 11; i >= 0; i--) {
        let targetMonth = endMonthSymbolic - i;
        let targetYear = endYear;
        while (targetMonth < 1) {
            targetMonth += 12;
            targetYear -= 1;
        }

        // Performance Logic
        // Strategy starts Oct 2025 (targetMonth 10, targetYear 2025)
        // Strategy ends Feb 2026 (targetMonth 2, targetYear 2026)
        
        let multiplier = 1.0;
        const totalMonthsPassed = (targetYear - 2025) * 12 + (targetMonth - 4); // Relative to April 2025
        
        // Baseline before Oct 2025
        if (targetYear < 2025 || (targetYear === 2025 && targetMonth < 10)) {
            multiplier = 0.8 + Math.random() * 0.2; // 0.8 to 1.0
        } 
        // During Strategy (Oct 2025 - Feb 2026)
        else if ((targetYear === 2025 && targetMonth >= 10) || (targetYear === 2026 && targetMonth <= 2)) {
            // Gradually increase from Oct to Feb
            const monthsIntoStrategy = (targetYear === 2025) ? (targetMonth - 10) : (targetMonth + 2);
            multiplier = 1.0 + (monthsIntoStrategy * 0.1) + Math.random() * 0.1; // 1.0 to 1.5+
        }
        // After Strategy (March 2026)
        else if (targetYear === 2026 && targetMonth === 3) {
            multiplier = 1.6 + Math.random() * 0.1; // Peak
        }

        const baselineIngresos = 80000;
        const ingresos = Math.round(baselineIngresos * multiplier);
        const costes = Math.round(ingresos * (0.5 - (multiplier * 0.05))); // Costes % goes down as efficiency rises
        const marketingGasto = Math.round(ingresos * 0.1);
        const utilidad = ingresos - costes - marketingGasto;
        const ocupacion = Math.min(98, 50 + (multiplier - 1) * 60 + Math.random() * 5);
        const adr = Math.round(120 * multiplier);
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
            puntuacion: Math.round((3.8 + (multiplier - 0.8) * 0.8 + Math.random() * 0.3) * 10) / 10,
            resenas: Math.round(20 + i * 5),
            createdAt: new Date(targetYear, targetMonth - 1, 15),
        });
    }

    console.log('Inserting 12 months of statistics...');
    for (const data of monthsData) {
        await prisma.statistics.create({ data });
    }

    console.log('✅ DATABASE SEEDED SUCCESSFULLY');
    console.log('Data ends in March 2026.');
    console.log('Strategy "Excelencia Torre" spans Oct 2025 - Feb 2026 with positive growth.');

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();

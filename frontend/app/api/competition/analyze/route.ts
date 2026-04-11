import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { hotelId, filterType, stars, cityPrice } = await req.json();

    if (!hotelId) {
      return NextResponse.json({ error: "Hotel ID requerido" }, { status: 400 });
    }

    // Obtener tu hotel
    const yourHotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
      include: {
        statistics: true,
        amenities: true,
      },
    });

    if (!yourHotel) {
      return NextResponse.json({ error: "Hotel no encontrado" }, { status: 404 });
    }

    // Calcular métricas de tu hotel
    const yourStats = yourHotel.statistics.slice(-6);
    const yourOcupacion = yourStats.length > 0 ? yourStats.reduce((s, st) => s + st.ocupacion, 0) / yourStats.length : 0;
    const yourAdr = yourStats.length > 0 ? yourStats.reduce((s, st) => s + st.adr, 0) / yourStats.length : 0;
    const yourPuntuacion = yourStats.length > 0 ? yourStats.reduce((s, st) => s + st.puntuacion, 0) / yourStats.length : 0;
    const yourAmenitiesCount = Object.values(yourHotel.amenities || {}).filter((v) => v === true).length;

    // Buscar competidores según filtro
    let competitors: any[] = [];

    if (filterType === "city-stars") {
      // Buscar hoteles en la misma ciudad con estrellas similares
      competitors = await prisma.hotel.findMany({
        where: {
          cityName: yourHotel.cityName,
          stars: {
            gte: Math.max(1, stars - 1),
            lte: Math.min(5, stars + 1),
          },
          id: { not: hotelId },
        },
        include: {
          statistics: true,
          amenities: true,
        },
        take: 10,
      });
    } else if (filterType === "city-price") {
      // Buscar hoteles en la misma ciudad con mismo rango de precio
      competitors = await prisma.hotel.findMany({
        where: {
          cityName: yourHotel.cityName,
          cityPrice: cityPrice,
          id: { not: hotelId },
        },
        include: {
          statistics: true,
          amenities: true,
        },
        take: 10,
      });
    }

    // Calcular métricas de competidores y tomar top 2
    const competitorsWithMetrics = competitors.map((comp) => {
      const stats = comp.statistics.slice(-6);
      const ocupacion = stats.length > 0 ? stats.reduce((s: any, st: any) => s + st.ocupacion, 0) / stats.length : 0;
      const adr = stats.length > 0 ? stats.reduce((s: any, st: any) => s + st.adr, 0) / stats.length : 0;
      const puntuacion = stats.length > 0 ? stats.reduce((s: any, st: any) => s + st.puntuacion, 0) / stats.length : 0;
      const amenitiesCount = Object.values(comp.amenities || {}).filter((v: any) => v === true).length;

      return {
        id: comp.id,
        hotelName: comp.hotelName,
        country: comp.country,
        stars: comp.stars,
        cityName: comp.cityName,
        cityPrice: comp.cityPrice,
        avgOcupacion: ocupacion,
        avgAdr: adr,
        avgPuntuacion: puntuacion,
        amenitiesCount: amenitiesCount,
        totalAmenities: 21, // Total de amenities posibles
      };
    });

    // Tomar top 2 por puntuación + ocupación (combinado)
    const topCompetitors = competitorsWithMetrics
      .sort((a, b) => {
        const scoreA = a.avgPuntuacion * 0.6 + a.avgOcupacion * 0.4;
        const scoreB = b.avgPuntuacion * 0.6 + b.avgOcupacion * 0.4;
        return scoreB - scoreA;
      })
      .slice(0, 2);

    // Tu hotel con métricas
    const yourHotelData = {
      id: yourHotel.id,
      hotelName: yourHotel.hotelName,
      country: yourHotel.country,
      stars: yourHotel.stars,
      cityName: yourHotel.cityName || "Desconocida",
      cityPrice: yourHotel.cityPrice || "N/A",
      avgOcupacion: yourOcupacion,
      avgAdr: yourAdr,
      avgPuntuacion: yourPuntuacion,
      amenitiesCount: yourAmenitiesCount,
      totalAmenities: 21,
    };

    // Generar análisis con IA
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Actúa como consultor estratégico hotelero. Analiza la posición competitiva de este hotel:

TU HOTEL:
- Nombre: ${yourHotelData.hotelName}
- Estrellas: ${yourHotelData.stars}
- Puntuación: ${yourHotelData.avgPuntuacion.toFixed(1)}/5.0
- Ocupación: ${Math.round(yourHotelData.avgOcupacion)}%
- ADR: €${Math.round(yourHotelData.avgAdr)}
- Amenities: ${yourHotelData.amenitiesCount}/21

COMPETIDOR 1: ${topCompetitors[0] ? topCompetitors[0].hotelName : "N/A"}
${topCompetitors[0] ? `- Estrellas: ${topCompetitors[0].stars}
- Puntuación: ${topCompetitors[0].avgPuntuacion.toFixed(1)}/5.0
- Ocupación: ${Math.round(topCompetitors[0].avgOcupacion)}%
- ADR: €${Math.round(topCompetitors[0].avgAdr)}
- Amenities: ${topCompetitors[0].amenitiesCount}/21` : ""}

COMPETIDOR 2: ${topCompetitors[1] ? topCompetitors[1].hotelName : "N/A"}
${topCompetitors[1] ? `- Estrellas: ${topCompetitors[1].stars}
- Puntuación: ${topCompetitors[1].avgPuntuacion.toFixed(1)}/5.0
- Ocupación: ${Math.round(topCompetitors[1].avgOcupacion)}%
- ADR: €${Math.round(topCompetitors[1].avgAdr)}
- Amenities: ${topCompetitors[1].amenitiesCount}/21` : ""}

Proporciona:
1. Un análisis general de la posición competitiva
2. Una lista de ventajas competitivas (puntos donde destacas)
3. Una lista de áreas de mejora (dónde van mejor que tú)
4. Recomendaciones estratégicas específicas

Responde en JSON con estructura:
{
  "analysis": "párrafo general",
  "advantages": ["ventaja 1", "ventaja 2", ...],
  "weaknesses": ["debilidad 1", "debilidad 2", ...],
  "recommendations": ["recomendación 1", "recomendación 2", ...]
}`;

    try {
      const response = await model.generateContent(prompt);
      const analysisText = response.response.text();

      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        analysis: "Análisis competitivo generado.",
        advantages: ["Puntuación sólida", "Buena ocupación"],
        weaknesses: ["ADR por debajo del promedio"],
        recommendations: ["Considerar aumentar amenities premium"],
      };

      return NextResponse.json({
        competitors: topCompetitors,
        yourHotel: yourHotelData,
        analysis: analysis.analysis || "",
        advantages: analysis.advantages || [],
        weaknesses: analysis.weaknesses || [],
        recommendations: analysis.recommendations || [],
      });
    } catch (aiError) {
      console.error("Error IA:", aiError);

      // Análisis por defecto si falla IA
      const advantages = [];
      const weaknesses = [];

      if (yourHotelData.avgPuntuacion > (topCompetitors[0]?.avgPuntuacion || 0)) {
        advantages.push("Mejor puntuación de clientes que los competidores");
      }
      if (yourHotelData.avgOcupacion > 70) {
        advantages.push("Alto nivel de ocupación (estrategia de pricing efectiva)");
      }
      if (yourHotelData.amenitiesCount >= 15) {
        advantages.push("Amplio portafolio de amenities");
      }

      topCompetitors.forEach((comp, idx) => {
        if (comp.avgAdr > yourHotelData.avgAdr * 1.15) {
          weaknesses.push(`ADR ${Math.round(((comp.avgAdr / yourHotelData.avgAdr - 1) * 100))}% inferior vs Competidor ${idx + 1}`);
        }
      });

      return NextResponse.json({
        competitors: topCompetitors,
        yourHotel: yourHotelData,
        analysis: `Posición competitiva analizada. Tu hotel se compara favorablemente ${
          topCompetitors.length > 0 ? "vs los competidores seleccionados" : ""
        }.`,
        advantages: advantages.length > 0 ? advantages : ["Datos disponibles para análisis"],
        weaknesses: weaknesses.length > 0 ? weaknesses : ["Monitorear comportamiento de competencia"],
        recommendations: [
          "Revisar estrategia de pricing según ADR de competencia",
          "Analizar amenities que ofrecen competidores",
          "Optimizar experiencia de cliente para mejorar puntuación",
        ],
      });
    }
  } catch (error) {
    console.error("Error en análisis de competencia:", error);
    return NextResponse.json({ error: "Error al procesar análisis" }, { status: 500 });
  }
}

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const { mode, hotelId, customInput } = await req.json();

    if (!hotelId) {
      return NextResponse.json({ error: "hotelId es obligatorio" }, { status: 400 });
    }

    const hotelIdInt = parseInt(hotelId);

    // ① Cargar datos del hotel (amenities + métricas)
    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelIdInt },
      include: {
        amenities: true,
        statistics: { orderBy: [{ year: "desc" }, { month: "desc" }], take: 6 },
      },
    });

    // ② Cargar datos de clientes reales (Customer) para este hotel
    const customers = await prisma.customer.findMany({
      where: { hotelId: hotelIdInt },
      take: 50,
    });

    if (!hotel) {
      return NextResponse.json({ error: "Hotel no encontrado" }, { status: 404 });
    }

    // Preparar resumen de amenities
    const amenitiesActivas = hotel.amenities
      ? Object.entries(hotel.amenities)
          .filter(([k, v]) => typeof v === "boolean" && v === true && k !== "id" && k !== "hotelId")
          .map(([k]) => k)
          .join(", ")
      : "No especificadas";

    // Preparar resumen de estadísticas
    const statsStr = hotel.statistics
      .map((s) => `${s.month}/${s.year}: Ocupación ${s.ocupacion}%, ADR ${s.adr}€, Ingresos ${s.ingresos}€, Puntuación ${s.puntuacion}/10`)
      .join(" | ");

    // Preparar resumen de clientes desde BD
    const avgScore =
      customers.length > 0
        ? (customers.reduce((sum, c) => sum + c.avgScore, 0) / customers.length).toFixed(1)
        : "N/A";

    const countryCounts: Record<string, number> = {};
    const ageCounts: Record<string, number> = {};
    customers.forEach((c) => {
      countryCounts[c.country] = (countryCounts[c.country] || 0) + 1;
      if (c.ageRange) ageCounts[c.ageRange] = (ageCounts[c.ageRange] || 0) + 1;
    });

    const topCountries = Object.entries(countryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([c, n]) => `${c} (${n})`)
      .join(", ");

    const topAges = Object.entries(ageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([a, n]) => `${a} años (${n})`)
      .join(", ");

    const customerSummary =
      customers.length > 0
        ? `Total clientes: ${customers.length} | Puntuación media: ${avgScore}/10 | Mercados principales: ${topCountries} | Franjas de edad top: ${topAges}`
        : "Sin datos de clientes en la BD.";

    const contextStr = `
--- CONTEXTO DEL HOTEL ---
Nombre: ${hotel.hotelName} | Estrellas: ${hotel.stars} | Ciudad: ${hotel.cityName}
Amenities activas: ${amenitiesActivas}
Métricas recientes: ${statsStr || "Sin datos"}
Perfil de clientes (base de datos): ${customerSummary}
--------------------------
`;

    let systemInstruction = "";
    let finalPrompt = "";

    if (mode === "marketing") {
      systemInstruction =
        "Eres un copywriter premium especializado en hoteles de lujo. Tu tarea es crear textos de marketing persuasivos basándote en las amenities reales del hotel. Redacta siempre en Markdown bien estructurado.";
      finalPrompt = `${contextStr}\n\nGenera 3 textos de marketing para el hotel resaltando sus amenities activas:\n- Opción 1: Descripción premium para la web oficial (tono elegante y exclusivo).\n- Opción 2: Post corto para redes sociales (dinámico, con emojis).\n- Opción 3: Texto enfocado al perfil de clientes habituales de la BD (mercados y edades reales arriba).\n\nInstrucciones adicionales del usuario: ${customInput || "Ninguna"}`;
    } else if (mode === "reviews") {
      systemInstruction =
        "Eres el Director de Relaciones con Clientes (Guest Relations Manager) de un hotel de categoría superior. Tu misión es redactar respuestas públicas a reseñas de forma empática, profesional y resolutiva. Usa Markdown.";
      finalPrompt = `${contextStr}\n\nBasándote en el perfil real de clientes del hotel (mercados: ${topCountries}, edad: ${topAges}, puntuación media: ${avgScore}/10):\n\n${
        customInput?.trim()
          ? `Responde a esta reseña/queja específica: "${customInput}"\nRedacta 3 versiones: 1) Oficial y formal, 2) Cercana y empática, 3) En inglés formal.`
          : `Genera 2 borradores de respuesta-tipo para clientes de estos mercados (${topCountries}), agradeciendo su fidelidad (puntuación media ${avgScore}/10) e invitándoles a volver.`
      }`;
    } else if (mode === "reporte") {
      systemInstruction =
        "Eres un analista financiero y consultor hotelero de nivel senior. Redacta informes ejecutivos claros, con datos concretos y recomendaciones accionables. Usa Markdown con H2, tablas y negritas.";
      finalPrompt = `${contextStr}\n\nRedacta un Resumen Ejecutivo completo que cruce TODAS estas fuentes de datos:\n1. Métricas operacionales (ocupación, ADR, ingresos)\n2. Puntuación de satisfacción de clientes reales de la BD (${avgScore}/10 de ${customers.length} clientes)\n3. Perfil de clientes principales: ${topCountries}\n\nIncluye: situación actual, tendencias detectadas, alertas y recomendación estratégica.\n\nFoco específico pedido: ${customInput || "Informe gerencial integral"}`;
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", systemInstruction });
    const result = await model.generateContent(finalPrompt);

    return NextResponse.json({ content: result.response.text().trim() });
  } catch (error: any) {
    console.error("Error Content Generator:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

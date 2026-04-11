import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const { mode, hotelId, customInput } = await req.json();

    let contextStr = "";
    const currentDate = new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

    if (hotelId) {
      const hotel = await prisma.hotel.findUnique({
        where: { id: parseInt(hotelId) },
        include: { amenities: true, statistics: { take: 3, orderBy: { year: 'desc' } } }
      });

      if (hotel) {
        const ams = hotel.amenities ? Object.entries(hotel.amenities)
          .filter(([k, v]) => v === true && k !== 'id' && k !== 'hotelId' && typeof v === 'boolean')
          .map(([k]) => k).join(", ") : "";

        // Solo le sumamos estadísticas al reporte, no al marketing
        let statsStr = "";
        if (mode === "reporte") {
           const sortedStats = hotel.statistics.sort((a, b) => (b.year * 12 + b.month) - (a.year * 12 + a.month));
           statsStr = sortedStats.map(s => `Mes ${s.month}: Ocupación ${s.ocupacion}%, ADR ${s.adr}€, Ingresos ${s.ingresos}€`).join(" | ");
        }

        contextStr = `
        --- CONTEXTO DEL HOTEL ---
        Nombre: ${hotel.hotelName} | Estrellas: ${hotel.stars} | Ciudad: ${hotel.cityName}
        Equipamiento (Amenities): ${ams || 'Lo básico'}
        ${statsStr ? `Histórico Reciente: ${statsStr}` : ''}
        --------------------------
        `;
      }
    }

    let systemInstruction = "";
    let finalPrompt = "";

    if (mode === "marketing") {
      systemInstruction = "Eres un copywriter experto en hoteles de lujo y marketing persuasivo. Tu objetivo es redactar textos publicitarios impecables usando formato Markdown.";
      finalPrompt = `${contextStr}\n\nEscribe 3 opciones de descripciones o posts para redes sociales y la web del hotel, resaltando nuestro equipamiento (amenities). Opción 1: Tono de lujo/premium. Opción 2: Tono cálido para familias/parejas. Opción 3: Post corto para Instagram. Incluye emojis sutiles. Contexto extra pedido por el usuario: ${customInput || "Ninguno"}`;
    } else if (mode === "reviews") {
      systemInstruction = "Eres un Guest Relations Manager de un hotel de alto nivel, experto en gestión de reputación online. Respondes quejas y halagos con suprema empatía y profesionalidad. Devuelve el resultado en Markdown.";
      finalPrompt = `${contextStr}\n\nUn cliente ha dejado la siguiente reseña: "${customInput}".\n\nPor favor redacta 3 borradores de respuesta: 1) Oficial y resolutiva. 2) Cálida y cercana. 3) En idioma Inglés (formal). Usa marcadores de posición tipo [Nombre del Hotel] si no estás seguro del dato.`;
    } else if (mode === "reporte") {
      systemInstruction = "Eres un analista financiero y hotelero (Director General). Haces resúmenes ejecutivos precisos, profesionales y fáciles de leer. Devuelve el resultado estructurado en Markdown con H2, listas y negritas.";
      finalPrompt = `${contextStr}\n\nEl usuario pide: "${customInput || "Haz un reporte mensual ejecutivo."}". Analiza el histórico reciente provisto en el contexto. Dame un informe ejecutivo con 1) Resumen de situación actual, 2) Tendencias o alertas financieras, y 3) Recomendación clave de 1 línea.`;
    } else {
      systemInstruction = "Eres un asistente hotelero multitrabajo.";
      finalPrompt = `${contextStr}\n\nPetición: ${customInput}`;
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemInstruction
    });

    const result = await model.generateContent(finalPrompt);
    const text = result.response.text().trim();

    return NextResponse.json({ content: text });
  } catch (error: any) {
    console.error("Error Generador de Contenido:", error);
    return NextResponse.json({ error: "No se pudo generar el contenido", details: error.message }, { status: 500 });
  }
}

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const memoryCache = new Map(); // Caché en memoria para evitar modificar el Schema de BD

export async function POST(req: NextRequest) {
  try {
    const { prompt: userPrompt, datosHotel, hotelId, refresh } = await req.json();

    // 🔄 CACHÉ EN MEMORIA: Al no tener variable 'tipo' en BD, cacheamos en RAM usando el prompt
    if (hotelId && !refresh) {
      const cacheKey = `${hotelId}-${userPrompt}`;
      if (memoryCache.has(cacheKey)) {
        console.log(`✅ Devolviendo análisis en memoria para ${cacheKey}`);
        return NextResponse.json({ ...memoryCache.get(cacheKey), cached: true });
      }
    }

    // 🏨 RECUPERAR CONTEXTO REAL DEL HOTEL
    let contextStr = "";
    const currentDate = new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

    if (hotelId) {
      const hotel = await prisma.hotel.findUnique({
        where: { id: parseInt(hotelId) },
        include: {
          amenities: true,
          statistics: {
            take: 6,
            orderBy: {
              year: 'desc',
            }
          }
        }
      });

      if (hotel) {
        // Ordenar estadísticas por año y mes descendente manualmente para seguridad
        const sortedStats = hotel.statistics.sort((a, b) => (b.year * 12 + b.month) - (a.year * 12 + a.month));

        const statsStr = sortedStats.map(s =>
          `${s.month}/${s.year}: Ocupación ${s.ocupacion}%, ADR ${s.adr}€, Ingresos ${s.ingresos}€`
        ).join(" | ");

        const ams = hotel.amenities ? Object.entries(hotel.amenities)
          .filter(([k, v]) => v === true && k !== 'id' && k !== 'hotelId' && typeof v === 'boolean')
          .map(([k]) => k).join(", ") : "Básicas";

        contextStr = `
        --- CONTEXTO REAL DEL HOTEL (Fecha Actual: ${currentDate}) ---
        Nombre: ${hotel.hotelName} | Estrellas: ${hotel.stars} | Ciudad: ${hotel.cityName}
        Equipamiento: ${ams}
        Histórico Reciente: ${statsStr}
        ----------------------------------------------------------
        `;
      }
    }

    // 🤖 Si no hay caché válido, llamar a Gemini
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: `Eres un consultor senior de revenue y marketing hotelero experto en análisis de datos.
      Tu misión es generar estrategias personalizadas basadas en el CONTEXTO REAL del hotel proporcionado.
      Utiliza los datos de ocupación, ADR y amenidades para que la propuesta sea factible y específica para la temporada actual.
      
      Tu salida DEBE SER UNICAMENTE UN JSON con este formato:
      {
        "nombre": "Nombre corto (3-5 palabras)",
        "descripcion": "Resumen de 1 frase",
        "estrategia": "Detalle técnico de la mejora basado en el contexto",
        "coste": "Estimación en €",
        "tiempo": "Plazo de ejecución",
        "targeting": "Público objetivo específico",
        "roi": "Porcentaje esperado"
      }`
    });

    const fullPrompt = `${contextStr}\n\nAnaliza y genera una estrategia para la siguiente petición: ${userPrompt}`;

    const result = await model.generateContent(fullPrompt);
    const text = result.response.text().replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(text);

    // Guardar en BD opcionalmente sin la variable 'tipo'
    if (hotelId) {
      const cacheKey = `${hotelId}-${userPrompt}`;
      memoryCache.set(cacheKey, parsed); // Guardar en caché rápida

      await prisma.analysis.create({
        data: {
          hotelId: parseInt(hotelId),
          estrategia: parsed.estrategia,
          anuncio: parsed.descripcion || parsed.nombre || "Análisis generado",
          segmentoObjeto: parsed.targeting,
          diferencadores: parsed.roi || null,
          recomendaciones: JSON.stringify({
            coste: parsed.coste,
            tiempo: parsed.tiempo,
            roi: parsed.roi
          }),
        },
      }).catch(e => console.error("Error guardando en BD:", e));
    }

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error("Error API:", error);

    // En lugar de devolver datos falsos, devolvemos un error real para que el Frontend lo gestione
    return NextResponse.json({
      error: "IA_SATURATION",
      message: "Nuestros servidores de IA están procesando demasiadas peticiones en este momento."
    }, { status: 503 });
  }
};
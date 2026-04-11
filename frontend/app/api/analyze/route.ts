import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const memoryCache = new Map(); // Caché en memoria para evitar modificar el Schema de BD

export async function POST(req: NextRequest) {
  try {
    const { prompt: userPrompt, datosHotel, hotelId } = await req.json();

    // 🔄 CACHÉ EN MEMORIA: Al no tener variable 'tipo' en BD, cacheamos en RAM usando el prompt
    if (hotelId) {
      const cacheKey = `${hotelId}-${userPrompt}`;
      if (memoryCache.has(cacheKey)) {
        console.log(`✅ Devolviendo análisis en memoria para ${cacheKey}`);
        return NextResponse.json({ ...memoryCache.get(cacheKey), cached: true });
      }
    }

    // 🤖 Si no hay caché válido, llamar a Gemini
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: `Eres un consultor senior de revenue y marketing hotelero.
      Tu salida DEBE SER UNICAMENTE UN JSON con este formato:
      {
        "nombre": "Nombre corto (3-5 palabras)",
        "descripcion": "Resumen de 1 frase",
        "estrategia": "Detalle técnico de la mejora",
        "coste": "Estimación en €",
        "tiempo": "Plazo de ejecución",
        "targeting": "Público objetivo",
        "roi": "Porcentaje esperado"
      }`
    });

    const fullPrompt = `Analiza para el hotel ${datosHotel?.nombre || 'genérico'}: ${userPrompt}`;

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

    // Retornar un resultado de contingencia para que el Frontend no se rompa (útil en Hackathons por Rate Limits)
    return NextResponse.json({
      nombre: "Estrategia Local Alternativa",
      descripcion: "Nuestros servidores IA están procesando demasiadas peticiones. Recomendamos contingencia.",
      estrategia: "Aprovecha de revisar tus tarifas actuales manualmente en el PMS y realiza comprobaciones de paridad de precios.",
      coste: "0€",
      tiempo: "Inmediato",
      targeting: "Todos los segmentos",
      roi: "Estable"
    }, { status: 200 }); // Devolver 200 para que se añada a la pantalla
  }
};
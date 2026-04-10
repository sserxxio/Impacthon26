import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const { datosHotel, reseñasCompetencia, hotelId } = await req.json();

    // Obtener datos de la BD
    const clientes = await prisma.customer.findMany({ take: 50 });
    const hoteles = await prisma.hotel.findMany({ take: 10 });

    // Construir prompt
    const prompt = `
Eres un experto en marketing hotelero. Analiza los siguientes datos y proporciona estrategias de marketing predictivo.

DATOS DEL HOTEL:
${JSON.stringify(datosHotel, null, 2)}

RESEÑAS DE LA COMPETENCIA:
${JSON.stringify(reseñasCompetencia, null, 2)}

DATOS DE CLIENTES (MUESTRA):
${JSON.stringify(clientes.slice(0, 5), null, 2)}

Por favor, genere un JSON con:
1. estrategia: Estrategia de marketing recomendada
2. anuncio: Copy para redes sociales
3. segmentoObjeto: Segmento de cliente objetivo
4. diferenciate: Diferenciadores clave
5. recomendaciones: Array de recomendaciones de mejora

Responde SOLO con JSON válido, sin markdown.
`;

    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(text);

    // Guardar análisis en BD si se proporciona hotelId
    let analisisGuardado = null;
    if (hotelId) {
      analisisGuardado = await prisma.analysis.create({
        data: {
          hotelId: parseInt(hotelId),
          estrategia: parsed.estrategia,
          anuncio: parsed.anuncio,
          segmentoObjeto: parsed.segmentoObjeto,
          diferencadores: parsed.diferenciate,
          recomendaciones: JSON.stringify(parsed.recomendaciones),
        },
      });
    }

    return NextResponse.json({
      ...parsed,
      analisisId: analisisGuardado?.id,
    });
  } catch (error) {
    console.error("Error en /api/analyze:", error);
    return NextResponse.json(
      {
        error: "Error al procesar",
        estrategia: "Estrategia de contingencia",
        anuncio: "Descubre nuestro hotel único con Spa y servicio para mascotas",
        segmentoObjeto: "Viajeros con mascotas",
        diferenciate: ["Spa de lujo", "Acepta mascotas", "WiFi de calidad"],
        medidas_accion: ["Marketing en redes", "Alianzas con agencias de viajes",
        ],
      },
      { status: 500 }
    );
  }
}
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const { prompt: userPrompt, datosHotel, hotelId } = await req.json();

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
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

    // Guardar en BD opcionalmente (puedes ajustar los campos de tu Prisma aquí)
    if (hotelId) {
      await prisma.analysis.create({
        data: {
          hotelId: parseInt(hotelId),
          estrategia: parsed.estrategia,
          segmentoObjeto: parsed.targeting,
          // Ajusta según tu esquema de base de datos
        },
      }).catch(e => console.error("Error guardando en BD:", e));
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Error API:", error);
    return NextResponse.json({ error: "Error de conexión" }, { status: 500 });
  }
}
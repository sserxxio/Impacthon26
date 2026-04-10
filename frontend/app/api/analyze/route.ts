import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { hotelData, competitorReviews } = await req.json();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Actúa como un experto en marketing de hoteles. 
    Datos: ${JSON.stringify(hotelData)}. 
    Competencia: ${JSON.stringify(competitorReviews)}.
    Dame una estrategia y un anuncio corto para redes en JSON.`;

    const result = await model.generateContent(prompt);
    const response = JSON.parse(result.response.text().replace(/```json|```/g, ""));

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error: "Error de conexión con la IA" }, { status: 500 });
  }
}
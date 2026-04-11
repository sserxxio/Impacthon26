import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const { history, message, context } = await req.json();

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: { responseMimeType: "application/json" },
      systemInstruction: `Eres Velvet, tu deber es ayudar al hotel ${context?.hotelName || 'este hotel'}.
      Implementas y modificas la estrategia técnica sobre la marcha. Estado actual de la estrategia original:
      - Nombre: ${context?.strategyName}
      - Detalle: ${context?.strategyDetail}
      - Coste: ${context?.strategyCoste}
      - Tiempo: ${context?.strategyTiempo}
      - Target: ${context?.strategyTargeting}
      - ROI: ${context?.strategyRoi}
      
      Actúa como consultor. RETORNA ESTRICTAMENTE EL SIGUIENTE FORMATO JSON SIEMPRE:
      {
        "reply": "Tu mensaje respuesta conversational normal y amistoso.",
        "modificaEstrategia": boolean,
        "modifiedStrategy": {
          "nombre": "Nuevo Nombre",
          "descripcion": "Breve descripcion nueva",
          "estrategia": "Nueva hoja de ruta tecnica detallada",
          "coste": "Nuevos costes",
          "tiempo": "Nuevos plazos de implementación",
          "targeting": "Nuevo público",
          "roi": "Nuevo ROI proyeccion"
        }
      }
      
      Si el usuario te dice sugerencias rutinarias ("crea un correo", "haz tabla"), envía "modificaEstrategia": false y "modifiedStrategy": null.
      Si el usuario TE PIDE cambiar el tiempo, los costes, públicos o cambiar el modelo de estrategia del hotel, DEBES enviar "modificaEstrategia": true y poblar COMPLETAMENTE "modifiedStrategy" con los datos actualizados a nivel global.`
    });

    const formattedHistory = (history || []).map((msg: any) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: JSON.stringify({ reply: msg.content }) }] // Enmascaramos el historial como JSON válido para no confundir al motor
    }));

    const chat = model.startChat({
      history: formattedHistory
    });

    const result = await chat.sendMessage(message);
    const text = result.response.text().replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(text);

    return NextResponse.json({
      reply: parsed.reply,
      modifiedStrategy: parsed.modificaEstrategia ? parsed.modifiedStrategy : null
    });
  } catch (error: any) {
    console.error("Error en Chat API:", error);

    // Fallback de contingencia rápida por rate limits de Gemini 429
    return NextResponse.json({
      reply: "⚠️ Mis servidores de IA están procesando un alto volumen de solicitudes ahora mismo debido a cuotas de red. Por favor, revisa directamente desde tu Panel PMS los datos mientras tanto, ¡inténtalo de nuevo en unos segundos!"
    });
  }
}
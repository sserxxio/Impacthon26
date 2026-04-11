"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function ContentGeneratorPage() {
  const [hotelName, setHotelName] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedHotelId = localStorage.getItem("hotelId");
    const storedHotelName = localStorage.getItem("hotelName");

    if (!storedHotelId) {
      router.push("/login");
      return;
    }

    setHotelName(storedHotelName || "Hotel");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#f5f4f1] text-[#5e0710] flex">
      <Sidebar />
      
      <main className="flex-1 pb-12 p-8 max-w-6xl mx-auto space-y-8">
        <Header hotelName={hotelName} />
        
        <div className="bg-transparent p-8 rounded-2xl border border-[#ae8d6e]/30 mb-8">
          <h1 className="text-4xl font-bold mb-2 text-[#683110]">Generador de Contenidos IA</h1>
          <p className="text-[#683110]">
            Automatiza reportes, textos de marketing y respuestas a clientes utilizando Inteligencia Artificial.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Tarjeta 1: Marketing / Amenities */}
          <div className="bg-white border border-[#ae8d6e]/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-4xl mb-4">📢</div>
            <h2 className="text-2xl font-bold text-[#683110] mb-2">Textos de Marketing</h2>
            <p className="text-[#5e0710] mb-6 min-h-[48px]">
              Genera copies persuasivos para la web y redes sociales basados en las amenities únicas de tu hotel.
            </p>
            <button 
              onClick={() => {/* TODO */}}
              className="w-full bg-transparent border-2 border-[#5e0710] text-[#5e0710] hover:bg-[#5e0710] hover:text-[#f5f4f1] px-6 py-3 rounded-xl font-bold transition-all"
            >
              Comenzar a Crear
            </button>
          </div>

          {/* Tarjeta 2: Reseñas */}
          <div className="bg-white border border-[#ae8d6e]/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-4xl mb-4">✍️</div>
            <h2 className="text-2xl font-bold text-[#683110] mb-2">Asistente de Reseñas</h2>
            <p className="text-[#5e0710] mb-6 min-h-[48px]">
              Carga tu histórico de encuestas y reseñas para redactar automáticamente borradores de respuesta empáticos.
            </p>
            <button 
              onClick={() => {/* TODO */}}
              className="w-full bg-transparent border-2 border-[#5e0710] text-[#5e0710] hover:bg-[#5e0710] hover:text-[#f5f4f1] px-6 py-3 rounded-xl font-bold transition-all"
            >
              Responder Reseñas
            </button>
          </div>

          {/* Tarjeta 3: Reportes */}
          <div className="bg-white border border-[#ae8d6e]/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-4xl mb-4">📄</div>
            <h2 className="text-2xl font-bold text-[#683110] mb-2">Reportes Automatizados</h2>
            <p className="text-[#5e0710] mb-6 min-h-[48px]">
              Genera un resumen ejecutivo en texto natural analizando el rendimiento y rentabilidad del hotel.
            </p>
            <button 
              onClick={() => {/* TODO */}}
              className="w-full bg-transparent border-2 border-[#5e0710] text-[#5e0710] hover:bg-[#5e0710] hover:text-[#f5f4f1] px-6 py-3 rounded-xl font-bold transition-all"
            >
              Generar Reporte
            </button>
          </div>

          {/* Tarjeta 4: Estrategias Avanzadas */}
          <div className="bg-white border border-[#ae8d6e]/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-4xl mb-4">🎯</div>
            <h2 className="text-2xl font-bold text-[#683110] mb-2">Planes Estratégicos</h2>
            <p className="text-[#5e0710] mb-6 min-h-[48px]">
              Profundiza en tus estrategias creadas. Planea tiempos, costes y ejecución paso a paso con métricas de la competencia.
            </p>
            <button 
              onClick={() => router.push('/manage')}
              className="w-full bg-transparent border-2 border-[#5e0710] text-[#5e0710] hover:bg-[#5e0710] hover:text-[#f5f4f1] px-6 py-3 rounded-xl font-bold transition-all"
            >
              Ir a Mis Estrategias
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}

"use client";
import { useState } from "react";

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const ejecutarIA = async () => {
    setLoading(true);
    const res = await fetch("/api/analyze", {
      method: "POST",
      body: JSON.stringify({
        datosHotel: { ocupacion: "45%", fortalezas: "Spa de lujo, admite mascotas" },
        reseñasCompetencia: ["El hotel de enfrente no acepta perros", "Wifi lento en la zona"]
      })
    });
    const result = await res.json();
    setData(result);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold text-blue-400">ORACLE AI 🏨</h1>
        <p className="text-slate-400">Marketing Predictivo para Hoteles - VIMPACTHON26</p>
      </header>

      <button 
        onClick={ejecutarIA}
        className="bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-full font-bold transition-all shadow-lg shadow-blue-500/20"
      >
        {loading ? "Analizando Mercado..." : "Generar Estrategia Maestra"}
      </button>

      {data && (
        <div className="mt-12 grid gap-6">
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
            <h2 className="text-blue-400 font-bold mb-2"> ESTRATEGIA RECOMENDADA</h2>
            <p className="text-xl">{data.estrategia}</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
            <h2 className="text-pink-400 font-bold mb-2">📸 COPY PARA REDES</h2>
            <p className="italic text-lg">"{data.anuncio}"</p>
          </div>
        </div>
      )}
    </div>
  );
}
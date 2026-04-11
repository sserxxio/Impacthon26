"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./components/Sidebar";

interface OracleResult {
  nombre: string;
  descripcion: string;
  estrategia: string;
  coste: string;
  tiempo: string;
  targeting: string;
  roi: string;
  tipo: string;
}

export default function Home() {
  const [hotelName, setHotelName] = useState<string | null>(null);
  const [hotelId, setHotelId] = useState<number | null>(null);
  const [results, setResults] = useState<OracleResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<OracleResult | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedHotelId = localStorage.getItem("hotelId");
    const storedHotelName = localStorage.getItem("hotelName");
    if (!storedHotelId) { router.push("/login"); return; }
    setHotelId(parseInt(storedHotelId));
    setHotelName(storedHotelName || "Hotel");
  }, [router]);

  const ejecutarAnalisisCompleto = async () => {
    setLoading(true);
    setResults([]);

    const prompts = [
      { t: "Corto Plazo", p: "Estrategia de Revenue Management para subir ADR inmediato." },
      { t: "Corto Plazo", p: "Estrategia de Experiencia de Cliente para mejorar reseñas." },
      { t: "Largo Plazo", p: "Plan de Transformación Digital e IA a 12 meses." },
      { t: "Largo Plazo", p: "Estrategia de Sostenibilidad y Marca Premium a 2 años." }
    ];

    try {
      for (const item of prompts) {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: item.p,
            hotelId: hotelId,
            tipo: item.t,
            datosHotel: { nombre: hotelName }
          }),
        });
        const result = await res.json();
        setResults(prev => [...prev, { ...result, tipo: item.t }]);
      }
    } catch (e) {
      console.error("Error cargando estrategias");
    } finally {
      setLoading(false);
    }
  };

  if (!hotelId) return null;

  const strategies = [
    { id: 1, tipo: "Corto Plazo", titulo: "Revenue Management", prompt: "Estrategia de Revenue Management para subir ADR inmediato." },
    { id: 2, tipo: "Corto Plazo", titulo: "Experiencia de Cliente", prompt: "Estrategia de Experiencia de Cliente para mejorar reseñas." },
    { id: 3, tipo: "Largo Plazo", titulo: "Transformación Digital", prompt: "Plan de Transformación Digital e IA a 12 meses." },
    { id: 4, tipo: "Largo Plazo", titulo: "Sostenibilidad y Marca", prompt: "Estrategia de Sostenibilidad y Marca Premium a 2 años." }
  ];

  const handleGenerateStrategy = async (strategy: typeof strategies[0]) => {
    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: strategy.prompt,
          hotelId: hotelId,
          tipo: strategy.tipo,
          datosHotel: { nombre: hotelName }
        }),
      });
      
      if (res.ok) {
        const result = await res.json();
        router.push("/stats");
      } else {
        alert("Error generando estrategia");
      }
    } catch (e) {
      console.error("Error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      <Sidebar />
      
      <main className="flex-1 p-8 flex flex-col items-center">
        <header className="w-full max-w-6xl flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-black text-blue-500 italic tracking-tighter">ORACLE AI</h1>
            <p className="text-slate-500 text-xs uppercase tracking-widest">Connected: {hotelName}</p>
          </div>
        </header>

        {/* Sección Añadir Estrategia */}
        <div className="w-full max-w-6xl">
          <div className="mb-12">
            <h2 className="text-4xl font-bold mb-2 text-slate-200">➕ Crear Nueva Estrategia</h2>
            <p className="text-slate-400">Selecciona el tipo de estrategia que deseas generar para {hotelName}</p>
          </div>

          {/* Grid de Estrategias */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {strategies.map((strategy) => (
              <div
                key={strategy.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-blue-500/50 hover:bg-slate-800/80 transition-all"
              >
                <span className={`text-[10px] font-black px-3 py-1 rounded-full mb-3 inline-block uppercase ${
                  strategy.tipo.includes("Corto") ? "bg-cyan-500/10 text-cyan-400" : "bg-purple-500/10 text-purple-400"
                }`}>
                  {strategy.tipo}
                </span>
                <h3 className="text-2xl font-bold mb-3 text-white">{strategy.titulo}</h3>
                <p className="text-slate-300 mb-6 text-sm leading-relaxed">{strategy.prompt}</p>
                <button
                  onClick={() => handleGenerateStrategy(strategy)}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 px-4 py-3 rounded-lg font-bold transition-all"
                >
                  {loading ? "Generando..." : "🚀 Generar"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
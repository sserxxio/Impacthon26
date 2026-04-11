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

        {results.length === 0 && !loading && (
          <div className="my-auto text-center">
            <h2 className="text-4xl font-bold mb-6 text-slate-200">¿Preparado para optimizar {hotelName}?</h2>
            <button
              onClick={ejecutarAnalisisCompleto}
              className="bg-blue-600 hover:bg-blue-500 px-12 py-5 rounded-2xl font-black text-xl transition-all shadow-2xl shadow-blue-500/20 active:scale-95"
            >
              ⚡ LANZAR DIAGNÓSTICO MAESTRO
            </button>
          </div>
        )}

        {loading && results.length < 4 && (
          <div className="my-auto flex flex-col items-center animate-pulse">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-blue-400 font-mono tracking-widest text-sm">GENERANDO ESTRATEGIAS: {results.length}/4</p>
          </div>
        )}

        {/* Grid de Resultados */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full max-w-6xl my-auto">
          {results.map((res, i) => (
            <button
              key={i}
              onClick={() => setSelected(res)}
              className="bg-slate-900 border border-slate-800 p-6 rounded-3xl hover:border-blue-500/50 hover:bg-slate-800/80 transition-all text-left flex flex-col justify-between h-56 shadow-xl group"
            >
              <div>
                <span className={`text-[10px] font-black px-3 py-1 rounded-full mb-3 inline-block uppercase ${res.tipo.includes("Corto") ? "bg-cyan-500/10 text-cyan-400" : "bg-purple-500/10 text-purple-400"}`}>
                  {res.tipo}
                </span>
                <h2 className="font-bold text-lg text-white group-hover:text-blue-400 leading-tight uppercase italic">{res.nombre}</h2>
              </div>
              <p className="text-sm text-slate-500 line-clamp-2">{res.descripcion}</p>
            </button>
          ))}
        </div>

        {/* Popup / Modal */}
        {selected && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-[2.5rem] p-10 shadow-2xl relative">
              <button onClick={() => setSelected(null)} className="absolute top-8 right-8 text-slate-500 hover:text-white text-2xl">✕</button>
              <span className="text-blue-500 font-mono text-xs font-bold uppercase tracking-[0.3em]">{selected.tipo}</span>
              <h2 className="text-4xl font-black mb-6 italic uppercase">{selected.nombre}</h2>

              <div className="space-y-8">
                <section>
                  <h3 className="text-slate-500 text-[10px] font-bold uppercase mb-2 tracking-widest">Hoja de Ruta</h3>
                  <p className="text-slate-200 text-lg leading-relaxed">{selected.estrategia}</p>
                </section>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700">
                    <h3 className="text-orange-400 text-[10px] font-bold uppercase mb-1">Presupuesto</h3>
                    <p className="text-xl font-bold">{selected.coste}</p>
                  </div>
                  <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700">
                    <h3 className="text-emerald-400 text-[10px] font-bold uppercase mb-1">Implementación</h3>
                    <p className="text-xl font-bold">{selected.tiempo}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-blue-600/10 p-6 rounded-2xl border border-blue-500/20">
                  <div>
                    <h3 className="text-blue-400 text-[10px] font-bold uppercase">ROI Proyectado</h3>
                    <p className="text-3xl font-black text-blue-400">{selected.roi}</p>
                  </div>
                  <div className="text-right">
                    <h3 className="text-slate-500 text-[10px] font-bold uppercase">Target</h3>
                    <p className="text-sm text-slate-300">{selected.targeting}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
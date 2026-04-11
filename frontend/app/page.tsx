"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

interface OracleResult {
  nombre: string;
  descripcion: string;
  estrategia: string;
  coste: string;
  tiempo: string;
  targeting: string;
  roi: string;
  tipo: string;
  id?: string;
}

export default function Home() {
  const [hotelName, setHotelName] = useState<string | null>(null);
  const [hotelId, setHotelId] = useState<number | null>(null);
  const [results, setResults] = useState<OracleResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<OracleResult | null>(null);
  const [promptText, setPromptText] = useState("");
  const [savedSessions, setSavedSessions] = useState<any[]>([]);
  const currentProcessId = useRef(0);
  const router = useRouter();
  const hasAutoRun = useRef(false);

  useEffect(() => {
    const storedHotelId = localStorage.getItem("hotelId");
    const storedHotelName = localStorage.getItem("hotelName");
    const storedSessions = localStorage.getItem("saved_sessions");
    
    if (!storedHotelId) { router.push("/login"); return; }
    
    const parsedId = parseInt(storedHotelId);
    setHotelId(parsedId);
    setHotelName(storedHotelName || "Hotel");

    if (storedSessions) {
      setSavedSessions(JSON.parse(storedSessions));
    }

    if (!hasAutoRun.current) {
      hasAutoRun.current = true;
      ejecutarAnalisisCompleto(parsedId, storedHotelName || "Hotel");
    }
  }, [router]);

  const ejecutarAnalisisCompleto = async (overrideHotelId?: number, overrideHotelName?: string) => {
    const pid = Date.now();
    currentProcessId.current = pid;
    setLoading(true);
    setResults([]);

    const currentHotelId = overrideHotelId || hotelId;
    const currentHotelName = overrideHotelName || hotelName;

    const prompts = [
      {
        t: "Corto Plazo",
        p: "Foco: REVENUE Y PRECIOS. Genera una táctica agresiva para maximizar el ADR mediante paquetes dinámicos y optimización de canales OTA este mes."
      },
      {
        t: "Corto Plazo",
        p: "Foco: REPUTACIÓN Y OPERACIONES. Genera una táctica de Guest Experience para disparar las reseñas positivas en Google y TripAdvisor mediante un 'efecto WOW' inmediato."
      },
      {
        t: "Largo Plazo",
        p: "Foco: TECNOLOGÍA E IA. Planifica la implementación de IA generativa para hiper-personalización del customer journey y automatización de procesos internos a 1 año."
      },
      {
        t: "Largo Plazo",
        p: "Foco: MARCA Y SOSTENIBILIDAD. Planifica un reposicionamiento estratégico hacia el mercado de lujo eco-consciente con certificaciones y cambios estructurales a 2 años."
      }
    ];

    try {
      for (const item of prompts) {
        if (currentProcessId.current !== pid) break;

        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: item.p,
            hotelId: currentHotelId,
            tipo: item.t,
            datosHotel: { nombre: currentHotelName }
          }),
        });
        const result = await res.json();

        if (currentProcessId.current !== pid) break;
        setResults(prev => [...prev, { ...result, tipo: item.t }]);

        // Retraso artificial de 4 segundos para evitar que Google Gemini bloquee
        // por ráfaga de peticiones (Rate Limit 429) en el plan gratuito.
        await new Promise(r => setTimeout(r, 4000));
      }
    } catch (e) {
      console.error("Error cargando estrategias");
    } finally {
      if (currentProcessId.current === pid) {
        setLoading(false);
      }
    }
  };

  const iniciarEstrategia = (res: OracleResult) => {
    // Generar un ID único simple basado en el timestamp
    const sessionId = Date.now().toString();
    res.id = sessionId; 
    
    // Guardar los datos de esta estrategia concreta
    localStorage.setItem(`strategy_${sessionId}`, JSON.stringify(res));
    
    // Añadir al índice de "Sesiones Guardadas"
    const saved = JSON.parse(localStorage.getItem('saved_sessions') || '[]');
    const newSession = { 
      id: sessionId, 
      nombre: res.nombre, 
      tipo: res.tipo,
      fecha: new Date().toLocaleDateString()
    };
    saved.push(newSession);
    localStorage.setItem('saved_sessions', JSON.stringify(saved));
    setSavedSessions(saved);

    router.push(`/strategy/${sessionId}`);
  };

  const ejecutarConsultaCustom = async () => {
    if (!promptText.trim()) return;

    const pid = Date.now();
    currentProcessId.current = pid; // Detiene cualquier bucle de 4-cajas en curso
    setLoading(true);
    setResults([]); // Borrar cajas anteriores

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptText,
          hotelId: hotelId,
          tipo: "Estrategia Custom",
          datosHotel: { nombre: hotelName }
        }),
      });
      const result = await res.json();

      if (currentProcessId.current === pid) {
        setResults([{ ...result, tipo: "Estrategia Custom" }]);
      }
    } catch (e) {
      console.error("Error en consulta custom");
    } finally {
      if (currentProcessId.current === pid) {
        setLoading(false);
        setPromptText("");
      }
    }
  };

  if (!hotelId) return null;

  return (
    <div className="min-h-screen bg-slate-900 text-white flex">
      <Sidebar />
      
      <main className="flex-1 pb-32 flex flex-col relative">
        <Header hotelName={hotelName} />

      {results.length === 0 && !loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center animate-pulse">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-blue-400 font-mono tracking-widest text-sm">INICIALIZANDO SISTEMA ORACLE...</p>
          </div>
        </div>
      )}

      {loading && results.length < 4 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center animate-pulse">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-blue-400 font-mono tracking-widest text-sm">GENERANDO ESTRATEGIAS: {results.length}/4</p>
          </div>
        </div>
      )}

      {/* Grid de Resultados */}
      {results.length > 0 && (
        <div className="flex-1 flex flex-col items-center justify-center w-full gap-6">
          {!loading && (
            <div className="w-full max-w-6xl text-center animate-pulse">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-300 italic opacity-90 drop-shadow-lg">
                Aquí tienes una selección de estrategias para ti
              </h2>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full max-w-6xl">
        {results.map((res, i) => (
          <div
            key={i}
            onClick={() => setSelected(res)}
            className="cursor-pointer bg-slate-900 border border-slate-800 p-6 rounded-3xl hover:border-blue-500/50 hover:bg-slate-800/80 transition-all text-left flex flex-col justify-between shadow-xl group relative h-64"
          >
            <div>
              <span className={`text-[10px] font-black px-3 py-1 rounded-full mb-3 inline-block uppercase ${res.tipo.includes("Corto") || res.tipo.includes("Custom") ? "bg-cyan-500/10 text-cyan-400" : "bg-purple-500/10 text-purple-400"}`}>
                {res.tipo}
              </span>
              <h2 className="font-bold text-lg text-white group-hover:text-blue-400 leading-tight uppercase italic mb-2">{res.nombre}</h2>
              <p className="text-sm text-slate-500 line-clamp-2">{res.descripcion}</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); iniciarEstrategia(res); }}
              className="mt-4 w-full bg-slate-800 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-colors text-sm uppercase tracking-wide border border-slate-700 hover:border-emerald-500"
            >
              🚀 Comenzar
            </button>
          </div>
        ))}
        </div>
        </div>
      )}

      {/* Zona de Sesiones Guardadas */}
      {savedSessions.length > 0 && (
        <div className="w-full max-w-6xl my-12 animate-fade-in">
          <h2 className="text-2xl font-black text-slate-400 italic mb-6 uppercase tracking-widest text-center">Tus Estrategias en Curso</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {savedSessions.map((session, i) => (
              <div 
                key={i}
                onClick={() => router.push(`/strategy/${session.id}`)}
                className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700 p-5 rounded-2xl cursor-pointer transition-all hover:border-blue-500/50 shadow-lg flex flex-col gap-3 group"
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black px-3 py-1 bg-slate-900 text-slate-300 rounded-lg">{session.tipo || 'Estrategia'}</span>
                  <span className="text-xs text-slate-500 font-mono">{session.fecha}</span>
                </div>
                <h3 className="font-bold text-md text-white truncate group-hover:text-blue-400 transition-colors uppercase italic">{session.nombre}</h3>
                <span className="text-blue-500 text-xs font-bold tracking-widest mt-1 group-hover:translate-x-1 transition-transform">⮑ Continuar Ejecución</span>
              </div>
            ))}
          </div>
        </div>
      )}

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

              <button
                onClick={() => iniciarEstrategia(selected)}
                className="w-full mt-6 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-emerald-500/20 uppercase tracking-widest text-lg"
              >
                🚀 Comenzar Estrategia
              </button>
            </div>
          </div>
        </div>
      )}

      </main>

      {/* Fixed Prompt Box */}
      <div className="fixed bottom-0 left-0 w-full bg-slate-950/80 backdrop-blur-lg border-t border-slate-800 p-4 z-50">
        <div className="max-w-4xl mx-auto flex gap-4 items-center">
          <input
            type="text"
            placeholder="Pide una estrategia personalizada para tu hotel... (ej. 'Evento corporativo en invierno')"
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") ejecutarConsultaCustom();
            }}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-full px-6 py-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
          <button
            onClick={ejecutarConsultaCustom}
            disabled={!promptText.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed w-14 h-14 rounded-full flex shrink-0 items-center justify-center font-bold transition-all shadow-lg shadow-blue-500/20"
            title="Enviar petición rápida"
          >
            ⚡
          </button>
        </div>
      </div>
    </div>
  );
}
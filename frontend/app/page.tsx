"use client";
import { useState } from "react";

interface OracleResult {
  estrategia: string;
  anuncio: string;
  targeting: string;
  roi: string;
}

const MODULOS = [
  { id: "shadow_competitor", label: "🕵️ Shadow Competitor", desc: "Detecta oportunidades frente a la competencia" },
  { id: "simulador",         label: "🔮 Simulador de Realidades", desc: "Proyecta el ROI de tus decisiones" },
  { id: "autopilot",         label: "🚀 Creative Autopilot", desc: "Genera campañas listas para lanzar" },
];

export default function Home() {
  const [data, setData] = useState<OracleResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [moduloActivo, setModuloActivo] = useState("shadow_competitor");

  const ejecutarIA = async () => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modulo: moduloActivo }),
      });
      if (!res.ok) throw new Error("Error en la API");
      const result = await res.json();
      if (result.error) throw new Error(result.error);
      setData(result);
    } catch (e) {
      setError("No se pudo conectar con ORACLE. Revisa tu API key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold text-blue-400">ORACLE AI 🏨</h1>
        <p className="text-slate-400">Motor de Decisiones de Marketing — IMPACTHON26</p>
      </header>

      {/* Selector de módulos */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {MODULOS.map((m) => (
          <button
            key={m.id}
            onClick={() => setModuloActivo(m.id)}
            className={`p-4 rounded-2xl border text-left transition-all ${
              moduloActivo === m.id
                ? "border-blue-500 bg-blue-500/20 text-white"
                : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500"
            }`}
          >
            <div className="font-bold">{m.label}</div>
            <div className="text-sm mt-1 opacity-70">{m.desc}</div>
          </button>
        ))}
      </div>

      {/* Botón ejecutar */}
      <button
        onClick={ejecutarIA}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed px-8 py-4 rounded-full font-bold transition-all shadow-lg shadow-blue-500/20"
      >
        {loading ? "⏳ Analizando datos reales..." : "⚡ Ejecutar ORACLE"}
      </button>

      {error && (
        <div className="mt-6 bg-red-900/40 border border-red-500 p-4 rounded-xl text-red-300">
          ⚠️ {error}
        </div>
      )}

      {/* Resultados */}
      {data && (
        <div className="mt-10 grid gap-6">
          <div className="bg-slate-800 p-6 rounded-2xl border border-blue-500/50">
            <h2 className="text-blue-400 font-bold mb-2">🎯 ESTRATEGIA RECOMENDADA</h2>
            <p className="text-lg">{data.estrategia}</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-2xl border border-pink-500/50">
            <h2 className="text-pink-400 font-bold mb-2">📸 COPY PARA REDES</h2>
            <p className="italic text-lg">"{data.anuncio}"</p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-slate-800 p-6 rounded-2xl border border-green-500/50">
              <h2 className="text-green-400 font-bold mb-2">🎯 TARGETING</h2>
              <p>{data.targeting}</p>
            </div>
            <div className="bg-slate-800 p-6 rounded-2xl border border-yellow-500/50">
              <h2 className="text-yellow-400 font-bold mb-2">📈 ROI PROYECTADO</h2>
              <p>{data.roi}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
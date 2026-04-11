"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import {
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Competitor {
  id: number;
  hotelName: string;
  country: string;
  stars: number;
  cityName: string;
  cityPrice: string;
  avgOcupacion: number;
  avgAdr: number;
  avgPuntuacion: number;
  amenitiesCount: number;
  totalAmenities: number;
}

interface CompetitionAnalysis {
  competitors: Competitor[];
  yourHotel: Competitor;
  analysis: string;
  advantages: string[];
  weaknesses: string[];
  recommendations: string[];
}

export default function CompetitionPage() {
  const router = useRouter();
  const [hotelId, setHotelId] = useState<number | null>(null);
  const [hotelName, setHotelName] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<CompetitionAnalysis | null>(null);
  const [error, setError] = useState("");

  // Filtros
  const [filterType, setFilterType] = useState<"city-stars" | "city-price">("city-stars");
  const [yourStars, setYourStars] = useState(3);
  const [yourCityPrice, setYourCityPrice] = useState("MEDIUM");

  useEffect(() => {
    const storedHotelId = localStorage.getItem("hotelId");
    const storedHotelName = localStorage.getItem("hotelName");

    if (!storedHotelId) {
      router.push("/login");
      return;
    }

    setHotelId(parseInt(storedHotelId));
    setHotelName(storedHotelName || "Hotel");
  }, [router]);

  const handleAnalyze = async () => {
    if (!hotelId) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/competition/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotelId,
          filterType,
          stars: filterType === "city-stars" ? yourStars : undefined,
          cityPrice: filterType === "city-price" ? yourCityPrice : undefined,
        }),
      });

      if (!res.ok) {
        throw new Error("Error al analizar competencia");
      }

      const data = await res.json();
      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  // Datos para gráfico comparativo
  const comparisonData = analysis
    ? [
        {
          name: "Ocupación",
          "Tu Hotel": Math.round(analysis.yourHotel.avgOcupacion),
          "Competidor 1": Math.round(analysis.competitors[0]?.avgOcupacion || 0),
          "Competidor 2": Math.round(analysis.competitors[1]?.avgOcupacion || 0),
        },
        {
          name: "ADR (€)",
          "Tu Hotel": Math.round(analysis.yourHotel.avgAdr),
          "Competidor 1": Math.round(analysis.competitors[0]?.avgAdr || 0),
          "Competidor 2": Math.round(analysis.competitors[1]?.avgAdr || 0),
        },
        {
          name: "Puntuación",
          "Tu Hotel": analysis.yourHotel.avgPuntuacion * 20, // Escalar a 100
          "Competidor 1": (analysis.competitors[0]?.avgPuntuacion || 0) * 20,
          "Competidor 2": (analysis.competitors[1]?.avgPuntuacion || 0) * 20,
        },
        {
          name: "Amenities",
          "Tu Hotel": analysis.yourHotel.amenitiesCount,
          "Competidor 1": analysis.competitors[0]?.amenitiesCount || 0,
          "Competidor 2": analysis.competitors[1]?.amenitiesCount || 0,
        },
      ]
    : [];

  if (!hotelId) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header hotelName={hotelName} />

      <main className="p-8 max-w-6xl mx-auto space-y-8">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 rounded-2xl border border-purple-500/30">
          <h1 className="text-4xl font-bold mb-2">🏆 Análisis de Competencia</h1>
          <p className="text-purple-100">
            Descubre cómo te comparas con los top 2 competidores según tus criterios
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl">
          <h2 className="text-xl font-bold text-purple-400 mb-6">🔍 Selecciona Criterios de Búsqueda</h2>

          <div className="space-y-6">
            {/* Tipo de filtro */}
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-3 uppercase tracking-wide">
                Tipo de Comparación
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => setFilterType("city-stars")}
                  className={`flex-1 p-4 rounded-xl font-bold transition ${
                    filterType === "city-stars"
                      ? "bg-purple-600 text-white border-purple-400"
                      : "bg-slate-700 text-slate-300 border-slate-600"
                  } border`}
                >
                  🌟 Misma ciudad + Estrellas similares
                </button>
                <button
                  onClick={() => setFilterType("city-price")}
                  className={`flex-1 p-4 rounded-xl font-bold transition ${
                    filterType === "city-price"
                      ? "bg-purple-600 text-white border-purple-400"
                      : "bg-slate-700 text-slate-300 border-slate-600"
                  } border`}
                >
                  💰 Misma ciudad + Rango de precio
                </button>
              </div>
            </div>

            {/* Filtro específico */}
            {filterType === "city-stars" ? (
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-3 uppercase tracking-wide">
                  Estrellas de tu hotel
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setYourStars(star)}
                      className={`flex-1 p-3 rounded-lg font-bold transition ${
                        yourStars === star
                          ? "bg-yellow-500 text-slate-900"
                          : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                      }`}
                    >
                      {"⭐".repeat(star)}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Se buscarán hoteles en tu ciudad con {yourStars}⭐ ± 1
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-3 uppercase tracking-wide">
                  Rango de precio
                </label>
                <div className="flex gap-4">
                  {["LOW", "MEDIUM", "HIGH"].map((price) => (
                    <button
                      key={price}
                      onClick={() => setYourCityPrice(price)}
                      className={`flex-1 p-4 rounded-xl font-bold transition ${
                        yourCityPrice === price
                          ? "bg-purple-600 text-white border-purple-400"
                          : "bg-slate-700 text-slate-300 border-slate-600"
                      } border`}
                    >
                      {price === "LOW"
                        ? "💵 Económico"
                        : price === "MEDIUM"
                          ? "💵💵 Moderado"
                          : "💵💵💵 Premium"}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Se buscarán hoteles en tu ciudad con rango {yourCityPrice}
                </p>
              </div>
            )}

            {/* Botón análisis */}
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 px-8 py-4 rounded-xl font-bold transition shadow-lg shadow-purple-500/30"
            >
              {loading ? "Analizando..." : "🔍 Analizar Competencia"}
            </button>
          </div>
        </div>

        {/* Resultados */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-xl">
            ⚠️ {error}
          </div>
        )}

        {analysis && (
          <div className="space-y-8">
            {/* Resumen competidores */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-900 to-blue-800 border border-blue-500/50 p-6 rounded-2xl">
                <h3 className="text-blue-400 font-bold text-sm uppercase mb-3">Tu Hotel</h3>
                <h2 className="text-2xl font-bold mb-4">{analysis.yourHotel.hotelName}</h2>
                <div className="space-y-2 text-sm text-blue-100">
                  <p>⭐ {analysis.yourHotel.stars} estrellas</p>
                  <p>🏙️ {analysis.yourHotel.cityName}</p>
                  <p>📊 Ocupación: {Math.round(analysis.yourHotel.avgOcupacion)}%</p>
                  <p>💰 ADR: €{Math.round(analysis.yourHotel.avgAdr)}</p>
                  <p>⭐ Puntuación: {analysis.yourHotel.avgPuntuacion.toFixed(1)}/5.0</p>
                </div>
              </div>

              {analysis.competitors.map((comp, idx) => (
                <div
                  key={comp.id}
                  className="bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600 p-6 rounded-2xl hover:border-orange-500/50 transition"
                >
                  <h3 className="text-orange-400 font-bold text-sm uppercase mb-3">
                    Competidor {idx + 1}
                  </h3>
                  <h2 className="text-2xl font-bold mb-4">{comp.hotelName}</h2>
                  <div className="space-y-2 text-sm text-slate-300">
                    <p>⭐ {comp.stars} estrellas</p>
                    <p>🏙️ {comp.cityName}</p>
                    <p>📊 Ocupación: {Math.round(comp.avgOcupacion)}%</p>
                    <p>💰 ADR: €{Math.round(comp.avgAdr)}</p>
                    <p>⭐ Puntuación: {comp.avgPuntuacion.toFixed(1)}/5.0</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Gráfico comparativo */}
            <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl">
              <h3 className="text-xl font-bold text-cyan-400 mb-6">📊 Comparativa de Métricas</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="Tu Hotel" fill="#3b82f6" />
                  <Bar dataKey="Competidor 1" fill="#f97316" />
                  <Bar dataKey="Competidor 2" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Análisis IA */}
            <div className="space-y-6">
              <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl">
                <h3 className="text-xl font-bold text-purple-400 mb-4">🤖 Análisis con IA</h3>
                <p className="text-slate-300 leading-relaxed">{analysis.analysis}</p>
              </div>

              {/* Ventajas */}
              {analysis.advantages.length > 0 && (
                <div className="bg-emerald-500/10 border border-emerald-500/50 p-6 rounded-2xl">
                  <h3 className="text-emerald-400 font-bold mb-4">💪 Ventajas Competitivas</h3>
                  <ul className="space-y-2">
                    {analysis.advantages.map((adv, i) => (
                      <li key={i} className="text-emerald-100 flex items-start gap-2">
                        <span className="text-emerald-400 mt-1">✓</span>
                        {adv}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Debilidades */}
              {analysis.weaknesses.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-2xl">
                  <h3 className="text-red-400 font-bold mb-4">⚠️ Áreas de Mejora</h3>
                  <ul className="space-y-2">
                    {analysis.weaknesses.map((weak, i) => (
                      <li key={i} className="text-red-100 flex items-start gap-2">
                        <span className="text-red-400 mt-1">×</span>
                        {weak}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recomendaciones */}
              {analysis.recommendations.length > 0 && (
                <div className="bg-cyan-500/10 border border-cyan-500/50 p-6 rounded-2xl">
                  <h3 className="text-cyan-400 font-bold mb-4">💡 Recomendaciones Estratégicas</h3>
                  <ul className="space-y-2">
                    {analysis.recommendations.map((rec, i) => (
                      <li key={i} className="text-cyan-100 flex items-start gap-2">
                        <span className="text-cyan-400 mt-1">→</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
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
    <div className="min-h-screen bg-[#f5f4f1] text-[#5e0710] flex h-screen overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        <Header hotelName={hotelName} pageTitle="Análisis de Competidores" />
        <main className="flex-1 overflow-y-auto pb-12 p-8 space-y-8">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="bg-transparent p-8 rounded-2xl border border-[#ae8d6e]/30">
              <h1 className="text-4xl font-bold mb-2 text-[#683110]">Análisis de Competencia</h1>
              <p className="text-[#683110]">
                Descubre cómo te comparas con los top 2 competidores según tus criterios
              </p>
            </div>

        {/* Filtros */}
        <div className="bg-transparent border border-[#ae8d6e]/30 p-6 rounded-2xl">
          <h2 className="text-xl font-bold text-[#683110] mb-6"> Selecciona Criterios de Búsqueda</h2>

          <div className="space-y-6">
            {/* Tipo de filtro */}
            <div>
              <label className="block text-sm font-bold text-[#5e0710] mb-3 uppercase tracking-wide">
                Tipo de Comparación
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => setFilterType("city-stars")}
                  className={`flex-1 p-4 rounded-xl font-bold transition ${filterType === "city-stars"
                    ? "bg-[#ae8d6e] text-white border-[#ae8d6e]"
                    : "bg-[#f5f4f1] text-[#5e0710] border-[#ae8d6e]/40"
                    } border`}
                >
                  Misma ciudad + Estrellas similares
                </button>
                <button
                  onClick={() => setFilterType("city-price")}
                  className={`flex-1 p-4 rounded-xl font-bold transition ${filterType === "city-price"
                    ? "bg-[#ae8d6e] text-white border-[#ae8d6e]"
                    : "bg-[#f5f4f1] text-[#5e0710] border-[#ae8d6e]/40"
                    } border`}
                >
                  Misma ciudad + Rango de precio
                </button>
              </div>
            </div>

            {/* Filtro específico */}
            {filterType === "city-stars" ? (
              <div>
                <label className="block text-sm font-bold text-[#5e0710] mb-3 uppercase tracking-wide">
                  Estrellas de tu hotel
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setYourStars(star)}
                      className={`flex-1 p-3 rounded-lg font-bold transition border ${yourStars === star
                        ? "bg-[#ae8d6e] text-[#5e0710] border-[#ae8d6e]"
                        : "bg-[#f5f4f1] text-[#5e0710] border-[#ae8d6e]/40 hover:border-[#ae8d6e]"
                        }`}
                    >
                      {"⭐".repeat(star)}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-[#ae8d6e] mt-2">
                  Se buscarán hoteles en tu ciudad con {yourStars}⭐ ± 1
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-bold text-[#5e0710] mb-3 uppercase tracking-wide">
                  Rango de precio
                </label>
                <div className="flex gap-4">
                  {["LOW", "MEDIUM", "HIGH"].map((price) => (
                    <button
                      key={price}
                      onClick={() => setYourCityPrice(price)}
                      className={`flex-1 p-4 rounded-xl font-bold transition ${yourCityPrice === price
                        ? "bg-[#ae8d6e] text-white border-[#ae8d6e]"
                        : "bg-[#f5f4f1] text-[#5e0710] border-[#ae8d6e]/40"
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
                <p className="text-xs text-[#ae8d6e] mt-2">
                  Se buscarán hoteles en tu ciudad con rango {yourCityPrice}
                </p>
              </div>
            )}

            {/* Botón análisis */}
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full bg-transparent border-2 border-[#5e0710] text-[#5e0710] hover:bg-[#683110] hover:text-[#f5f4f1] disabled:opacity-50 px-8 py-4 rounded-xl font-bold transition shadow-sm hover:shadow-lg hover:shadow-[#5e0710]/30"
            >
              {loading ? "Analizando..." : " Analizar Competencia"}
            </button>
          </div>
        </div>

        {/* Resultados */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-900 p-4 rounded-xl shadow-md">
            ⚠️ {error}
          </div>
        )}

        {analysis && (
          <div className="space-y-8">
            {/* Resumen competidores */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-[#ae8d6e]/30 p-6 rounded-2xl shadow-md">
                <h3 className="text-[#683110] font-bold text-sm uppercase mb-3">Tu Hotel</h3>
                <h2 className="text-2xl font-bold mb-4 text-[#5e0710]">{analysis.yourHotel.hotelName}</h2>
                <div className="space-y-2 text-sm text-[#5e0710]">
                  <p>⭐ {analysis.yourHotel.stars} estrellas</p>
                  <p>🏙️ {analysis.yourHotel.cityName}</p>
                  <p>📊 Ocupación: <span className="text-[#ae8d6e] font-bold">{Math.round(analysis.yourHotel.avgOcupacion)}%</span></p>
                  <p>💰 ADR: <span className="text-[#ae8d6e] font-bold">€{Math.round(analysis.yourHotel.avgAdr)}</span></p>
                  <p>⭐ Puntuación: <span className="text-[#ae8d6e] font-bold">{analysis.yourHotel.avgPuntuacion.toFixed(1)}/5.0</span></p>
                </div>
              </div>

              {analysis.competitors.map((comp, idx) => (
                <div
                  key={comp.id}
                  className="bg-white border border-[#ae8d6e]/30 p-6 rounded-2xl hover:shadow-lg hover:border-[#ae8d6e] transition shadow-md"
                >
                  <h3 className="text-[#683110] font-bold text-sm uppercase mb-3">
                    Competidor {idx + 1}
                  </h3>
                  <h2 className="text-2xl font-bold mb-4 text-[#5e0710]">{comp.hotelName}</h2>
                  <div className="space-y-2 text-sm text-[#5e0710]">
                    <p>⭐ {comp.stars} estrellas</p>
                    <p>🏙️ {comp.cityName}</p>
                    <p>📊 Ocupación: <span className="text-[#ae8d6e] font-bold">{Math.round(comp.avgOcupacion)}%</span></p>
                    <p>💰 ADR: <span className="text-[#ae8d6e] font-bold">€{Math.round(comp.avgAdr)}</span></p>
                    <p>⭐ Puntuación: <span className="text-[#ae8d6e] font-bold">{comp.avgPuntuacion.toFixed(1)}/5.0</span></p>
                  </div>
                </div>
              ))}
            </div>

            {/* Gráfico comparativo */}
            <div className="bg-white border border-[#ae8d6e]/30 p-6 rounded-2xl shadow-md">
              <h3 className="text-xl font-bold text-[#683110] mb-6">📊 Comparativa de Métricas</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #d1d5db",
                      color: "#111827"
                    }}
                  />
                  <Legend wrapperStyle={{ color: "#374151" }} />
                  <Bar dataKey="Tu Hotel" fill="#683110" />
                  <Bar dataKey="Competidor 1" fill="#f59e0b" />
                  <Bar dataKey="Competidor 2" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Análisis IA */}
            <div className="space-y-6">
              <div className="bg-transparent border border-[#ae8d6e]/30 p-6 rounded-2xl">
                <h3 className="text-xl font-bold text-[#683110] mb-4">🤖 Análisis con IA</h3>
                <p className="text-[#5e0710] leading-relaxed">{analysis.analysis}</p>
              </div>

              {/* Ventajas */}
              {analysis.advantages.length > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl shadow-md">
                  <h3 className="text-[#683110] font-bold mb-4 text-lg">💪 Ventajas Competitivas</h3>
                  <ul className="space-y-2">
                    {analysis.advantages.map((adv, i) => (
                      <li key={i} className="text-[#683110] flex items-start gap-2">
                        <span className="text-[#683110] mt-1 font-bold">✓</span>
                        {adv}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Debilidades */}
              {analysis.weaknesses.length > 0 && (
                <div className="bg-red-50 border border-red-200 p-6 rounded-2xl shadow-md">
                  <h3 className="text-red-900 font-bold mb-4 text-lg">⚠️ Áreas de Mejora</h3>
                  <ul className="space-y-2">
                    {analysis.weaknesses.map((weak, i) => (
                      <li key={i} className="text-red-900 flex items-start gap-2">
                        <span className="text-[#c50000] mt-1 font-bold">×</span>
                        {weak}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recomendaciones */}
              {analysis.recommendations.length > 0 && (
                <div className="bg-[#f5f4f1] border border-[#ae8d6e] p-6 rounded-2xl shadow-md">
                  <h3 className="text-[#683110] font-bold mb-4 text-lg">💡 Recomendaciones Estratégicas</h3>
                  <ul className="space-y-2">
                    {analysis.recommendations.map((rec, i) => (
                      <li key={i} className="text-[#683110] flex items-start gap-2">
                        <span className="text-[#683110] mt-1 font-bold">→</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
          </div>
        </main>
      </div>
    </div>
  );
}

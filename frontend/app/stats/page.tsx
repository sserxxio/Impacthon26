"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface Statistics {
  id: number;
  hotelId: number;
  month: number;
  year: number;
  ingresos: number;
  costes: number;
  marketingGasto: number;
  utilidad: number;
  roi: number;
  ocupacion: number;
  adr: number;
  reservas: number;
  huespedes: number;
  puntuacion: number;
  resenas: number;
  monthName?: string;
}

interface Summary {
  avgIngresos: number;
  avgOcupacion: number;
  avgRoi: number;
  totalUtilidad: number;
  bestMonth: Statistics;
}

interface Analysis {
  tendencia_general?: string;
  fortalezas?: string[];
  debilidades?: string[];
  oportunidades?: string[];
  amenazas?: string[];
  recomendaciones_clave?: Array<{
    titulo: string;
    descripcion: string;
    impacto_estimado: string;
  }>;
  proyeccion_siguiente_trimestre?: string;
  raw?: string;
}

const monthNames = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export default function StatsPage() {
  const [hotelName, setHotelName] = useState<string | null>(null);
  const [hotelId, setHotelId] = useState<number | null>(null);
  const [statsData, setStatsData] = useState<Statistics[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingAnalysis, setGeneratingAnalysis] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appliedStrategies, setAppliedStrategies] = useState<any[]>([]);
  const [completedStrategies, setCompletedStrategies] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const storedHotelId = localStorage.getItem("hotelId");
    const storedHotelName = localStorage.getItem("hotelName");

    if (!storedHotelId) {
      router.push("/login");
      return;
    }

    const parsedId = parseInt(storedHotelId);
    setHotelId(parsedId);
    setHotelName(storedHotelName || "Hotel");

    loadStatistics(parsedId);
  }, [router]);

  const loadStatistics = async (id: number) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/statistics?hotelId=${id}&months=13`);

      if (!res.ok) {
        // Si es 404, significa que el hotel no existe - redirigir al login
        if (res.status === 404) {
          localStorage.removeItem("hotelId");
          localStorage.removeItem("hotelName");
          router.push("/login");
          return;
        }
        throw new Error("Error cargando estadísticas");
      }

      const data = await res.json();

      // Mapear meses y estrategias aplicadas
      const saved = JSON.parse(localStorage.getItem('saved_sessions') || '[]');
      
      const statsConEstrategias = (data.stats || []).map((st: Statistics) => {
        const monthName = `${monthNames[st.month - 1]} ${st.year}`;
        
        // Buscar todos los inicios
        const starts = saved.filter((s: any) => {
          const [d, m, y] = s.fecha.split('/');
          return parseInt(m) === st.month && parseInt(y) === st.year;
        });

        // Buscar todos los fines
        const ends = saved.filter((s: any) => {
          if (!s.fechaFin) return false;
          const [d, m, y] = s.fechaFin.split('/');
          return parseInt(m) === st.month && parseInt(y) === st.year;
        });
        
        return {
          ...st,
          monthName,
          appliedStrategiesArr: starts.map(s => s.nombre),
          completedStrategiesArr: ends.map(s => s.nombre)
        };
      });

      setStatsData(statsConEstrategias);
      setSummary(data.summary);

      // Guardar puntos agrupados para las líneas de referencia
      const startPoints = statsConEstrategias
        .filter(st => st.appliedStrategiesArr.length > 0)
        .map(st => ({
          nombre: st.appliedStrategiesArr.join(" + "),
          monthName: st.monthName
        }));

      const endPoints = statsConEstrategias
        .filter(st => st.completedStrategiesArr.length > 0)
        .map(st => ({
          nombre: st.completedStrategiesArr.join(" + "),
          monthName: st.monthName
        }));

      setAppliedStrategies(startPoints);
      setCompletedStrategies(endPoints);

      await generateAnalysis(id);
    } catch (err) {
      setError("Error al cargar estadísticas");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateAnalysis = async (id: number) => {
    setGeneratingAnalysis(true);
    try {
      const res = await fetch("/api/statistics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hotelId: id }),
      });

      if (!res.ok) throw new Error("Error generando análisis");

      const data = await res.json();
      setAnalysis(data.analysis || {});
    } catch (err) {
      console.error("Error en análisis:", err);
    } finally {
      setGeneratingAnalysis(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex">
      <Sidebar />
      <main className="flex-1 pb-12">
        <Header hotelName={hotelName} />

        {loading ? (
          <div className="flex-1 flex items-center justify-center p-20">
            <div className="text-center">
              <div className="animate-spin h-12 w-12 border-4 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-xl">Cargando estadísticas...</p>
            </div>
          </div>
        ) : !hotelId || !summary ? (
          <div className="p-8 text-center text-slate-500">
            No se han podido cargar los datos del hotel.
          </div>
        ) : (
          <div className="flex flex-col">
            {error && (
              <div className="mx-8 bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-xl mb-6">
                ⚠️ {error}
              </div>
            )}


            {/* KPI Cards */}
            <div className="mx-8 grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl">
                <p className="text-slate-400 text-sm uppercase tracking-wide mb-2">
                  Ingresos Promedio
                </p>
                <p className="text-3xl font-bold text-blue-400">
                  €{summary.avgIngresos.toLocaleString("es-ES")}
                </p>
              </div>

              <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl">
                <p className="text-slate-400 text-sm uppercase tracking-wide mb-2">
                  Ocupación Promedio
                </p>
                <p className="text-3xl font-bold text-green-400">
                  {summary.avgOcupacion}%
                </p>
              </div>

              <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl">
                <p className="text-slate-400 text-sm uppercase tracking-wide mb-2">
                  ROI Promedio
                </p>
                <p className="text-3xl font-bold text-purple-400">
                  {summary.avgRoi}%
                </p>
              </div>

              <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl">
                <p className="text-slate-400 text-sm uppercase tracking-wide mb-2">
                  Utilidad Total
                </p>
                <p className="text-3xl font-bold text-emerald-400">
                  €{summary.totalUtilidad.toLocaleString("es-ES")}
                </p>
              </div>
            </div>

            {/* Gráficos */}
            <div className="mx-8 space-y-8 mb-8">
              {/* Gráfico de Ingresos vs Costes */}
              <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl">
                <h3 className="text-xl font-bold text-blue-400 mb-6">
                  💰 Ingresos vs Costes Operacionales
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={statsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis 
                      dataKey="monthName" 
                      stroke="#94a3b8" 
                      interval={0} 
                      angle={-45} 
                      textAnchor="end" 
                      height={70} 
                    />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const sStarts = payload[0].payload.appliedStrategiesArr || [];
                          const sEnds = payload[0].payload.completedStrategiesArr || [];
                          return (
                            <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl shadow-2xl backdrop-blur-md">
                              <p className="text-slate-400 font-bold mb-2">{label}</p>
                              {payload.map((entry: any, index: number) => (
                                <p key={index} style={{ color: entry.color }} className="text-sm flex justify-between gap-4">
                                  <span>{entry.name}:</span>
                                  <span className="font-mono">
                                    {entry.value.toLocaleString()}
                                    {entry.name.includes('%') ? '%' : ''}
                                    {entry.name.includes('€') ? '€' : ''}
                                  </span>
                                </p>
                              ))}
                              {sStarts.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-slate-700">
                                  {sStarts.map((s: string, i: number) => (
                                    <p key={i} className="text-cyan-400 font-bold text-sm flex items-center gap-2">
                                      <span>🚀</span> {s}
                                    </p>
                                  ))}
                                </div>
                              )}
                              {sEnds.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-slate-700">
                                  {sEnds.map((s: string, i: number) => (
                                    <p key={i} className="text-lime-400 font-bold text-sm flex items-center gap-2">
                                      <span>✅</span> {s} (Finalizada)
                                    </p>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                    <Bar dataKey="ingresos" fill="#3b82f6" name="Ingresos (€)" />
                    <Bar dataKey="costes" fill="#ef4444" name="Costes (€)" />
                    {appliedStrategies.map((s, idx) => (
                      <ReferenceLine 
                        key={`start-rev-${idx}`}
                        x={s.monthName} 
                        stroke="#22d3ee" 
                        strokeDasharray="4 4" 
                        strokeWidth={3}
                        isFront={true}
                        label={{ value: "🚀 " + s.nombre, position: 'top', fill: '#22d3ee', fontSize: 11, fontWeight: 'bold' }}
                      />
                    ))}
                    {completedStrategies.map((s, idx) => (
                      <ReferenceLine 
                        key={`end-rev-${idx}`}
                        x={s.monthName} 
                        stroke="#a3e635" 
                        strokeDasharray="4 4" 
                        strokeWidth={3}
                        isFront={true}
                        label={{ value: "✅ " + s.nombre, position: 'top', fill: '#a3e635', fontSize: 11, fontWeight: 'bold' }}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Gráfico de Ocupación */}
              <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl">
                <h3 className="text-xl font-bold text-green-400 mb-6">
                  🏨 Ocupación vs ADR
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={statsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis 
                      dataKey="monthName" 
                      stroke="#94a3b8" 
                      interval={0} 
                      angle={-45} 
                      textAnchor="end" 
                      height={70} 
                    />
                    <YAxis yAxisId="left" stroke="#94a3b8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const sStarts = payload[0].payload.appliedStrategiesArr || [];
                          const sEnds = payload[0].payload.completedStrategiesArr || [];
                          return (
                            <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl shadow-2xl backdrop-blur-md">
                              <p className="text-slate-400 font-bold mb-2">{label}</p>
                              {payload.map((entry: any, index: number) => (
                                <p key={index} style={{ color: entry.color }} className="text-sm flex justify-between gap-4">
                                  <span>{entry.name}:</span>
                                  <span className="font-mono">
                                    {entry.value.toLocaleString()}
                                    {entry.name.includes('%') ? '%' : ''}
                                    {entry.name.includes('€') ? '€' : ''}
                                  </span>
                                </p>
                              ))}
                              {sStarts.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-slate-700">
                                  {sStarts.map((s: string, i: number) => (
                                    <p key={i} className="text-cyan-400 font-bold text-sm flex items-center gap-2">
                                      <span>🚀</span> {s}
                                    </p>
                                  ))}
                                </div>
                              )}
                              {sEnds.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-slate-700">
                                  {sEnds.map((s: string, i: number) => (
                                    <p key={i} className="text-lime-400 font-bold text-sm flex items-center gap-2">
                                      <span>✅</span> {s} (Finalizada)
                                    </p>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="ocupacion"
                      fill="#10b981"
                      stroke="#10b981"
                      name="Ocupación (%)"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="adr"
                      stroke="#f59e0b"
                      name="ADR (€)"
                    />
                    {appliedStrategies.map((s, idx) => (
                      <ReferenceLine 
                        key={`start-occ-${idx}`}
                        x={s.monthName} 
                        stroke="#22d3ee" 
                        strokeDasharray="4 4" 
                        strokeWidth={3}
                        isFront={true}
                        label={{ value: "🚀 " + s.nombre, position: 'top', fill: '#22d3ee', fontSize: 11, fontWeight: 'bold' }}
                      />
                    ))}
                    {completedStrategies.map((s, idx) => (
                      <ReferenceLine 
                        key={`end-occ-${idx}`}
                        x={s.monthName} 
                        stroke="#a3e635" 
                        strokeDasharray="4 4" 
                        strokeWidth={3}
                        isFront={true}
                        label={{ value: "✅ " + s.nombre, position: 'top', fill: '#a3e635', fontSize: 11, fontWeight: 'bold' }}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Gráfico de ROI y Utilidad */}
              <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl">
                <h3 className="text-xl font-bold text-purple-400 mb-6">
                  📈 ROI vs Utilidad
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={statsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis 
                      dataKey="monthName" 
                      stroke="#94a3b8" 
                      interval={0} 
                      angle={-45} 
                      textAnchor="end" 
                      height={70} 
                    />
                    <YAxis yAxisId="left" stroke="#94a3b8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const sStarts = payload[0].payload.appliedStrategiesArr || [];
                          const sEnds = payload[0].payload.completedStrategiesArr || [];
                          return (
                            <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl shadow-2xl backdrop-blur-md">
                              <p className="text-slate-400 font-bold mb-2">{label}</p>
                              {payload.map((entry: any, index: number) => (
                                <p key={index} style={{ color: entry.color }} className="text-sm flex justify-between gap-4">
                                  <span>{entry.name}:</span>
                                  <span className="font-mono">
                                    {entry.value.toLocaleString()}
                                    {entry.name.includes('%') ? '%' : ''}
                                    {entry.name.includes('€') ? '€' : ''}
                                  </span>
                                </p>
                              ))}
                              {sStarts.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-slate-700">
                                  {sStarts.map((s: string, i: number) => (
                                    <p key={i} className="text-cyan-400 font-bold text-sm flex items-center gap-2">
                                      <span>🚀</span> {s}
                                    </p>
                                  ))}
                                </div>
                              )}
                              {sEnds.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-slate-700">
                                  {sEnds.map((s: string, i: number) => (
                                    <p key={i} className="text-lime-400 font-bold text-sm flex items-center gap-2">
                                      <span>✅</span> {s} (Finalizada)
                                    </p>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="roi"
                      stroke="#8b5cf6"
                      name="ROI (%)"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="utilidad"
                      stroke="#06b6d4"
                      name="Utilidad (€)"
                    />
                    {appliedStrategies.map((s, idx) => (
                      <ReferenceLine 
                        key={`start-roi-${idx}`}
                        x={s.monthName} 
                        stroke="#22d3ee" 
                        strokeDasharray="4 4" 
                        strokeWidth={3}
                        isFront={true}
                        label={{ value: "🚀 " + s.nombre, position: 'top', fill: '#22d3ee', fontSize: 11, fontWeight: 'bold' }}
                      />
                    ))}
                    {completedStrategies.map((s, idx) => (
                      <ReferenceLine 
                        key={`end-roi-${idx}`}
                        x={s.monthName} 
                        stroke="#a3e635" 
                        strokeDasharray="4 4" 
                        strokeWidth={3}
                        isFront={true}
                        label={{ value: "✅ " + s.nombre, position: 'top', fill: '#a3e635', fontSize: 11, fontWeight: 'bold' }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Gráfico de Puntuación vs Reseñas */}
              <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl">
                <h3 className="text-xl font-bold text-pink-400 mb-6">
                  ⭐ Puntuación vs Reseñas
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={statsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis 
                      dataKey="monthName" 
                      stroke="#94a3b8" 
                      interval={0} 
                      angle={-45} 
                      textAnchor="end" 
                      height={70} 
                    />
                    <YAxis yAxisId="left" stroke="#94a3b8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const sStarts = payload[0].payload.appliedStrategiesArr || [];
                          const sEnds = payload[0].payload.completedStrategiesArr || [];
                          return (
                            <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl shadow-2xl backdrop-blur-md">
                              <p className="text-slate-400 font-bold mb-2">{label}</p>
                              {payload.map((entry: any, index: number) => (
                                <p key={index} style={{ color: entry.color }} className="text-sm flex justify-between gap-4">
                                  <span>{entry.name}:</span>
                                  <span className="font-mono">
                                    {entry.value.toLocaleString()}
                                    {entry.name.includes('%') ? '%' : ''}
                                    {entry.name.includes('€') ? '€' : ''}
                                  </span>
                                </p>
                              ))}
                              {sStarts.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-slate-700">
                                  {sStarts.map((s: string, i: number) => (
                                    <p key={i} className="text-cyan-400 font-bold text-sm flex items-center gap-2">
                                      <span>🚀</span> {s}
                                    </p>
                                  ))}
                                </div>
                              )}
                              {sEnds.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-slate-700">
                                  {sEnds.map((s: string, i: number) => (
                                    <p key={i} className="text-lime-400 font-bold text-sm flex items-center gap-2">
                                      <span>✅</span> {s} (Finalizada)
                                    </p>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="puntuacion"
                      stroke="#ec4899"
                      name="Puntuación"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="resenas"
                      stroke="#f97316"
                      name="Reseñas"
                    />
                    {appliedStrategies.map((s, idx) => (
                      <ReferenceLine 
                        key={`start-rep-${idx}`}
                        x={s.monthName} 
                        stroke="#22d3ee" 
                        strokeDasharray="4 4" 
                        strokeWidth={3}
                        isFront={true}
                        label={{ value: "🚀 " + s.nombre, position: 'top', fill: '#22d3ee', fontSize: 11, fontWeight: 'bold' }}
                      />
                    ))}
                    {completedStrategies.map((s, idx) => (
                      <ReferenceLine 
                        key={`end-rep-${idx}`}
                        x={s.monthName} 
                        stroke="#a3e635" 
                        strokeDasharray="4 4" 
                        strokeWidth={3}
                        isFront={true}
                        label={{ value: "✅ " + s.nombre, position: 'top', fill: '#a3e635', fontSize: 11, fontWeight: 'bold' }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Análisis IA */}
            {analysis ? (
              <div className="mx-8 mb-8">
                <h2 className="text-3xl font-bold text-blue-400 mb-6">
                  🤖 Análisis IA Generado
                </h2>

                {analysis.tendencia_general && (
                  <div className="bg-slate-800 border border-blue-500/50 p-6 rounded-2xl mb-6">
                    <h3 className="text-blue-400 font-bold mb-3">📊 Tendencia General</h3>
                    <p className="text-slate-200 leading-relaxed">
                      {analysis.tendencia_general}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {analysis.fortalezas && analysis.fortalezas.length > 0 && (
                    <div className="bg-emerald-500/10 border border-emerald-500/50 p-6 rounded-2xl">
                      <h3 className="text-emerald-400 font-bold mb-3">💪 Fortalezas</h3>
                      <ul className="space-y-2">
                        {analysis.fortalezas.map((f, i) => (
                          <li key={i} className="text-slate-300 flex items-start gap-2">
                            <span className="text-emerald-400 mt-1">✓</span>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysis.debilidades && analysis.debilidades.length > 0 && (
                    <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-2xl">
                      <h3 className="text-red-400 font-bold mb-3">⚠️ Debilidades</h3>
                      <ul className="space-y-2">
                        {analysis.debilidades.map((d, i) => (
                          <li key={i} className="text-slate-300 flex items-start gap-2">
                            <span className="text-red-400 mt-1">×</span>
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysis.oportunidades && analysis.oportunidades.length > 0 && (
                    <div className="bg-yellow-500/10 border border-yellow-500/50 p-6 rounded-2xl">
                      <h3 className="text-yellow-400 font-bold mb-3">🎯 Oportunidades</h3>
                      <ul className="space-y-2">
                        {analysis.oportunidades.map((o, i) => (
                          <li key={i} className="text-slate-300 flex items-start gap-2">
                            <span className="text-yellow-400 mt-1">→</span>
                            {o}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysis.amenazas && analysis.amenazas.length > 0 && (
                    <div className="bg-purple-500/10 border border-purple-500/50 p-6 rounded-2xl">
                      <h3 className="text-purple-400 font-bold mb-3">⚡ Amenazas</h3>
                      <ul className="space-y-2">
                        {analysis.amenazas.map((a, i) => (
                          <li key={i} className="text-slate-300 flex items-start gap-2">
                            <span className="text-purple-400 mt-1">!</span>
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {analysis.recomendaciones_clave &&
                  analysis.recomendaciones_clave.length > 0 && (
                    <div className="bg-slate-800 border border-cyan-500/50 p-6 rounded-2xl mb-6">
                      <h3 className="text-cyan-400 font-bold mb-4">
                        💡 Recomendaciones Clave
                      </h3>
                      <div className="space-y-4">
                        {analysis.recomendaciones_clave.map((rec, i) => (
                          <div
                            key={i}
                            className="bg-slate-700 p-4 rounded-xl border border-cyan-500/30"
                          >
                            <h4 className="text-cyan-300 font-semibold mb-2">
                              {i + 1}. {rec.titulo}
                            </h4>
                            <p className="text-slate-300 text-sm mb-2">
                              {rec.descripcion}
                            </p>
                            <p className="text-cyan-400 text-sm font-semibold">
                              💰 Impacto: {rec.impacto_estimado}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {analysis.proyeccion_siguiente_trimestre && (
                  <div className="bg-slate-800 border border-lime-500/50 p-6 rounded-2xl">
                    <h3 className="text-lime-400 font-bold mb-3">
                      🔮 Proyección Siguiente Trimestre
                    </h3>
                    <p className="text-slate-200 leading-relaxed">
                      {analysis.proyeccion_siguiente_trimestre}
                    </p>
                  </div>
                )}
              </div>
            ) : generatingAnalysis ? (
              <div className="mx-8 bg-slate-800 p-8 rounded-2xl border border-blue-500/50 text-center">
                <div className="inline-block animate-spin h-8 w-8 border-4 border-blue-400 border-t-transparent rounded-full mb-4"></div>
                <p className="text-blue-400 font-bold">Generando análisis con IA...</p>
              </div>
            ) : null}

            {/* Mejor Mes */}
            {summary.bestMonth && (
              <div className="mx-8 bg-gradient-to-r from-blue-900 to-cyan-900 border border-cyan-500/50 p-8 rounded-2xl mb-8">
                <h3 className="text-2xl font-bold text-cyan-400 mb-4">
                  🏆 Mejor Mes: {monthNames[summary.bestMonth.month - 1]}{" "}
                  {summary.bestMonth.year}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Ingresos</p>
                    <p className="text-2xl font-bold text-blue-300">
                      €{summary.bestMonth.ingresos.toLocaleString("es-ES")}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Utilidad</p>
                    <p className="text-2xl font-bold text-emerald-300">
                      €{summary.bestMonth.utilidad.toLocaleString("es-ES")}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Ocupación</p>
                    <p className="text-2xl font-bold text-green-300">
                      {summary.bestMonth.ocupacion}%
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-1">ROI</p>
                    <p className="text-2xl font-bold text-purple-300">
                      {summary.bestMonth.roi}%
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
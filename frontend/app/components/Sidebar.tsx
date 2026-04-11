"use client";

import { useRouter } from "next/navigation";

interface SidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("hotelId");
    localStorage.removeItem("hotelName");
    router.push("/login");
  };

  return (
    <aside className="w-64 bg-slate-800 border-r border-slate-700 p-6 flex flex-col h-screen sticky top-0 z-[100] shrink-0">
      <h2 className="text-2xl font-bold text-blue-400 mb-8">📊 ORACLE AI</h2>

      {/* Navegación de Estrategias - SIEMPRE VISIBLE */}
      <nav className="flex-1 space-y-2">
        <button
          onClick={() => router.push("/")}
          className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-all bg-slate-700 text-slate-300 hover:bg-slate-600`}
        >
          ➕ Añadir Estrategia
        </button>

        <button
          onClick={() => router.push("/manage")}
          className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-all bg-slate-700 text-slate-300 hover:bg-slate-600`}
        >
          ⚙️ Gestionar Estrategia
        </button>

        <button
          onClick={() => router.push("/stats")}
          className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-all bg-slate-700 text-slate-300 hover:bg-slate-600`}
        >
          📊 Estadísticas
        </button>
      </nav>

      {/* Botones de Acción */}
      <div className="space-y-2 pt-6 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg font-bold transition-all text-sm"
        >
          🚪 Salir
        </button>
      </div>
    </aside>
  );
}

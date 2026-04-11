"use client";

import { useRouter } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";

interface SidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const router = useRouter();
  const { isOpen, toggleSidebar } = useSidebar();

  const handleLogout = () => {
    localStorage.removeItem("hotelId");
    localStorage.removeItem("hotelName");
    router.push("/login");
  };

  return (
    <>
      {/* Botón flotante para toggle */}
      <button
        onClick={toggleSidebar}
        className="fixed left-4 top-4 z-[60] bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg transition-all shadow-lg"
        title={isOpen ? "Ocultar sidebar" : "Mostrar sidebar"}
      >
        {isOpen ? "◀" : "▶"}
      </button>

      {/* Sidebar con animación */}
      <aside className={`w-64 bg-slate-800 border-r border-slate-700 p-6 flex flex-col h-screen sticky top-0 transition-all duration-300 z-[50] ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="pt-8"></div>

        {/* Navegación de Estrategias - SIEMPRE VISIBLE */}
        <nav className="flex-1 space-y-2">
          <button
            onClick={() => router.push("/")}
            className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-all bg-slate-700 text-slate-300 hover:bg-slate-600`}
          >
              Añadir Estrategia
          </button>

          <button
            onClick={() => router.push("/manage")}
            className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-all bg-slate-700 text-slate-300 hover:bg-slate-600`}
          >
              Gestionar Estrategias
          </button>

          <button
            onClick={() => router.push("/stats")}
            className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-all bg-slate-700 text-slate-300 hover:bg-slate-600`}
          >
              Estadísticas
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
    </>
  );
}

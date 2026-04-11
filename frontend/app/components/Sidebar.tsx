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
        className="fixed left-4 top-4 z-[60] border-2 border-[#683110] bg-transparent text-[#683110] hover:bg-[#683110] hover:text-[#f5f4f1] p-2 rounded-lg transition-all shadow-lg"
        title={isOpen ? "Ocultar sidebar" : "Mostrar sidebar"}
      >
        {isOpen ? "◀" : "▶"}
      </button>

      {/* Sidebar con animación */}
      <aside className={`w-64 bg-white border-r border-[#ae8d6e] p-6 flex flex-col h-screen sticky top-0 transition-all duration-300 z-[50] ${isOpen ? "translate-x-0" : "-translate-x-full"
        }`}>
        {/* Espaciador para no chocar con el botón flotante */}
        <div className="pt-16"></div>

        {/* Navegación de Estrategias - SIEMPRE VISIBLE */}
        <nav className="flex-1 space-y-2">
          <button
            onClick={() => router.push("/")}
            className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-all border-2 border-[#5e0710] bg-transparent text-[#683110] hover:bg-[#683110] hover:text-[#f5f4f1]`}
          >
            Añadir Estrategia
          </button>

          <button
            onClick={() => router.push("/manage")}
            className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-all border-2 border-[#5e0710] bg-transparent text-[#683110] hover:bg-[#683110] hover:text-[#f5f4f1]`}
          >
            Gestionar Estrategias
          </button>

          <button
            onClick={() => router.push("/stats")}
            className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-all border-2 border-[#5e0710] bg-transparent text-[#683110] hover:bg-[#683110] hover:text-[#f5f4f1]`}
          >
            Estadísticas
          </button>

          <button
            onClick={() => router.push("/competition")}
            className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-all border-2 border-[#5e0710] bg-transparent text-[#683110] hover:bg-[#683110] hover:text-[#f5f4f1]`}
          >
            Competencia
          </button>

          <button
            onClick={() => router.push("/content")}
            className={`w-full text-left px-4 py-3 rounded-lg font-bold transition-all border-2 border-[#683110] bg-[#f5f4f1] text-[#683110] hover:bg-[#683110] hover:text-[#f5f4f1]`}
          >
            Generador contenido
          </button>
        </nav>

        {/* Botones de Acción */}
        <div className="space-y-2 pt-6 border-t border-[#ae8d6e]">
          <button
            onClick={handleLogout}
            className="w-full border-2 border-[#c50000] bg-transparent hover:bg-[#c50000] hover:text-[#f5f4f1] px-4 py-2 rounded-lg font-bold transition-all text-sm text-[#c50000]"
          >
            Salir
          </button>
        </div>
      </aside>
    </>
  );
}

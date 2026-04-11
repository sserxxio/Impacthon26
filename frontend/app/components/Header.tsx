"use client";
import { useRouter } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
interface HeaderProps {
  hotelName?: string | null;
  pageTitle?: string | null;
  rightElement?: React.ReactNode;
}

export default function Header({ hotelName, pageTitle, rightElement }: HeaderProps) {
  const router = useRouter();
  const { isOpen } = useSidebar();

  return (
    <header className={`w-full bg-white border-b border-[#ae8d6e]/20 py-4 flex justify-between items-center shrink-0 z-10 shadow-sm min-h-[72px] transition-all duration-300 ${
      isOpen ? "px-6" : "pl-14 pr-6"
    }`}>
      <div className="flex items-center gap-6 overflow-hidden">
        {/* Logo - Always Top Left position relative to content */}
        <div 
          className="cursor-pointer hover:opacity-80 transition-opacity shrink-0" 
          onClick={() => router.push("/")}
        >
          <h1 className="text-2xl font-black text-[#683110] italic tracking-tighter leading-none">Velvet</h1>
        </div>

        {/* Diagonal Separator & Context */}
        <div className="flex items-center gap-3">
          <div className="h-6 w-[1px] bg-[#ae8d6e]/30 rotate-[20deg] hidden md:block"></div>
          
          <div className="flex flex-col min-w-0">
            {pageTitle && (
              <h2 className="text-sm font-black text-[#5e0710] uppercase italic truncate max-w-[200px] md:max-w-md">
                {pageTitle}
              </h2>
            )}
            {hotelName && (
              <p className="text-[10px] text-[#ae8d6e] font-bold uppercase tracking-widest truncate">
                {hotelName}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action Area */}
      <div className="flex items-center gap-4 shrink-0">
        {rightElement}
      </div>
    </header>
  );
}

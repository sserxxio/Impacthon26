"use client";

interface HeaderProps {
  hotelName: string | null;
}

export default function Header({ hotelName }: HeaderProps) {
  return (
    <header className="w-full max-w-6xl flex justify-between items-center mb-12 p-8">
      <div>
        <h1 className="text-3xl font-black text-blue-500 italic tracking-tighter">Velvet</h1>
        <p className="text-slate-500 text-xs uppercase tracking-widest">Connected: {hotelName}</p>
      </div>
    </header>
  );
}

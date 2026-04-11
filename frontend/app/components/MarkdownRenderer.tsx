"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  return (
    <div className={`prose  max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 className="text-3xl font-black italic text-[#5e0710] mb-6 uppercase tracking-tighter">{children}</h1>,
          h2: ({ children }) => <h2 className="text-2xl font-bold italic text-[#683110] mb-4 uppercase tracking-tight">{children}</h2>,
          h3: ({ children }) => <h3 className="text-xl font-bold text-[#5e0710] mb-3">{children}</h3>,
          p: ({ children }) => <p className="mb-4 leading-relaxed text-[#683110] last:mb-0">{children}</p>,
          strong: ({ children }) => <strong className="font-bold text-[#5e0710] shadow-sm">{children}</strong>,
          ul: ({ children }) => <ul className="list-disc list-inside space-y-2 mb-4 text-[#683110] ml-4">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside space-y-2 mb-4 text-[#683110] ml-4">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-[#ae8d6e]/50 pl-4 py-2 italic bg-[#f5f4f1] rounded-r-lg mb-4 text-[#683110]">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto mb-6 rounded-xl border border-[#683110]">
              <table className="w-full text-left border-collapse">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-[#683110]/80">{children}</thead>,
          th: ({ children }) => <th className="p-3 text-[10px] font-black uppercase text-[#f5f4f1] tracking-widest border-b border-[#683110]">{children}</th>,
          td: ({ children }) => <td className="p-3 text-sm text-[#683110] border-b border-[#683110]/50">{children}</td>,
          code: ({ children }) => <code className="bg-[#683110] px-1.5 py-0.5 rounded text-[#ae8d6e] font-mono text-xs">{children}</code>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

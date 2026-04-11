"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 className="text-3xl font-black italic text-blue-400 mb-6 uppercase tracking-tighter">{children}</h1>,
          h2: ({ children }) => <h2 className="text-2xl font-bold italic text-slate-200 mb-4 uppercase tracking-tight">{children}</h2>,
          h3: ({ children }) => <h3 className="text-xl font-bold text-slate-300 mb-3">{children}</h3>,
          p: ({ children }) => <p className="mb-4 leading-relaxed text-slate-300 last:mb-0">{children}</p>,
          strong: ({ children }) => <strong className="font-bold text-white shadow-blue-500/10 shadow-sm">{children}</strong>,
          ul: ({ children }) => <ul className="list-disc list-inside space-y-2 mb-4 text-slate-300 ml-4">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside space-y-2 mb-4 text-slate-300 ml-4">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500/50 pl-4 py-2 italic bg-blue-500/5 rounded-r-lg mb-4 text-slate-400">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto mb-6 rounded-xl border border-slate-800">
              <table className="w-full text-left border-collapse">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-slate-800/80">{children}</thead>,
          th: ({ children }) => <th className="p-3 text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-slate-700">{children}</th>,
          td: ({ children }) => <td className="p-3 text-sm text-slate-300 border-b border-slate-800/50">{children}</td>,
          code: ({ children }) => <code className="bg-slate-800 px-1.5 py-0.5 rounded text-blue-300 font-mono text-xs">{children}</code>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

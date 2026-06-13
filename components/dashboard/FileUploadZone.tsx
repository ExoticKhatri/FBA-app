"use client";
import { useRef, useState } from "react";
import type { ParsedCSV } from "@/lib/csvParser";
import { parseCSVFile } from "@/lib/csvParser";

interface Props {
  isPremium: boolean;
  onParsed: (csv: ParsedCSV) => void;
  onUpgradeClick: () => void;
}

export default function FileUploadZone({ isPremium, onParsed, onUpgradeClick }: Props) {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file.name.endsWith(".csv")) {
      setError("Please upload a .csv file.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await parseCSVFile(file);
      setFilename(file.name);
      onParsed(result);
    } catch {
      setError("Failed to parse CSV. Check the file format.");
    } finally {
      setLoading(false);
    }
  }

  if (!isPremium) {
    return (
      <button
        onClick={onUpgradeClick}
        className="w-full rounded-2xl border-2 border-dashed border-slate-200 p-6 flex flex-col items-center gap-2 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all group"
      >
        <div className="text-3xl">🔒</div>
        <p className="text-sm font-semibold text-slate-600 group-hover:text-indigo-600 transition-colors">
          CSV Upload — Premium
        </p>
        <p className="text-xs text-slate-400 text-center">
          Unlock to import any Amazon inventory report
        </p>
        <span className="mt-1 px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-medium">
          Upgrade
        </span>
      </button>
    );
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files[0];
          if (f) handleFile(f);
        }}
        className={[
          "w-full rounded-2xl border-2 border-dashed p-6 flex flex-col items-center gap-2 cursor-pointer transition-all",
          dragging
            ? "border-indigo-400 bg-indigo-50 scale-[1.02]"
            : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50",
        ].join(" ")}
      >
        <div className="text-3xl">{loading ? "⏳" : "📂"}</div>
        <p className="text-sm font-medium text-slate-600">
          {loading ? "Parsing…" : filename ?? "Drop Amazon CSV here"}
        </p>
        <p className="text-xs text-slate-400">or click to browse</p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
      </div>
      {error && <p className="text-xs text-rose-500 mt-2">{error}</p>}
    </div>
  );
}

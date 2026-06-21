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
  const [filenames, setFilenames] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | File[]) {
    const csvFiles = Array.from(files).filter((f) => f.name.endsWith(".csv"));
    if (!csvFiles.length) {
      setError("Please upload .csv file(s).");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await Promise.all(csvFiles.map((f) => parseCSVFile(f)));
      // Merge: use first file's headers, combine all rows
      const headers = results[0].headers;
      const allRows = results.flatMap((r) => r.rows);
      const merged: ParsedCSV = {
        headers,
        rows: allRows,
        preview: allRows.slice(0, 5),
      };
      setFilenames(csvFiles.map((f) => f.name));
      onParsed(merged);
    } catch {
      setError("Failed to parse CSV. Check file format.");
    } finally {
      setLoading(false);
    }
  }

  function removeFile(name: string) {
    const next = filenames.filter((f) => f !== name);
    setFilenames(next);
    if (next.length === 0) {
      // Reset input so re-upload triggers onChange
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  if (!isPremium) {
    return (
      <button
        onClick={onUpgradeClick}
        className="w-full rounded-xl border-2 border-dashed border-slate-200 px-3 py-3 flex items-center gap-3 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all group"
      >
        <span className="text-xl shrink-0">🔒</span>
        <div className="text-left min-w-0">
          <p className="text-xs font-semibold text-slate-600 group-hover:text-indigo-600 transition-colors">
            CSV Upload — Premium
          </p>
          <p className="text-[10px] text-slate-400 truncate">
            Unlock to import Amazon inventory reports
          </p>
        </div>
        <span className="ml-auto shrink-0 px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-medium">
          Upgrade
        </span>
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Drop zone */}
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
          handleFiles(e.dataTransfer.files);
        }}
        className={[
          "w-full rounded-xl border-2 border-dashed px-3 py-3 flex items-center gap-3 cursor-pointer transition-all",
          dragging
            ? "border-indigo-400 bg-indigo-50 scale-[1.01]"
            : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50",
        ].join(" ")}
      >
        <span className="text-xl shrink-0">{loading ? "⏳" : "📂"}</span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-600">
            {loading ? "Parsing…" : "Drop CSVs here"}
          </p>
          <p className="text-[10px] text-slate-400">click to browse · multiple files OK</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          multiple
          className="hidden"
          onChange={(e) => { if (e.target.files?.length) handleFiles(e.target.files); }}
        />
      </div>

      {/* File chips */}
      {filenames.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {filenames.map((name) => (
            <span
              key={name}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] text-indigo-700 font-medium max-w-full"
            >
              <span className="truncate max-w-30">{name}</span>
              <button
                type="button"
                aria-label={`Remove ${name}`}
                onClick={() => removeFile(name)}
                className="text-indigo-400 hover:text-indigo-700 shrink-0 leading-none"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {error && <p className="text-[10px] text-rose-500">{error}</p>}
    </div>
  );
}

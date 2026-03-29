"use client";

import { useState, useRef } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export default function UploadPage() {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ imported?: number; error?: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.name.endsWith(".csv")) {
      toast.error("Only CSV files supported right now");
      return;
    }
    setUploading(true);
    setResult(null);
    const data = await api.uploadCSV(file);
    setUploading(false);
    if (data.imported) {
      setResult(data);
      toast.success(`${data.imported} transactions imported!`);
    } else {
      toast.error(data.error || "Upload failed");
      setResult({ error: data.error });
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Upload Data</h1>
        <p className="text-slate-400 text-sm mt-1">Import transactions from CSV files</p>
      </div>

      <div
        className="glass rounded-2xl p-12 text-center cursor-pointer transition-all duration-200"
        style={{
          border: dragging ? "2px dashed #22c55e" : "2px dashed rgba(255,255,255,0.1)",
          background: dragging ? "rgba(34,197,94,0.05)" : undefined
        }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
        onClick={() => fileRef.current?.click()}
      >
        <input ref={fileRef} type="file" accept=".csv" className="hidden"
          onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />

        {uploading ? (
          <div>
            <div className="w-16 h-16 rounded-full mx-auto mb-4 animate-spin"
              style={{ border: "3px solid rgba(34,197,94,0.2)", borderTop: "3px solid #22c55e" }} />
            <p className="text-white font-medium">Processing your file...</p>
          </div>
        ) : (
          <div>
            <p className="text-5xl mb-4">📤</p>
            <p className="text-white font-semibold text-lg">Drop CSV file here</p>
            <p className="text-slate-400 text-sm mt-2">or click to browse</p>
          </div>
        )}
      </div>

      {result && (
        <div className="glass rounded-2xl p-6 animate-slide-up"
          style={{ borderColor: result.error ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)" }}>
          {result.error ? (
            <p className="text-red-400">Error: {result.error}</p>
          ) : (
            <div className="text-center">
              <p className="text-4xl mb-2">✅</p>
              <p className="text-white font-bold text-xl">{result.imported} transactions imported!</p>
              <p className="text-slate-400 text-sm mt-1">Go to Transactions to view them</p>
            </div>
          )}
        </div>
      )}

      <div className="glass rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-3">CSV Format Guide</h3>
        <p className="text-slate-400 text-sm mb-3">Your CSV should have these columns:</p>
        <div className="rounded-xl p-4 font-mono text-sm"
          style={{ background: "rgba(0,0,0,0.3)" }}>
          <p className="text-green-400">title, amount, type, date</p>
          <p className="text-slate-400">Grocery, 500, expense, 2024-01-15</p>
          <p className="text-slate-400">Salary, 50000, income, 2024-01-01</p>
        </div>
      </div>
    </div>
  );
}
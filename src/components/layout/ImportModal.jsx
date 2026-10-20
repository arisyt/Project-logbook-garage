import React, { useState } from 'react';
import { Upload, X, AlertCircle, CheckCircle2, FileText } from 'lucide-react';

export default function ImportModal({ isOpen, onClose, onImportData }) {
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result;
        setJsonText(String(content));
      } catch (err) {
        setError('Gagal membaca file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!jsonText.trim()) {
      setError('Harap masukkan isi file JSON atau unggah file backup.');
      return;
    }

    const res = onImportData(jsonText);
    if (res.success) {
      setJsonText('');
      setFileName('');
      setError('');
      onClose();
    } else {
      setError(res.error || 'Format JSON tidak valid.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white">Import & Restore Backup</h3>
              <p className="text-[11px] text-slate-400">
                Pulihkan data garasi dari file JSON
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* File input dropzone */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
              Pilih File Backup (.JSON)
            </label>
            <label className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-slate-700 hover:border-cyan-500/60 bg-slate-950/60 cursor-pointer transition">
              <Upload className="w-8 h-8 text-cyan-400 mb-2" />
              <span className="text-xs font-semibold text-slate-200">
                {fileName ? fileName : 'Klik untuk memilih file JSON'}
              </span>
              <span className="text-[10px] font-mono text-slate-500 mt-1">
                velo-moto-garage-backup-*.json
              </span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Or Paste Raw JSON */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
              Atau Tempel Raw JSON
            </label>
            <textarea
              rows="4"
              value={jsonText}
              onChange={(e) => {
                setJsonText(e.target.value);
                setError('');
              }}
              placeholder='{"version": "1.0.0", "vehicles": [...], ...}'
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-300 font-mono text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold font-mono transition flex items-center gap-1.5 shadow-lg shadow-cyan-500/10"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Pulihkan Garasi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = lines.slice(1).map(line => {
    const cols = line.split(',');
    const obj = {};
    headers.forEach((h, i) => { obj[h] = (cols[i] ?? '').trim(); });
    return obj;
  });
  return { headers, rows };
}

export default function Despachos() {
  const [invFile, setInvFile] = useState(null);
  const [despFile, setDespFile] = useState(null);
  const [invPreview, setInvPreview] = useState(null);
  const [despPreview, setDespPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleReadFile = (file, setter) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result || '';
      const parsed = parseCSV(text);
      setter({
        headers: parsed.headers,
        rows: parsed.rows.slice(0, 5),
        total: parsed.rows.length,
      });
    };
    reader.readAsText(file);
  };

  const handleInvChange = (e) => {
    const file = e.target.files?.[0] || null;
    setInvFile(file);
    setInvPreview(null);
    if (file) handleReadFile(file, setInvPreview);
  };

  const handleDespChange = (e) => {
    const file = e.target.files?.[0] || null;
    setDespFile(file);
    setDespPreview(null);
    if (file) handleReadFile(file, setDespPreview);
  };

  const procesarInventario = async () => {
    if (!invFile) return;
    setLoading(true);
    try {
      // TODO: enviar al backend
      console.log('[Inventario] Procesar archivo:', invFile.name);
    } finally {
      setLoading(false);
    }
  };

  const procesarDespachos = async () => {
    if (!despFile) return;
    setLoading(true);
    try {
      // TODO: enviar al backend
      console.log('[Despachos] Procesar archivo:', despFile.name);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="md:ml-64 p-6 space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Cargar archivo de actualización y Despachos</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actualización de Inventario */}
        {/* <section className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 space-y-4">
          <header className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Actualización de Inventario</h2>
          </header>
          <div>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleInvChange}
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {invFile && (
              <p className="mt-2 text-sm text-gray-600">Archivo seleccionado: {invFile.name}</p>
            )}
          </div>
          {invPreview && (
            <div className="mt-2">
              <p className="text-sm text-gray-600">Vista previa (primeras {invPreview.rows.length} filas de {invPreview.total}):</p>
              <div className="overflow-auto border border-gray-200 rounded-md mt-2">
                <table className="min-w-full text-sm text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      {invPreview.headers.map((h) => (
                        <th key={h} className="px-3 py-2 font-medium text-gray-700">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {invPreview.rows.map((row, idx) => (
                      <tr key={idx} className="odd:bg-white even:bg-gray-50">
                        {invPreview.headers.map((h) => (
                          <td key={h} className="px-3 py-2 text-gray-800">{row[h]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <div className="pt-2">
            <button
              type="button"
              disabled={!invFile || loading}
              onClick={procesarInventario}
              className={`inline-flex items-center px-4 py-2 rounded-md text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                !invFile || loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
              }`}
            >
              Procesar inventario
            </button>
          </div>
        </section> */}

        {/* Despachos por Archivo */}
        <section className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 space-y-4">
          <header className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Despachos por Archivo</h2>
          </header>
          <div>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleDespChange}
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            />
            {despFile && (
              <p className="mt-2 text-sm text-gray-600">Archivo seleccionado: {despFile.name}</p>
            )}
          </div>
          {despPreview && (
            <div className="mt-2">
              <p className="text-sm text-gray-600">Vista previa (primeras {despPreview.rows.length} filas de {despPreview.total}):</p>
              <div className="overflow-auto border border-gray-200 rounded-md mt-2">
                <table className="min-w-full text-sm text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      {despPreview.headers.map((h) => (
                        <th key={h} className="px-3 py-2 font-medium text-gray-700">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {despPreview.rows.map((row, idx) => (
                      <tr key={idx} className="odd:bg-white even:bg-gray-50">
                        {despPreview.headers.map((h) => (
                          <td key={h} className="px-3 py-2 text-gray-800">{row[h]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <div className="pt-2">
            <button
              type="button"
              disabled={!despFile || loading}
              onClick={procesarDespachos}
              className={`inline-flex items-center px-4 py-2 rounded-md text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                !despFile || loading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
              }`}
            >
              Procesar despachos
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
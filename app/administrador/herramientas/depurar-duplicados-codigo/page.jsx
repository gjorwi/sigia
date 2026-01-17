'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, FileSpreadsheet, Settings, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import Modal from '@/components/Modal';

export default function DepurarDuplicadosCodigo() {
  const router = useRouter();

  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    time: null
  });

  const [archivo, setArchivo] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [excelConfig, setExcelConfig] = useState({
    headerRow: 1,
    dataStartRow: 2,
    campos: {
      codigo: { headerMatch: 'CODIGO', col: '' }
    }
  });

  const [resultado, setResultado] = useState(null);

  const showMessage = (title, message, type = 'info', time = null) => {
    setModal({ isOpen: true, title, message, type, time });
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  const columnLetterToIndex = (col) => {
    const raw = String(col || '').trim();
    if (!raw) return -1;
    if (/^\d+$/.test(raw)) return Math.max(0, Number(raw) - 1);
    const letters = raw.toUpperCase().replace(/[^A-Z]/g, '');
    if (!letters) return -1;
    let result = 0;
    for (let i = 0; i < letters.length; i++) {
      result = result * 26 + (letters.charCodeAt(i) - 64);
    }
    return result - 1;
  };

  const normalizeHeader = (value) => String(value || '').trim().toUpperCase();

  const resolveColumnIndex = (headers, fieldConfig) => {
    const byCol = columnLetterToIndex(fieldConfig?.col);
    if (byCol >= 0) return byCol;
    const match = normalizeHeader(fieldConfig?.headerMatch);
    if (!match) return -1;
    return headers.findIndex(h => normalizeHeader(h).includes(match));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setArchivo(file);
      setResultado(null);
    }
  };

  const reiniciar = () => {
    setArchivo(null);
    setResultado(null);
  };

  const procesar = async () => {
    if (!archivo) {
      showMessage('Error', 'Debe seleccionar un archivo', 'error', 3000);
      return;
    }

    setProcesando(true);
    try {
      const arrayBuffer = await archivo.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

      const headerRowIndex = Number(excelConfig.headerRow) - 1;
      const dataStartRowIndex = Number(excelConfig.dataStartRow) - 1;

      if (!Number.isFinite(headerRowIndex) || headerRowIndex < 0 || headerRowIndex >= jsonData.length) {
        showMessage('Error', 'La fila de encabezados configurada no existe en el archivo', 'error', 4000);
        return;
      }

      if (!Number.isFinite(dataStartRowIndex) || dataStartRowIndex < 0 || dataStartRowIndex >= jsonData.length) {
        showMessage('Error', 'La fila de inicio de datos configurada no existe en el archivo', 'error', 4000);
        return;
      }

      if (dataStartRowIndex <= headerRowIndex) {
        showMessage('Error', 'La fila de inicio de datos debe ser mayor que la fila de encabezados', 'error', 4000);
        return;
      }

      const headers = (jsonData[headerRowIndex] || []).map(h => String(h).trim());
      const codigoIndex = resolveColumnIndex(headers, excelConfig.campos.codigo);

      if (codigoIndex === -1) {
        showMessage('Error', 'No se encontró la columna configurada para CODIGO', 'error', 4000);
        return;
      }

      const filasAntes = jsonData.slice(0, dataStartRowIndex);
      const filasDatos = jsonData.slice(dataStartRowIndex);

      const vistos = new Set();
      const duplicados = new Set();

      const filasDepuradas = [];
      for (let i = 0; i < filasDatos.length; i++) {
        const row = filasDatos[i] || [];
        const codigo = String(row[codigoIndex] ?? '').trim();

        if (!codigo) {
          filasDepuradas.push(row);
          continue;
        }

        const key = codigo.toUpperCase();
        if (vistos.has(key)) {
          duplicados.add(key);
          continue;
        }

        vistos.add(key);
        filasDepuradas.push(row);
      }

      const outputData = [...filasAntes, ...filasDepuradas];
      const outputSheet = XLSX.utils.aoa_to_sheet(outputData);
      const outWb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(outWb, outputSheet, firstSheetName || 'Hoja1');

      setResultado({
        workbook: outWb,
        sheetName: firstSheetName,
        totalFilasOriginales: filasDatos.length,
        totalFilasFinales: filasDepuradas.length,
        duplicadosEliminados: filasDatos.length - filasDepuradas.length,
        codigosDuplicados: Array.from(duplicados)
      });

      showMessage('Éxito', 'Proceso completado. Puede descargar el nuevo Excel.', 'success', 3000);
    } catch (error) {
      console.error('Error al procesar archivo:', error);
      showMessage('Error', 'Error al procesar el archivo', 'error', 4000);
    } finally {
      setProcesando(false);
    }
  };

  const descargar = () => {
    if (!resultado?.workbook) {
      showMessage('Error', 'No hay archivo generado para descargar', 'error', 3000);
      return;
    }

    try {
      const fecha = new Date().toISOString().split('T')[0];
      XLSX.writeFile(resultado.workbook, `insumos_sin_duplicados_${fecha}.xlsx`);
    } catch (error) {
      console.error('Error al descargar:', error);
      showMessage('Error', 'Error al generar el archivo Excel', 'error', 4000);
    }
  };

  return (
    <div className="md:pl-64 flex flex-col min-h-screen">
      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        time={modal.time}
      />

      <div className="flex-1 flex flex-col">
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <button
                onClick={() => router.push('/administrador/herramientas')}
                className="mb-6 inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </button>

              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Eliminar duplicados (por código)</h1>
                <p className="mt-2 text-sm text-gray-600">
                  Cargue un Excel y elimine filas duplicadas usando solo el campo código
                </p>
              </div>

              {!resultado && (
                <div className="bg-white shadow sm:rounded-lg p-6">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Archivo Excel</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-400 transition-colors">
                      <div className="space-y-1 text-center">
                        <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                          >
                            <span>Seleccionar archivo</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              accept=".xlsx,.xls"
                              onChange={handleFileChange}
                            />
                          </label>
                          <p className="pl-1">o arrastrar y soltar</p>
                        </div>
                        <p className="text-xs text-gray-500">Archivos Excel (.xlsx, .xls)</p>
                        {archivo && (
                          <p className="text-sm text-green-600 font-medium mt-2">✓ {archivo.name}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => router.push('/administrador/herramientas')}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsConfigModalOpen(true)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      title="Configuración"
                    >
                      <Settings className="-ml-1 mr-2 h-4 w-4" />
                      Configuración
                    </button>
                    <button
                      type="button"
                      onClick={reiniciar}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Limpiar
                    </button>
                    <button
                      type="button"
                      onClick={procesar}
                      disabled={!archivo || procesando}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {procesando ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Procesando...
                        </>
                      ) : (
                        <>
                          <FileSpreadsheet className="-ml-1 mr-2 h-4 w-4" />
                          Procesar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {resultado && (
                <div className="bg-white shadow sm:rounded-lg p-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-md border border-gray-200 p-4">
                      <p className="text-sm font-medium text-gray-700">Filas de datos (original)</p>
                      <p className="mt-1 text-2xl font-semibold text-gray-900">{resultado.totalFilasOriginales}</p>
                    </div>
                    <div className="rounded-md border border-gray-200 p-4">
                      <p className="text-sm font-medium text-gray-700">Duplicados eliminados</p>
                      <p className="mt-1 text-2xl font-semibold text-gray-900">{resultado.duplicadosEliminados}</p>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={reiniciar}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Procesar otro archivo
                    </button>
                    <button
                      type="button"
                      onClick={descargar}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <Download className="-ml-1 mr-2 h-4 w-4" />
                      Descargar Excel
                    </button>
                  </div>
                </div>
              )}

              {isConfigModalOpen && (
                <div className="fixed inset-0 z-[10002] overflow-y-auto">
                  <div className="fixed inset-0 bg-black/50" onClick={() => setIsConfigModalOpen(false)} />
                  <div className="flex min-h-screen items-center justify-center p-4 text-center">
                    <div
                      className="relative w-full max-w-2xl transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="bg-gray-50 px-4 py-3 sm:flex sm:items-center sm:justify-between sm:px-6 sm:py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Configuración de columnas (Excel)</h3>
                        <button
                          type="button"
                          className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          onClick={() => setIsConfigModalOpen(false)}
                        >
                          <span className="sr-only">Cerrar</span>
                          <X className="h-6 w-6" />
                        </button>
                      </div>

                      <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                        <p className="text-xs text-gray-600">
                          Indica en qué fila están los encabezados y desde qué fila inician los datos. Para el campo puedes usar el nombre del encabezado (contiene) o una columna (A, B, C... o número 1, 2, 3...).
                        </p>

                        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Fila de encabezados</label>
                            <input
                              type="number"
                              min="1"
                              value={excelConfig.headerRow}
                              onChange={(e) => setExcelConfig(prev => ({ ...prev, headerRow: Number(e.target.value || 1) }))}
                              className="mt-1 block w-full rounded-md border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Fila inicio de datos</label>
                            <input
                              type="number"
                              min="1"
                              value={excelConfig.dataStartRow}
                              onChange={(e) => setExcelConfig(prev => ({ ...prev, dataStartRow: Number(e.target.value || 1) }))}
                              className="mt-1 block w-full rounded-md border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-4">
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div className="sm:col-span-1">
                              <p className="text-sm font-medium text-gray-900">CODIGO</p>
                              <p className="text-xs text-gray-500">Campo usado para detectar duplicados</p>
                            </div>
                            <div className="sm:col-span-1">
                              <label className="block text-sm font-medium text-gray-700">Encabezado contiene</label>
                              <input
                                type="text"
                                value={excelConfig.campos.codigo.headerMatch}
                                onChange={(e) => setExcelConfig(prev => ({
                                  ...prev,
                                  campos: { ...prev.campos, codigo: { ...prev.campos.codigo, headerMatch: e.target.value } }
                                }))}
                                className="mt-1 block w-full rounded-md border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              />
                            </div>
                            <div className="sm:col-span-1">
                              <label className="block text-sm font-medium text-gray-700">Columna (opcional)</label>
                              <input
                                type="text"
                                placeholder="Ej: A o 1"
                                value={excelConfig.campos.codigo.col}
                                onChange={(e) => setExcelConfig(prev => ({
                                  ...prev,
                                  campos: { ...prev.campos, codigo: { ...prev.campos.codigo, col: e.target.value } }
                                }))}
                                className="mt-1 block w-full rounded-md border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={() => setIsConfigModalOpen(false)}
                          className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                          Guardar
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsConfigModalOpen(false)}
                          className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

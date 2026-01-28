'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, FileSpreadsheet, Plus, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import Modal from '@/components/Modal';
import { provincias } from '@/constantes/provincias';

export default function AgregarTotales() {
  const router = useRouter();
  const aportadorInputRef = useRef(null);

  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    time: null
  });

  const [archivoReceptor, setArchivoReceptor] = useState(null);
  const [receptor, setReceptor] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [cargas, setCargas] = useState([]);
  const [sinMatchModal, setSinMatchModal] = useState({
    isOpen: false,
    estado: '',
    archivo: '',
    items: []
  });

  const estados = useMemo(() => {
    return (provincias || []).map(p => p?.nombre).filter(Boolean);
  }, []);

  const showMessage = (title, message, type = 'info', time = null) => {
    setModal({ isOpen: true, title, message, type, time });
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  const openSinMatchModal = (carga) => {
    const items = Array.isArray(carga?.sinMatchInsumos) ? carga.sinMatchInsumos : [];
    setSinMatchModal({
      isOpen: true,
      estado: carga?.estado || '',
      archivo: carga?.archivo || '',
      items
    });
  };

  const normalizeText = (value) => {
    return String(value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .replace(/\s+/g, ' ')
      .toUpperCase();
  };

  const extractDupGroupTag = (value) => {
    const raw = String(value ?? '');
    const match = raw.match(/\(\s*DUPG\s*:\s*([^\)]+)\s*\)/i);
    if (!match) return '';
    return String(match[1] || '').trim().toUpperCase();
  };

  const stripDupGroupTag = (value) => {
    const raw = String(value ?? '');
    return raw.replace(/\s*\(\s*DUPG\s*:\s*[^\)]+\s*\)\s*/gi, ' ').replace(/\s+/g, ' ').trim();
  };

  const normalizeEstado = (estado) => {
    const e = normalizeText(estado);
    if (e === 'CAPITAL') return 'DISTRITO CAPITAL';
    return e;
  };

  const asNumber = (value) => {
    if (typeof value === 'number' && Number.isFinite(value)) return Math.round(value);
    const raw = String(value ?? '').trim();
    if (!raw) return 0;
    const normalized = raw.replace(/\./g, '').replace(',', '.');
    const n = Number(normalized);
    return Number.isFinite(n) ? Math.round(n) : 0;
  };

  const findHeaderIndex = (headers, matcher) => {
    if (!headers?.length) return -1;
    for (let i = 0; i <headers.length; i++) {
      const h = normalizeText(headers[i]);
      if (matcher(h)) return i;
    }
    return -1;
  };

  const parseWorkbook = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const aoa = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
    return { workbook, sheetName: firstSheetName, aoa };
  };

  const parseWorkbookAllSheets = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheets = (workbook.SheetNames || []).map((sheetName) => {
      const worksheet = workbook.Sheets[sheetName];
      const aoa = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
      return { sheetName, aoa };
    });
    return { workbook, sheets };
  };

  const extractEstadoFromSheetName = (sheetName) => {
    const raw = String(sheetName ?? '').trim();
    if (!raw) return '';
    const withoutTrailingNumber = raw.replace(/\s+\d+\s*$/g, '').trim();
    return withoutTrailingNumber || raw;
  };

  const detectReceptorColumns = (headers, estado) => {
    const descIndex = findHeaderIndex(headers, (h) =>
      h.includes('DESCRIPCION') || h.includes('DESCRIPCIÓN') || h === 'NOMBRE' || h.includes('NOMBRE')
    );

    const estadoNorm = normalizeEstado(estado);
    const cantidadIndex = findHeaderIndex(headers, (h) =>
      h.includes('CANTIDAD') && (estadoNorm ? h.includes(estadoNorm) : true)
    );

    return { descIndex, cantidadIndex };
  };

  const handleReceptorChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcesando(true);
    try {
      const parsed = await parseWorkbook(file);

      const headerRowIndex = 0;
      if (!parsed.aoa?.length || parsed.aoa.length <= headerRowIndex) {
        showMessage('Error', 'El archivo receptor no contiene datos suficientes', 'error', 4000);
        return;
      }

      const headers = (parsed.aoa[headerRowIndex] || []).map(h => String(h).trim());
      const { descIndex } = detectReceptorColumns(headers, '');
      if (descIndex === -1) {
        showMessage(
          'Error',
          'No se pudo detectar la columna de descripción en el archivo receptor (se busca DESCRIPCION/DESCRIPCIÓN/NOMBRE)',
          'error',
          5000
        );
        return;
      }

      setArchivoReceptor(file);
      setReceptor({
        workbook: parsed.workbook,
        sheetName: parsed.sheetName,
        aoa: parsed.aoa,
        headerRowIndex,
        dataStartRowIndex: 1,
        descIndex
      });
      setCargas([]);
      showMessage('Listo', 'Archivo receptor cargado correctamente', 'success', 2500);
    } catch (error) {
      console.error('Error al cargar receptor:', error);
      showMessage('Error', 'No se pudo leer el archivo receptor', 'error', 4000);
    } finally {
      setProcesando(false);
    }
  };

  const handleAgregarDocumento = () => {
    if (!receptor) {
      showMessage('Error', 'Primero debe cargar el archivo receptor', 'error', 3000);
      return;
    }
    if (aportadorInputRef.current) {
      aportadorInputRef.current.value = '';
      aportadorInputRef.current.click();
    }
  };

  const getTotalesFromAoa = (aoa) => {
    const aportadorHeaderRowIndex = 4;
    const aportadorDataStartRowIndex = 5;

    if (!aoa?.length || aoa.length <= aportadorHeaderRowIndex) {
      return {
        ok: false,
        error: 'El archivo aportador no tiene la fila 5 de encabezados',
        mapTotales: null
      };
    }

    const aportadorHeaders = (aoa[aportadorHeaderRowIndex] || []).map(h => String(h).trim());
    const aportadorDescIndex = findHeaderIndex(aportadorHeaders, (h) => h.includes('DESCRIPCION (MATERIAL MMQ)'));
    const aportadorTotalIndex = findHeaderIndex(aportadorHeaders, (h) => h === 'TOTAL' || h.includes('TOTAL'));

    if (aportadorDescIndex === -1) {
      return {
        ok: false,
        error: 'No se encontró la columna DESCRIPCION (MATERIAL MMQ) en el aportador',
        mapTotales: null
      };
    }
    if (aportadorTotalIndex === -1) {
      return {
        ok: false,
        error: 'No se encontró la columna TOTAL en el aportador',
        mapTotales: null
      };
    }

    const mapTotales = new Map();
    for (let r = aportadorDataStartRowIndex; r < aoa.length; r++) {
      const row = aoa[r] || [];
      const desc = normalizeText(row[aportadorDescIndex]);
      if (!desc) continue;
      const total = asNumber(row[aportadorTotalIndex]);
      mapTotales.set(desc, (mapTotales.get(desc) || 0) + total);
    }

    return { ok: true, error: null, mapTotales };
  };

  const applyTotalesToReceptorAoa = (receptorAoa, estado, mapTotales) => {
    const receptorHeaders = (receptorAoa[receptor.headerRowIndex] || []).map(h => String(h).trim());
    const { cantidadIndex } = detectReceptorColumns(receptorHeaders, estado);
    const codigoIndex = findHeaderIndex(receptorHeaders, (h) => h === 'CODIGO' || h.includes('CODIGO'));
    if (cantidadIndex === -1) {
      return {
        ok: false,
        error: `No se encontró la columna destino para "cantidad ${estado}" en el receptor`,
        filasActualizadas: 0,
        filasSinMatch: 0
      };
    }

    let filasActualizadas = 0;
    let filasSinMatch = 0;
    const sinMatchInsumos = [];
    const maxSinMatch = 20;

    const groups = new Map();
    for (let r = receptor.dataStartRowIndex; r < receptorAoa.length; r++) {
      const row = receptorAoa[r] || [];
      const rawNombre = String(row[receptor.descIndex] ?? '').trim();
      if (!rawNombre) continue;

      const rawCodigo = codigoIndex >= 0 ? String(row[codigoIndex] ?? '').trim() : '';
      const dupTag = extractDupGroupTag(rawNombre);
      const baseNombre = stripDupGroupTag(rawNombre);
      const descNorm = normalizeText(baseNombre);
      if (!descNorm) continue;

      const groupKey = rawCodigo ? `COD:${rawCodigo.toUpperCase()}` : (dupTag ? `DUPG:${dupTag}` : `DESC:${descNorm}`);
      if (!groups.has(groupKey)) {
        groups.set(groupKey, {
          groupByCodigo: Boolean(rawCodigo),
          dupTag,
          descNorm,
          baseNombre,
          primaryRow: r,
          primaryIsDup: Boolean(dupTag),
          rows: [r]
        });
      } else {
        const g = groups.get(groupKey);
        g.rows.push(r);

        if (g.groupByCodigo) {
          const filaEsDup = Boolean(dupTag);
          if (g.primaryIsDup && !filaEsDup) {
            g.primaryRow = r;
            g.baseNombre = baseNombre;
            g.primaryIsDup = false;
          }
        }
      }
    }

    for (const group of groups.values()) {
      let totalSum = 0;
      let matchedAny = false;

      if (group.groupByCodigo || group.dupTag) {
        const vistosDesc = new Set();
        for (const r of group.rows) {
          const row = receptorAoa[r] || [];
          const rawNombre = String(row[receptor.descIndex] ?? '').trim();
          const baseNombre = stripDupGroupTag(rawNombre);
          const descNorm = normalizeText(baseNombre);
          if (!descNorm) continue;
          if (!mapTotales.has(descNorm)) continue;

          if (group.groupByCodigo) {
            if (vistosDesc.has(descNorm)) continue;
            vistosDesc.add(descNorm);
          }

          matchedAny = true;
          totalSum += asNumber(mapTotales.get(descNorm));
        }
      } else {
        if (mapTotales.has(group.descNorm)) {
          matchedAny = true;
          totalSum = asNumber(mapTotales.get(group.descNorm));
        }
      }

      if (!matchedAny) {
        filasSinMatch += group.rows.length;
        if (sinMatchInsumos.length < maxSinMatch) sinMatchInsumos.push(group.descNorm);

        for (const r of group.rows) {
          const row = receptorAoa[r] || [];
          while (row.length <= Math.max(receptor.descIndex, cantidadIndex)) row.push('');
          row[cantidadIndex] = '';
          receptorAoa[r] = row;
        }
        continue;
      }

      const primaryRowIndex = group.primaryRow;
      const primaryRow = receptorAoa[primaryRowIndex] || [];
      while (primaryRow.length <= Math.max(receptor.descIndex, cantidadIndex)) primaryRow.push('');
      primaryRow[receptor.descIndex] = group.baseNombre;
      primaryRow[cantidadIndex] = totalSum;
      receptorAoa[primaryRowIndex] = primaryRow;
      filasActualizadas++;

      for (const r of group.rows) {
        if (r === primaryRowIndex) continue;
        const row = receptorAoa[r] || [];
        while (row.length <= Math.max(receptor.descIndex, cantidadIndex)) row.push('');
        row[cantidadIndex] = '';
        receptorAoa[r] = row;
      }
    }

    return { ok: true, error: null, filasActualizadas, filasSinMatch, sinMatchInsumos };
  };

  const applyAportador = async (file) => {
    if (!receptor) return;

    setProcesando(true);
    try {
      const parsed = await parseWorkbookAllSheets(file);
      if (!parsed?.sheets?.length) {
        showMessage('Error', 'El archivo aportador no contiene hojas para procesar', 'error', 4500);
        return;
      }

      const estadosSet = new Set(estados.map(e => normalizeText(e)));
      const receptorAoa = receptor.aoa.map(row => (Array.isArray(row) ? [...row] : []));

      const nuevasCargas = [];
      let totalFilasActualizadas = 0;

      for (const sheet of parsed.sheets) {
        const estado = extractEstadoFromSheetName(sheet.sheetName);
        const estadoNorm = normalizeEstado(estado);
        if (estadoNorm && estadosSet.size > 0 && !estadosSet.has(estadoNorm)) {
          continue;
        }

        const { ok, error, mapTotales } = getTotalesFromAoa(sheet.aoa);
        if (!ok) {
          nuevasCargas.push({
            estado: estado || sheet.sheetName,
            archivo: `${file.name} / ${sheet.sheetName}`,
            filasActualizadas: 0,
            filasSinMatch: 0,
            time: new Date().toISOString(),
            error
          });
          continue;
        }

        const applied = applyTotalesToReceptorAoa(receptorAoa, estado, mapTotales);
        if (!applied.ok) {
          nuevasCargas.push({
            estado: estado || sheet.sheetName,
            archivo: `${file.name} / ${sheet.sheetName}`,
            filasActualizadas: 0,
            filasSinMatch: 0,
            time: new Date().toISOString(),
            error: applied.error
          });
          continue;
        }

        totalFilasActualizadas += applied.filasActualizadas;
        nuevasCargas.push({
          estado: estado || sheet.sheetName,
          archivo: `${file.name} / ${sheet.sheetName}`,
          filasActualizadas: applied.filasActualizadas,
          filasSinMatch: applied.filasSinMatch,
          sinMatchInsumos: applied.sinMatchInsumos,
          time: new Date().toISOString()
        });
      }

      const outputSheet = XLSX.utils.aoa_to_sheet(receptorAoa);
      receptor.workbook.Sheets[receptor.sheetName] = outputSheet;

      setReceptor(prev => {
        if (!prev) return prev;
        return { ...prev, aoa: receptorAoa };
      });

      setCargas(prev => [...prev, ...nuevasCargas]);
      showMessage('Éxito', `Totales cargados desde ${file.name}. Filas actualizadas: ${totalFilasActualizadas}`, 'success', 4000);
    } catch (error) {
      console.error('Error al aplicar aportador:', error);
      showMessage('Error', 'No se pudo procesar el archivo aportador', 'error', 4000);
    } finally {
      setProcesando(false);
    }
  };

  const handleAportadorChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await applyAportador(file);
  };

  const descargar = () => {
    if (!receptor?.workbook) {
      showMessage('Error', 'No hay archivo generado para descargar', 'error', 3000);
      return;
    }
    try {
      const aoa = Array.isArray(receptor?.aoa) ? receptor.aoa : [];
      const aoaFiltrada = aoa.filter((row, idx) => {
        if (idx < (receptor?.dataStartRowIndex ?? 1)) return true;
        const nombre = String((row || [])[receptor?.descIndex] ?? '').trim();
        return !extractDupGroupTag(nombre);
      });

      const outputSheet = XLSX.utils.aoa_to_sheet(aoaFiltrada);
      const outputWb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(outputWb, outputSheet, receptor.sheetName || 'Hoja1');
      const fecha = new Date().toISOString().split('T')[0];
      XLSX.writeFile(outputWb, `insumos_con_totales_${fecha}.xlsx`);
    } catch (error) {
      console.error('Error al descargar:', error);
      showMessage('Error', 'Error al generar el archivo Excel', 'error', 4000);
    }
  };

  const reiniciar = () => {
    setArchivoReceptor(null);
    setReceptor(null);
    setCargas([]);
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

      <Modal
        isOpen={sinMatchModal.isOpen}
        onClose={() => setSinMatchModal(prev => ({ ...prev, isOpen: false }))}
        title={`Sin match - ${sinMatchModal.estado}`}
        message={
          sinMatchModal.items.length > 0
            ? `Archivo: ${sinMatchModal.archivo}\n\n${sinMatchModal.items.join('\n')}`
            : `Archivo: ${sinMatchModal.archivo}\n\nNo hay insumos para mostrar.`
        }
        type="info"
        time={null}
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
                <h1 className="text-3xl font-bold text-gray-900">Cargar totales por estado</h1>
                <p className="mt-2 text-sm text-gray-600">
                  Cargue un Excel receptor y luego un Excel aportador con 24 hojas (una por estado) para completar las columnas de cantidad.
                </p>
              </div>

              <div className="bg-white shadow sm:rounded-lg p-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Archivo receptor</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-400 transition-colors">
                      <div className="space-y-1 text-center">
                        <FileSpreadsheet className="mx-auto h-10 w-10 text-gray-400" />

                        <div className="flex text-sm text-gray-600 justify-center">
                          <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                            <span>{archivoReceptor ? 'Cambiar archivo' : 'Seleccionar archivo'}</span>
                            <input
                              type="file"
                              className="sr-only"
                              accept=".xlsx,.xls"
                              onChange={handleReceptorChange}
                              disabled={procesando}
                            />
                          </label>
                        </div>
                        {archivoReceptor && (
                          <p className="text-xs text-gray-500 break-all">{archivoReceptor.name}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Documento aportador</label>
                    <button
                      type="button"
                      onClick={handleAgregarDocumento}
                      disabled={procesando || !receptor}
                      className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Agregar documento
                    </button>

                    <input
                      ref={aportadorInputRef}
                      type="file"
                      className="sr-only"
                      accept=".xlsx,.xls"
                      onChange={handleAportadorChange}
                      disabled={procesando}
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      En cada hoja se toma la fila 5 como encabezado y se usan las columnas <span className="font-medium">DESCRIPCION (MATERIAL MMQ)</span> y <span className="font-medium">TOTAL</span>.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={descargar}
                    disabled={!receptor?.workbook || procesando}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Descargar archivo final
                  </button>
                  <button
                    type="button"
                    onClick={reiniciar}
                    disabled={procesando}
                    className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Reiniciar
                  </button>
                </div>
              </div>

              <div className="mt-6 bg-white shadow sm:rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Estados cargados</h2>
                {cargas.length === 0 ? (
                  <p className="text-sm text-gray-600">Aún no se ha cargado ningún documento aportador.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Archivo</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actualizadas</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sin match</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {cargas.map((c, idx) => (
                          <tr key={`${c.estado}-${idx}`}>
                            <td className="px-4 py-2 text-sm text-gray-900">{c.estado}</td>
                            <td className="px-4 py-2 text-sm text-gray-600 break-all">{c.archivo}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{c.filasActualizadas}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {c.filasSinMatch > 0 ? (
                                <button
                                  type="button"
                                  onClick={() => openSinMatchModal(c)}
                                  className="text-blue-600 hover:text-blue-800 underline"
                                >
                                  {c.filasSinMatch}
                                </button>
                              ) : (
                                c.filasSinMatch
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
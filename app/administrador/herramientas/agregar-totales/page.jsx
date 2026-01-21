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
   const [estadoSeleccionado, setEstadoSeleccionado] = useState('');
   const [procesando, setProcesando] = useState(false);
   const [cargas, setCargas] = useState([]);

   const estados = useMemo(() => {
     return (provincias || []).map(p => p?.nombre).filter(Boolean);
   }, []);

   const showMessage = (title, message, type = 'info', time = null) => {
     setModal({ isOpen: true, title, message, type, time });
   };

   const closeModal = () => {
     setModal(prev => ({ ...prev, isOpen: false }));
   };

   const normalizeText = (value) => {
     return String(value ?? '')
       .trim()
       .replace(/\s+/g, ' ')
       .toUpperCase();
   };

   const asNumber = (value) => {
     if (typeof value === 'number' && Number.isFinite(value)) return value;
     const raw = String(value ?? '').trim();
     if (!raw) return 0;
     const normalized = raw.replace(/\./g, '').replace(',', '.');
     const n = Number(normalized);
     return Number.isFinite(n) ? n : 0;
   };

   const findHeaderIndex = (headers, matcher) => {
     if (!headers?.length) return -1;
     for (let i = 0; i < headers.length; i++) {
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

   const detectReceptorColumns = (headers, estado) => {
     const descIndex = findHeaderIndex(headers, (h) =>
       h.includes('DESCRIPCION') || h.includes('DESCRIPCIÓN') || h === 'NOMBRE' || h.includes('NOMBRE')
     );

     const estadoNorm = normalizeText(estado);
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
       const { descIndex } = detectReceptorColumns(headers, estadoSeleccionado);
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
     if (!estadoSeleccionado) {
       showMessage('Error', 'Debe seleccionar un estado', 'error', 3000);
       return;
     }
     if (aportadorInputRef.current) {
       aportadorInputRef.current.value = '';
       aportadorInputRef.current.click();
     }
   };

   const applyAportador = async (file, estado) => {
     if (!receptor) return;

     setProcesando(true);
     try {
       const parsed = await parseWorkbook(file);
       const aportadorHeaderRowIndex = 4;
       const aportadorDataStartRowIndex = 5;

       if (!parsed.aoa?.length || parsed.aoa.length <= aportadorHeaderRowIndex) {
         showMessage('Error', 'El archivo aportador no tiene la fila 5 de encabezados', 'error', 4500);
         return;
       }

       const aportadorHeaders = (parsed.aoa[aportadorHeaderRowIndex] || []).map(h => String(h).trim());
       const aportadorDescIndex = findHeaderIndex(aportadorHeaders, (h) => h.includes('DESCRIPCION (MATERIAL MMQ)'));
       const aportadorTotalIndex = findHeaderIndex(aportadorHeaders, (h) => h === 'TOTAL' || h.includes('TOTAL'));

       if (aportadorDescIndex === -1) {
         showMessage('Error', 'No se encontró la columna DESCRIPCION (MATERIAL MMQ) en el aportador', 'error', 5000);
         return;
       }
       if (aportadorTotalIndex === -1) {
         showMessage('Error', 'No se encontró la columna TOTAL en el aportador', 'error', 5000);
         return;
       }

       const receptorHeaders = (receptor.aoa[receptor.headerRowIndex] || []).map(h => String(h).trim());
       const { cantidadIndex } = detectReceptorColumns(receptorHeaders, estado);
       if (cantidadIndex === -1) {
         showMessage('Error', `No se encontró la columna destino para "cantidad ${estado}" en el receptor`, 'error', 5000);
         return;
       }

       const mapTotales = new Map();
       for (let r = aportadorDataStartRowIndex; r < parsed.aoa.length; r++) {
         const row = parsed.aoa[r] || [];
         const desc = normalizeText(row[aportadorDescIndex]);
         if (!desc) continue;
         const total = asNumber(row[aportadorTotalIndex]);
         mapTotales.set(desc, total);
       }

       const receptorAoa = receptor.aoa.map(row => (Array.isArray(row) ? [...row] : []));
       let filasActualizadas = 0;
       let filasSinMatch = 0;

       for (let r = receptor.dataStartRowIndex; r < receptorAoa.length; r++) {
         const row = receptorAoa[r] || [];
         const desc = normalizeText(row[receptor.descIndex]);
         if (!desc) continue;

         if (!mapTotales.has(desc)) {
           filasSinMatch++;
           continue;
         }

         const total = mapTotales.get(desc);
         while (row.length <= Math.max(receptor.descIndex, cantidadIndex)) row.push('');
         const actual = asNumber(row[cantidadIndex]);
         row[cantidadIndex] = actual + total;
         receptorAoa[r] = row;
         filasActualizadas++;
       }

       const outputSheet = XLSX.utils.aoa_to_sheet(receptorAoa);
       receptor.workbook.Sheets[receptor.sheetName] = outputSheet;

       setReceptor(prev => {
         if (!prev) return prev;
         return { ...prev, aoa: receptorAoa };
       });

       setCargas(prev => [
         ...prev,
         {
           estado,
           archivo: file.name,
           filasActualizadas,
           filasSinMatch,
           time: new Date().toISOString()
         }
       ]);

       showMessage('Éxito', `Totales cargados para ${estado}. Filas actualizadas: ${filasActualizadas}`, 'success', 3500);
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
     if (!estadoSeleccionado) {
       showMessage('Error', 'Debe seleccionar un estado antes de cargar el documento', 'error', 3000);
       return;
     }
     await applyAportador(file, estadoSeleccionado);
   };

   const descargar = () => {
     if (!receptor?.workbook) {
       showMessage('Error', 'No hay archivo generado para descargar', 'error', 3000);
       return;
     }
     try {
       const fecha = new Date().toISOString().split('T')[0];
       XLSX.writeFile(receptor.workbook, `insumos_con_totales_${fecha}.xlsx`);
     } catch (error) {
       console.error('Error al descargar:', error);
       showMessage('Error', 'Error al generar el archivo Excel', 'error', 4000);
     }
   };

   const reiniciar = () => {
     setArchivoReceptor(null);
     setReceptor(null);
     setEstadoSeleccionado('');
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
                   Cargue un Excel receptor y luego agregue uno o más Excel aportadores (uno por estado) para completar las columnas de cantidad.
                 </p>
               </div>

               <div className="bg-white shadow sm:rounded-lg p-6">
                 <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
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
                     <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                     <select
                       value={estadoSeleccionado}
                       onChange={(e) => setEstadoSeleccionado(e.target.value)}
                       className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                       disabled={procesando || !receptor}
                     >
                       <option value="">Seleccione...</option>
                       {estados.map((e) => (
                         <option key={e} value={e}>
                           {e}
                         </option>
                       ))}
                     </select>
                     <p className="mt-2 text-xs text-gray-500">
                       Se buscará la columna destino en el receptor que contenga <span className="font-medium">CANTIDAD</span> y el nombre del estado.
                     </p>
                   </div>

                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">Documento aportador</label>
                     <button
                       type="button"
                       onClick={handleAgregarDocumento}
                       disabled={procesando || !receptor || !estadoSeleccionado}
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
                       En el aportador se toma la fila 5 como encabezado y se usan las columnas <span className="font-medium">DESCRIPCION (MATERIAL MMQ)</span> y <span className="font-medium">TOTAL</span>.
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
                             <td className="px-4 py-2 text-sm text-gray-900">{c.filasSinMatch}</td>
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
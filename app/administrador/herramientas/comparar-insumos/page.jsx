'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, FileSpreadsheet, Save, X, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import Modal from '@/components/Modal';
import InsumoForm from '@/components/insumoForm';
import { useAuth } from '@/contexts/AuthContext';
import { getInsumos } from '@/servicios/insumos/get';
import { provincias } from '@/constantes/provincias';

export default function CompararInsumos() {
  const router = useRouter();
  const { user, logout } = useAuth();
  
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    time: null
  });
  const [archivoComparacion, setArchivoComparacion] = useState(null);
  const [comparando, setComparando] = useState(false);
  const [resultadosComparacion, setResultadosComparacion] = useState(null);
  const [registrandoInsumo, setRegistrandoInsumo] = useState(null);
  const [modalRegistro, setModalRegistro] = useState(false);
  const [formDataRegistro, setFormDataRegistro] = useState(null);
  const [loadingRegistro, setLoadingRegistro] = useState(false);
  const [generandoExcel, setGenerandoExcel] = useState(false);
  const [registrandoTodos, setRegistrandoTodos] = useState(false);

  const showMessage = (title, message, type = 'info', time = null) => {
    setModal({ isOpen: true, title, message, type, time });
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setArchivoComparacion(file);
      setResultadosComparacion(null);
    }
  };

  // Mover insumo de registrados a no registrados
  const moverANoRegistrados = (index) => {
    const insumo = resultadosComparacion.registrados[index];
    const nuevosRegistrados = resultadosComparacion.registrados.filter((_, i) => i !== index);
    const nuevosNoRegistrados = [...resultadosComparacion.noRegistrados, insumo];
    
    setResultadosComparacion({
      registrados: nuevosRegistrados,
      noRegistrados: nuevosNoRegistrados
    });
  };

  // Mover insumo de no registrados a registrados
  const moverARegistrados = (index) => {
    const insumo = resultadosComparacion.noRegistrados[index];
    const nuevosNoRegistrados = resultadosComparacion.noRegistrados.filter((_, i) => i !== index);
    const nuevosRegistrados = [...resultadosComparacion.registrados, insumo];
    
    setResultadosComparacion({
      registrados: nuevosRegistrados,
      noRegistrados: nuevosNoRegistrados
    });
  };

  // Reiniciar comparación
  const reiniciarComparacion = () => {
    setResultadosComparacion(null);
    setArchivoComparacion(null);
  };

  // Generar Excel con insumos registrados de la comparación
  const generarExcelInsumosRegistrados = async () => {
    if (!resultadosComparacion || resultadosComparacion.registrados.length === 0) {
      showMessage('Error', 'No hay insumos registrados para exportar', 'error', 3000);
      return;
    }

    setGenerandoExcel(true);
    try {
      const cantidadColumns = (provincias || [])
        .map(p => p?.nombre)
        .filter(Boolean)
        .map(nombre => `cantidad ${nombre}`);

      const rows = resultadosComparacion.registrados.map(item => {
        const row = {
          codigo: item.coincidencia?.codigo || '',
          nombre: item.coincidencia?.nombre || item.descripcion || ''
        };
        cantidadColumns.forEach(col => {
          row[col] = '';
        });
        return row;
      });

      const worksheet = XLSX.utils.json_to_sheet(rows, {
        header: ['codigo', 'nombre', ...cantidadColumns]
      });

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Insumos Registrados');

      const fecha = new Date().toISOString().split('T')[0];
      XLSX.writeFile(workbook, `insumos_registrados_${fecha}.xlsx`);

      showMessage('Éxito', 'Excel generado correctamente', 'success', 3000);
    } catch (error) {
      console.error('Error al generar Excel:', error);
      showMessage('Error', 'Error al generar el archivo Excel', 'error', 4000);
    } finally {
      setGenerandoExcel(false);
    }
  };

  // Generar código único para insumo
  const generarCodigoUnico = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    return `INS-${timestamp}-${random}`.toUpperCase();
  };

  // Detectar tipo de insumo desde el campo TIPO DE INSUMO del Excel
  const detectarTipoInsumo = (tipoExcel) => {
    const tipoLower = String(tipoExcel || '').toLowerCase().trim();
    if (tipoLower.includes('medicamento') || tipoLower.includes('farmaceutico') || tipoLower.includes('farmacia')) {
      return 'medicamento';
    }
    return 'medico/quirurgico';
  };

  // Detectar presentación del insumo
  const detectarPresentacion = (descripcion, tipo) => {
    if (tipo === 'medico/quirurgico') {
      return 'material';
    }

    const textoLower = String(descripcion || '').toLowerCase();
    
    const mapeoMedicamento = {
      'ampolla': 'ampolla',
      'ampollas': 'ampolla',
      'tableta': 'tableta',
      'tabletas': 'tableta',
      'capsula': 'suspension',
      'capsulas': 'suspension',
      'suspension': 'suspension',
      'gotas': 'gotas',
      'crema': 'crema',
      'vial': 'vial',
      'inyectable': 'inyeccion',
      'inyeccion': 'inyeccion',
      'solucion': 'solucion_acuosa',
      'jarabe': 'solucion_oral'
    };

    for (const [key, value] of Object.entries(mapeoMedicamento)) {
      if (textoLower.includes(key)) {
        return value;
      }
    }
    
    return '';
  };

  // Registrar insumo nuevo
  const registrarInsumo = (insumo) => {
    const codigo = generarCodigoUnico();
    const tipo = detectarTipoInsumo(insumo.tipo_insumo);
    const presentacion = detectarPresentacion(insumo.descripcion, tipo);
    
    const formData = {
      codigo: codigo,
      nombre: insumo.descripcion || '',
      tipo: tipo,
      presentacion: presentacion,
      unidad_medida: 'unidad',
      cantidad_por_paquete: 1,
      descripcion: insumo.descripcion || ''
    };
    
    setFormDataRegistro(formData);
    setRegistrandoInsumo(insumo);
    setModalRegistro(true);
  };

  // Guardar insumo registrado
  const guardarInsumoRegistrado = async () => {
    if (!formDataRegistro) return;
    
    setLoadingRegistro(true);
    const { token } = user;
    
    const { postInsumo } = await import('@/servicios/insumos/post');
    const result = await postInsumo(formDataRegistro, token);
    
    if (!result.status) {
      if (result.autenticacion === 1 || result.autenticacion === 2) {
        showMessage('Error', 'Su sesión ha expirado', 'error', 4000);
        logout();
        router.replace('/');
        return;
      }
      showMessage('Error', result.mensaje, 'error', 4000);
      setLoadingRegistro(false);
      return;
    }
    
    showMessage('Éxito', 'Insumo registrado correctamente', 'success', 3000);
    setLoadingRegistro(false);
    setModalRegistro(false);
    setFormDataRegistro(null);
    setRegistrandoInsumo(null);
    
    if (registrandoInsumo && resultadosComparacion) {
      const index = resultadosComparacion.noRegistrados.findIndex(
        item => item.item === registrandoInsumo.item && item.descripcion === registrandoInsumo.descripcion
      );
      if (index !== -1) {
        moverARegistrados(index);
      }
    }
  };

  // Registrar todos los insumos no registrados en lote
  const registrarTodosLosInsumos = async () => {
    if (!resultadosComparacion || resultadosComparacion.noRegistrados.length === 0) {
      showMessage('Error', 'No hay insumos para registrar', 'error', 3000);
      return;
    }

    const confirmacion = window.confirm(
      `¿Está seguro de registrar ${resultadosComparacion.noRegistrados.length} insumo(s) automáticamente?\n\n` +
      `Se registrarán con:\n` +
      `- Código único autogenerado\n` +
      `- Tipo: detectado desde el Excel\n` +
      `- Presentación: material (médico/quirúrgico) o detectada (medicamento)\n` +
      `- Unidad de medida: unidad`
    );

    if (!confirmacion) return;

    setRegistrandoTodos(true);
    const { token } = user;
    const { postInsumo } = await import('@/servicios/insumos/post');

    let exitosos = 0;
    let fallidos = 0;
    const errores = [];

    for (const insumo of resultadosComparacion.noRegistrados) {
      try {
        const codigo = generarCodigoUnico();
        const tipo = detectarTipoInsumo(insumo.tipo_insumo);
        const presentacion = detectarPresentacion(insumo.descripcion, tipo);

        const formData = {
          codigo: codigo,
          nombre: insumo.descripcion || '',
          tipo: tipo,
          presentacion: presentacion,
          unidad_medida: 'unidad',
          cantidad_por_paquete: 1,
          descripcion: insumo.descripcion || ''
        };

        const result = await postInsumo(formData, token);

        if (!result.status) {
          if (result.autenticacion === 1 || result.autenticacion === 2) {
            showMessage('Error', 'Su sesión ha expirado', 'error', 4000);
            logout();
            router.replace('/');
            setRegistrandoTodos(false);
            return;
          }
          fallidos++;
          errores.push(`${insumo.descripcion}: ${result.mensaje}`);
        } else {
          exitosos++;
        }
      } catch (error) {
        fallidos++;
        errores.push(`${insumo.descripcion}: Error inesperado`);
      }
    }

    setRegistrandoTodos(false);

    if (fallidos === 0) {
      showMessage('Éxito', `Se registraron ${exitosos} insumo(s) correctamente`, 'success', 4000);
      setResultadosComparacion(prev => ({
        ...prev,
        noRegistrados: [],
        registrados: [
          ...prev.registrados,
          ...prev.noRegistrados.map(item => ({
            ...item,
            coincidencia: null,
            similitud: 0
          }))
        ]
      }));
    } else if (exitosos === 0) {
      showMessage('Error', `No se pudo registrar ningún insumo. Errores: ${errores.slice(0, 3).join(', ')}`, 'error', 6000);
    } else {
      showMessage('Advertencia', `Se registraron ${exitosos} insumo(s). Fallaron ${fallidos}. Revise la consola para más detalles.`, 'warning', 5000);
      console.error('Errores en registro masivo:', errores);
    }
  };

  // Función para extraer palabras clave del principio activo
  const extraerPalabrasClaveActivo = (texto) => {
    const textoLower = String(texto || '').toLowerCase();
    
    const palabrasClave = [
      'sodio', 'potasio', 'calcio', 'magnesio', 'hierro', 'zinc',
      'paracetamol', 'acetaminofen', 'ibuprofeno', 'diclofenaco', 'naproxeno', 'ketorolaco',
      'amoxicilina', 'ampicilina', 'penicilina', 'ceftriaxona', 'cefotaxima', 'ceftazidima',
      'cefalotina', 'cefazolina', 'cefuroxima', 'cefixima',
      'ciprofloxacino', 'levofloxacino', 'moxifloxacino',
      'metronidazol', 'clindamicina', 'vancomicina',
      'omeprazol', 'ranitidina', 'pantoprazol',
      'metformina', 'glibenclamida', 'insulina',
      'enalapril', 'losartan', 'amlodipino', 'atenolol', 'propranolol',
      'dexametasona', 'hidrocortisona', 'prednisona',
      'furosemida', 'espironolactona', 'hidroclorotiazida',
      'morfina', 'tramadol', 'fentanilo',
      'dipirona', 'metamizol',
      'salbutamol', 'ipratropio', 'budesonida',
      'tranexamico', 'acetilsalicilico', 'warfarina', 'heparina', 'enoxaparina'
    ];
    
    const palabrasEncontradas = [];
    for (const palabra of palabrasClave) {
      if (textoLower.includes(palabra)) {
        palabrasEncontradas.push(palabra);
      }
    }
    return palabrasEncontradas;
  };

  // Función para extraer presentación del insumo
  const extraerPresentacion = (texto) => {
    const textoLower = String(texto || '').toLowerCase();
    const presentaciones = [
      'ampolla', 'ampollas', 'tableta', 'tabletas', 'capsula', 'capsulas',
      'frasco', 'frascos', 'sobre', 'sobres', 'vial', 'viales',
      'tubo', 'tubos', 'suspension', 'solucion', 'jarabe', 'crema', 
      'gel', 'unguento', 'inyectable', 'comprimido', 'comprimidos'
    ];
    
    for (const pres of presentaciones) {
      if (textoLower.includes(pres)) {
        return pres;
      }
    }
    return null;
  };

  // Función para normalizar texto de insumos
  const normalizarInsumo = (texto) => {
    let normalizado = String(texto || '').toLowerCase().trim();
    normalizado = normalizado.replace(/[\/\-_()]/g, ' ').replace(/\s+/g, ' ').trim();
    return normalizado;
  };

  // Función para calcular similitud entre dos strings
  const calcularSimilitud = (str1, str2) => {
    const s1 = String(str1 || '').toLowerCase().trim();
    const s2 = String(str2 || '').toLowerCase().trim();
    
    if (s1 === s2) return 100;
    if (!s1 || !s2) return 0;
    
    const matrix = [];
    for (let i = 0; i <= s2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= s1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= s2.length; i++) {
      for (let j = 1; j <= s1.length; j++) {
        if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    const distance = matrix[s2.length][s1.length];
    const maxLength = Math.max(s1.length, s2.length);
    return ((maxLength - distance) / maxLength) * 100;
  };

  const compararInsumos = async () => {
    if (!archivoComparacion) {
      showMessage('Error', 'Debe seleccionar un archivo', 'error', 3000);
      return;
    }

    setComparando(true);
    try {
      const { token } = user;
      
      const response = await getInsumos(token);
      if (!response?.status || response?.status === 500) {
        if (response?.autenticacion === 1 || response?.autenticacion === 2) {
          showMessage('Error', 'Su sesión ha expirado', 'error', 4000);
          logout();
          router.replace('/');
          return;
        }
        showMessage('Error', response?.mensaje || 'Error al obtener insumos', 'error', 4000);
        return;
      }

      const insumosRegistrados = Array.isArray(response?.data) ? response.data : [];

      const arrayBuffer = await archivoComparacion.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
      
      if (jsonData.length < 5) {
        showMessage('Error', 'El archivo no tiene el formato esperado (fila 5 no encontrada)', 'error', 4000);
        return;
      }

      const headers = jsonData[4].map(h => String(h).trim());
      const itemIndex = headers.findIndex(h => h.toUpperCase().includes('ITEM'));
      const descripcionIndex = headers.findIndex(h => h.toUpperCase().includes('DESCRIPCION') || h.toUpperCase().includes('MATERIAL'));
      const tipoInsumoIndex = headers.findIndex(h => h.toUpperCase().includes('TIPO') && h.toUpperCase().includes('INSUMO'));

      if (itemIndex === -1 || descripcionIndex === -1) {
        showMessage('Error', 'No se encontraron las columnas ITEM y DESCRIPCION en la fila 5', 'error', 4000);
        return;
      }

      const insumosArchivo = jsonData.slice(5)
        .map(row => ({
          item: String(row[itemIndex] || '').trim(),
          descripcion: String(row[descripcionIndex] || '').trim(),
          tipo_insumo: tipoInsumoIndex !== -1 ? String(row[tipoInsumoIndex] || '').trim() : ''
        }))
        .filter(insumo => insumo.item || insumo.descripcion);

      const registrados = [];
      const noRegistrados = [];

      insumosArchivo.forEach(insumoArchivo => {
        let mejorCoincidencia = null;
        let mejorSimilitud = 0;

        const presentacionArchivo = extraerPresentacion(insumoArchivo.descripcion);
        const palabrasClaveArchivo = extraerPalabrasClaveActivo(insumoArchivo.descripcion);

        insumosRegistrados.forEach(insumoSistema => {
          const nombreSistema = String(insumoSistema?.nombre || '').trim();
          const codigoSistema = String(insumoSistema?.codigo || '').trim();
          
          const presentacionSistema = extraerPresentacion(nombreSistema);
          const palabrasClaveSistema = extraerPalabrasClaveActivo(nombreSistema);
          
          if (palabrasClaveArchivo.length > 0 && palabrasClaveSistema.length > 0) {
            const hayCoincidencia = palabrasClaveArchivo.some(p => palabrasClaveSistema.includes(p));
            if (!hayCoincidencia) {
              return;
            }
          }
          
          const descripcionNormalizada = normalizarInsumo(insumoArchivo.descripcion);
          const nombreNormalizado = normalizarInsumo(nombreSistema);
          
          let similitud = calcularSimilitud(descripcionNormalizada, nombreNormalizado);
          
          if (presentacionArchivo && presentacionSistema && presentacionArchivo !== presentacionSistema) {
            similitud = similitud * 0.6;
          }
          
          if (similitud > mejorSimilitud) {
            mejorSimilitud = similitud;
            mejorCoincidencia = insumoSistema;
          }
        });

        if (mejorSimilitud >= 80) {
          registrados.push({
            ...insumoArchivo,
            coincidencia: mejorCoincidencia,
            similitud: mejorSimilitud.toFixed(1)
          });
        } else {
          noRegistrados.push({
            ...insumoArchivo,
            mejorCoincidencia: mejorCoincidencia,
            similitud: mejorSimilitud.toFixed(1)
          });
        }
      });

      setResultadosComparacion({ registrados, noRegistrados });
      showMessage('Éxito', 'Comparación completada', 'success', 3000);
    } catch (error) {
      console.error('Error en comparación:', error);
      showMessage('Error', 'Error al procesar el archivo', 'error', 4000);
    } finally {
      setComparando(false);
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
                <h1 className="text-3xl font-bold text-gray-900">Comparar Insumos</h1>
                <p className="mt-2 text-sm text-gray-600">
                  Compare insumos de archivos Excel con los registrados en el sistema
                </p>
              </div>

              {/* Sección de carga de archivo */}
              {!resultadosComparacion && (
                <div className="bg-white shadow sm:rounded-lg p-6">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Archivo Excel
                    </label>
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
                        <p className="text-xs text-gray-500">
                          Archivos Excel (.xlsx, .xls)
                        </p>
                        {archivoComparacion && (
                          <p className="text-sm text-green-600 font-medium mt-2">
                            ✓ {archivoComparacion.name}
                          </p>
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
                      onClick={compararInsumos}
                      disabled={!archivoComparacion || comparando}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {comparando ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Comparando...
                        </>
                      ) : (
                        <>
                          <FileSpreadsheet className="-ml-1 mr-2 h-4 w-4" />
                          Comparar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Resultados de la comparación */}
              {resultadosComparacion && (
                <div className="bg-white shadow sm:rounded-lg p-6">
                  <div className="mb-6 flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Resultados de la Comparación</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {resultadosComparacion.registrados.length} registrados, {resultadosComparacion.noRegistrados.length} no registrados
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={generarExcelInsumosRegistrados}
                        disabled={generandoExcel || resultadosComparacion.registrados.length === 0}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {generandoExcel ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generando...
                          </>
                        ) : (
                          <>
                            <Download className="-ml-1 mr-2 h-4 w-4" />
                            Descargar Excel
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={reiniciarComparacion}
                        className="inline-flex items-center px-4 py-2 border border-blue-300 shadow-sm text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        🔄 Nueva Comparación
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Insumos Registrados */}
                    {resultadosComparacion.registrados.length > 0 && (
                      <div>
                        <h4 className="text-md font-semibold text-green-700 mb-3">✓ Insumos Registrados</h4>
                        <div className="space-y-2">
                          {resultadosComparacion.registrados.map((item, idx) => (
                            <div key={idx} className="bg-green-50 border border-green-200 rounded-md p-3">
                              <div className="flex justify-between items-start gap-3">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">{item.descripcion}</p>
                                  <p className="text-xs text-gray-500">Item: {item.item}</p>
                                  {item.coincidencia ? (
                                    <p className="text-xs text-green-600 mt-1">
                                      → Coincide con: <strong>{item.coincidencia.nombre}</strong> ({item.similitud}%)
                                    </p>
                                  ) : (
                                    <p className="text-xs text-green-600 mt-1">
                                      → Marcado manualmente como registrado
                                    </p>
                                  )}
                                </div>
                                <button
                                  onClick={() => moverANoRegistrados(idx)}
                                  className="flex-shrink-0 px-3 py-1 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors"
                                  title="Marcar como no registrado"
                                >
                                  ✗ No registrado
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Insumos No Registrados */}
                    {resultadosComparacion.noRegistrados.length > 0 && (
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-md font-semibold text-red-700">✗ Insumos No Registrados</h4>
                          <button
                            onClick={registrarTodosLosInsumos}
                            disabled={registrandoTodos}
                            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            title="Registrar todos los insumos automáticamente"
                          >
                            {registrandoTodos ? (
                              <>
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Registrando...
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4" />
                                Registrar Todos ({resultadosComparacion.noRegistrados.length})
                              </>
                            )}
                          </button>
                        </div>
                        <div className="space-y-2">
                          {resultadosComparacion.noRegistrados.map((item, idx) => (
                            <div key={idx} className="bg-red-50 border border-red-200 rounded-md p-3">
                              <div className="flex justify-between items-start gap-3">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">{item.descripcion}</p>
                                  <p className="text-xs text-gray-500">Item: {item.item}</p>
                                  {item.mejorCoincidencia && (
                                    <p className="text-xs text-gray-600 mt-1">
                                      Mejor coincidencia: {item.mejorCoincidencia.nombre} ({item.similitud}%)
                                    </p>
                                  )}
                                </div>
                                <div className="flex flex-col gap-2">
                                  <button
                                    onClick={() => moverARegistrados(idx)}
                                    className="flex-shrink-0 px-3 py-1 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-md transition-colors"
                                    title="Marcar como registrado"
                                  >
                                    ✓ Registrado
                                  </button>
                                  <button
                                    onClick={() => registrarInsumo(item)}
                                    className="flex-shrink-0 px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
                                    title="Registrar insumo en el sistema"
                                  >
                                    + Registrar
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modal de Registro de Insumo */}
      {modalRegistro && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-registro-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => !loadingRegistro && setModalRegistro(false)}></div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full z-50">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="w-full">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-registro-title">
                        Registrar Nuevo Insumo
                      </h3>
                      <button
                        onClick={() => !loadingRegistro && setModalRegistro(false)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>
                    
                    {registrandoInsumo && (
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-sm text-blue-800">
                          <strong>Del archivo:</strong> {registrandoInsumo.descripcion}
                        </p>
                        {registrandoInsumo.tipo_insumo && (
                          <p className="text-xs text-blue-600 mt-1">
                            Tipo detectado: {registrandoInsumo.tipo_insumo}
                          </p>
                        )}
                      </div>
                    )}

                    {formDataRegistro && (
                      <InsumoForm
                        id="registro-insumo-form"
                        formData={formDataRegistro}
                        onFormDataChange={setFormDataRegistro}
                        onSubmit={(e) => {
                          e.preventDefault();
                          guardarInsumoRegistrado();
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={guardarInsumoRegistrado}
                  disabled={loadingRegistro}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-blue-400"
                >
                  {loadingRegistro ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="-ml-1 mr-2 h-4 w-4" />
                      Guardar Insumo
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setModalRegistro(false)}
                  disabled={loadingRegistro}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm disabled:bg-gray-100"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

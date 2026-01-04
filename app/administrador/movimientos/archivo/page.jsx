'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, FileSpreadsheet, Save, X, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import Modal from '@/components/Modal';
import InsumoForm from '@/components/insumoForm';
import { useAuth } from '@/contexts/AuthContext';
import { postInventario } from '@/servicios/inventario/post';
import { postDespacho } from '@/servicios/despachos/post';
import { getInsumos } from '@/servicios/insumos/get';
import { provincias } from '@/constantes/provincias';

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(line => line.trim());
  if (lines.length === 0) return { headers: [], rows: [] };
  
  // Parsear CSV considerando comillas
  const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };
  
  const headers = parseCSVLine(lines[0]);
  const rows = lines.slice(1).map(line => {
    const cols = parseCSVLine(line);
    const obj = {};
    headers.forEach((h, i) => { 
      obj[h] = cols[i] ?? ''; 
    });
    return obj;
  });
  return { headers, rows };
}

function parseExcel(arrayBuffer) {
  try {
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Convertir a JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
    
    if (jsonData.length === 0) return { headers: [], rows: [] };
    
    const headers = jsonData[0].map(h => String(h).trim());
    const rows = jsonData.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = row[i] !== undefined ? String(row[i]).trim() : '';
      });
      return obj;
    });
    
    return { headers, rows };
  } catch (error) {
    console.error('Error al parsear Excel:', error);
    return { headers: [], rows: [] };
  }
}

export default function Despachos() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [invFile, setInvFile] = useState(null);
  const [despFile, setDespFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    time: null
  });
  const [comparacionModal, setComparacionModal] = useState(false);
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

  const handleInvChange = (e) => {
    const file = e.target.files?.[0] || null;
    setInvFile(file);
  };

  const handleDespChange = (e) => {
    const file = e.target.files?.[0] || null;
    setDespFile(file);
  };

  const procesarInventario = async () => {
    if (!invFile) return;
    setLoading(true);
    try {
      // TODO: enviar al backend
      console.log('[Inventario] Procesar archivo:', invFile.name);
      showMessage('Éxito', 'Archivo de inventario procesado correctamente', 'success', 3000);
    } catch (error) {
      showMessage('Error', 'Error al procesar el archivo de inventario', 'error', 4000);
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
      showMessage('Éxito', 'Archivo de despachos procesado correctamente', 'success', 3000);
    } catch (error) {
      showMessage('Error', 'Error al procesar el archivo de despachos', 'error', 4000);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = () => {
    setInvFile(null);
    setDespFile(null);
    router.push('/administrador/movimientos');
  };

  const limpiarArchivo = () => {
    setDespFile(null);
  };

  // Mover insumo de registrados a no registrados
  const moverANoRegistrados = (index) => {
    if (!resultadosComparacion) return;
    
    const insumo = resultadosComparacion.registrados[index];
    const nuevosRegistrados = resultadosComparacion.registrados.filter((_, i) => i !== index);
    const nuevosNoRegistrados = [...resultadosComparacion.noRegistrados, insumo];
    
    setResultadosComparacion({
      ...resultadosComparacion,
      registrados: nuevosRegistrados,
      noRegistrados: nuevosNoRegistrados
    });
  };

  // Mover insumo de no registrados a registrados
  const moverARegistrados = (index) => {
    if (!resultadosComparacion) return;
    
    const insumo = resultadosComparacion.noRegistrados[index];
    const nuevosNoRegistrados = resultadosComparacion.noRegistrados.filter((_, i) => i !== index);
    const nuevosRegistrados = [...resultadosComparacion.registrados, insumo];
    
    setResultadosComparacion({
      ...resultadosComparacion,
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
      // Obtener columnas de cantidad por estado
      const cantidadColumns = (provincias || [])
        .map(p => p?.nombre)
        .filter(Boolean)
        .map(nombre => `cantidad ${nombre}`);

      // Crear filas con los insumos registrados
      const rows = resultadosComparacion.registrados.map(item => {
        const row = {
          codigo: item.coincidencia?.codigo || '',
          nombre: item.coincidencia?.nombre || item.descripcion || ''
        };
        // Agregar columnas de cantidad por estado (vacías para que el usuario las llene)
        cantidadColumns.forEach(col => {
          row[col] = '';
        });
        return row;
      });

      // Crear hoja de Excel
      const worksheet = XLSX.utils.json_to_sheet(rows, {
        header: ['codigo', 'nombre', ...cantidadColumns]
      });

      // Crear libro y agregar hoja
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Insumos Registrados');

      // Descargar archivo
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
    // Si es médico/quirúrgico, siempre usar 'material'
    if (tipo === 'medico/quirurgico') {
      return 'material';
    }

    const textoLower = String(descripcion || '').toLowerCase();
    
    // Mapeo de presentaciones del Excel a las del sistema para medicamentos
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
    
    // Mover el insumo a registrados
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

    // Mostrar resultado
    if (fallidos === 0) {
      showMessage('Éxito', `Se registraron ${exitosos} insumo(s) correctamente`, 'success', 4000);
      // Limpiar lista de no registrados
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
      // Actualizar solo los exitosos (esto requeriría más lógica para identificar cuáles fallaron)
      // Por simplicidad, mostramos el mensaje y dejamos que el usuario revise
    }
  };

  // Función para extraer palabras clave del principio activo
  const extraerPalabrasClaveActivo = (texto) => {
    const textoLower = String(texto || '').toLowerCase();
    
    // Palabras que indican diferentes principios activos
    const palabrasClave = [
      // Electrolitos
      'sodio', 'potasio', 'calcio', 'magnesio', 'hierro', 'zinc',
      // Analgésicos/Antiinflamatorios
      'paracetamol', 'acetaminofen', 'ibuprofeno', 'diclofenaco', 'naproxeno', 'ketorolaco',
      // Antibióticos - Penicilinas
      'amoxicilina', 'ampicilina', 'penicilina',
      // Antibióticos - Cefalosporinas (IMPORTANTE: diferenciar cada una)
      'cefalotina', 'cefazolina', 'cefalexina', 'cefuroxima', 'ceftriaxona', 
      'ceftazidima', 'cefepime', 'cefotaxima',
      // Otros antibióticos
      'gentamicina', 'amikacina', 'vancomicina', 'clindamicina', 'metronidazol',
      'ciprofloxacina', 'levofloxacina', 'azitromicina', 'claritromicina',
      // Antidiabéticos
      'metformina', 'insulina', 'glibenclamida',
      // Antiulcerosos
      'omeprazol', 'ranitidina', 'pantoprazol', 'esomeprazol',
      // Antihipertensivos
      'losartan', 'enalapril', 'captopril', 'atenolol', 'metoprolol', 'amlodipino',
      // Anticoagulantes
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

  // Función para normalizar texto de insumos (solo limpieza ligera)
  const normalizarInsumo = (texto) => {
    let normalizado = String(texto || '').toLowerCase().trim();
    
    // Solo remover caracteres especiales y espacios múltiples
    normalizado = normalizado.replace(/[\/\-_()]/g, ' ').replace(/\s+/g, ' ').trim();
    
    return normalizado;
  };

  // Función para calcular similitud entre dos strings (Levenshtein simplificado)
  const calcularSimilitud = (str1, str2) => {
    const s1 = String(str1 || '').toLowerCase().trim();
    const s2 = String(str2 || '').toLowerCase().trim();
    
    if (s1 === s2) return 100;
    if (!s1 || !s2) return 0;
    
    // Algoritmo de Levenshtein
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
      
      // Obtener insumos del sistema
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

      // Leer archivo Excel
      const arrayBuffer = await archivoComparacion.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Convertir a JSON (la fila 5 es el índice 4 en base 0)
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
      
      if (jsonData.length < 5) {
        showMessage('Error', 'El archivo no tiene el formato esperado (fila 5 no encontrada)', 'error', 4000);
        return;
      }

      // Obtener headers de la fila 5 (índice 4)
      const headers = jsonData[4].map(h => String(h).trim());
      const itemIndex = headers.findIndex(h => h.toUpperCase().includes('ITEM'));
      const descripcionIndex = headers.findIndex(h => h.toUpperCase().includes('DESCRIPCION') || h.toUpperCase().includes('MATERIAL'));
      const tipoInsumoIndex = headers.findIndex(h => h.toUpperCase().includes('TIPO') && h.toUpperCase().includes('INSUMO'));

      if (itemIndex === -1 || descripcionIndex === -1) {
        showMessage('Error', 'No se encontraron las columnas ITEM y DESCRIPCION en la fila 5', 'error', 4000);
        return;
      }

      // Procesar filas desde la 6 en adelante (índice 5+)
      const insumosArchivo = jsonData.slice(5)
        .map(row => ({
          item: String(row[itemIndex] || '').trim(),
          descripcion: String(row[descripcionIndex] || '').trim(),
          tipo_insumo: tipoInsumoIndex !== -1 ? String(row[tipoInsumoIndex] || '').trim() : ''
        }))
        .filter(insumo => insumo.item || insumo.descripcion);

      // Comparar cada insumo del archivo con los registrados
      const registrados = [];
      const noRegistrados = [];

      insumosArchivo.forEach(insumoArchivo => {
        let mejorCoincidencia = null;
        let mejorSimilitud = 0;

        // Extraer características del insumo del archivo
        const presentacionArchivo = extraerPresentacion(insumoArchivo.descripcion);
        const palabrasClaveArchivo = extraerPalabrasClaveActivo(insumoArchivo.descripcion);

        insumosRegistrados.forEach(insumoSistema => {
          const nombreSistema = String(insumoSistema?.nombre || '').trim();
          const codigoSistema = String(insumoSistema?.codigo || '').trim();
          
          // Extraer características del insumo del sistema
          const presentacionSistema = extraerPresentacion(nombreSistema);
          const palabrasClaveSistema = extraerPalabrasClaveActivo(nombreSistema);
          
          // Verificar si las palabras clave del principio activo coinciden
          // Solo descartar si AMBOS tienen palabras clave Y son completamente diferentes
          if (palabrasClaveArchivo.length > 0 && palabrasClaveSistema.length > 0) {
            // Si ambos tienen palabras clave, verificar si tienen al menos una en común
            const coincidencias = palabrasClaveArchivo.filter(p => palabrasClaveSistema.includes(p));
            if (coincidencias.length === 0) {
              // Principios activos completamente diferentes (ej: sodio vs potasio)
              return; // Skip this comparison
            }
          }
          
          // Si ambos tienen presentación y son diferentes, penalizar la similitud
          let penalizacion = 1.0;
          if (presentacionArchivo && presentacionSistema && presentacionArchivo !== presentacionSistema) {
            // Diferentes presentaciones (ej: ampolla vs tableta) = penalización del 40%
            penalizacion = 0.6;
          }
          
          // Comparar solo con nombres (ignorar códigos completamente)
          const similitudNombre = calcularSimilitud(insumoArchivo.descripcion, nombreSistema) * penalizacion;
          
          // Comparar con nombres normalizados (solo limpieza de caracteres)
          const nombreArchivoNorm = normalizarInsumo(insumoArchivo.descripcion);
          const nombreSistemaNorm = normalizarInsumo(nombreSistema);
          const similitudNormalizada = calcularSimilitud(nombreArchivoNorm, nombreSistemaNorm) * penalizacion;
          
          // Tomar la mejor similitud entre nombre original y normalizado
          const similitud = Math.max(similitudNombre, similitudNormalizada);

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

      setResultadosComparacion({
        registrados,
        noRegistrados,
        total: insumosArchivo.length
      });

    } catch (error) {
      console.error('Error al comparar insumos:', error);
      showMessage('Error', 'Error al procesar el archivo', 'error', 4000);
    } finally {
      setComparando(false);
    }
  };

  const descargarPlantillaExcel = async () => {
    setDownloadingTemplate(true);
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

      const insumos = (Array.isArray(response?.data) ? response.data : [])
        .slice()
        .sort((a, b) => {
          const na = String(a?.nombre ?? '').trim();
          const nb = String(b?.nombre ?? '').trim();
          if (na && nb) return na.localeCompare(nb, 'es', { sensitivity: 'base' });
          if (na && !nb) return -1;
          if (!na && nb) return 1;
          const ia = String(a?.id ?? a?.insumo_id ?? '').trim();
          const ib = String(b?.id ?? b?.insumo_id ?? '').trim();
          return ia.localeCompare(ib, 'es', { sensitivity: 'base' });
        });

      const cantidadColumns = (provincias || [])
        .map(p => p?.nombre)
        .filter(Boolean)
        .map(nombre => `cantidad ${nombre}`);

      const rows = insumos.map(insumo => {
        const row = {
          id_insumo: insumo?.id ?? insumo?.insumo_id ?? '',
          nombre: insumo?.nombre ?? ''
        };
        cantidadColumns.forEach(col => {
          row[col] = '';
        });
        return row;
      });

      const worksheet = XLSX.utils.json_to_sheet(rows, {
        header: ['id_insumo', 'nombre', ...cantidadColumns]
      });
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Plantilla');
      XLSX.writeFile(workbook, 'plantilla_despachos.xlsx');
    } catch (error) {
      showMessage('Error', 'Error al generar la plantilla', 'error', 4000);
    } finally {
      setDownloadingTemplate(false);
    }
  };

  return (
    <div className="md:pl-64 flex flex-col">
      <Modal 
        isOpen={modal.isOpen} 
        onClose={closeModal} 
        title={modal.title} 
        message={modal.message} 
        type={modal.type} 
        time={modal.time}
      />
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header con botón atrás y acciones */}
          <button
            onClick={() => router.push('/administrador/movimientos')}
            className="mb-6 inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </button>
          <div className="md:flex md:items-center md:justify-between mb-6">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate">
                Nuevo Movimiento por Archivo
              </h2>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <button
                type="button"
                onClick={handleCancelar}
                disabled={loading || downloadingTemplate}
                className="ml-3 inline-flex items-center px-5 py-2.5 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={descargarPlantillaExcel}
                disabled={loading || downloadingTemplate}
                className="ml-3 inline-flex items-center px-5 py-2.5 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downloadingTemplate ? (
                  <>
                    <Upload className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Download className="-ml-1 mr-2 h-5 w-5" />
                    Descargar Plantilla
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={procesarDespachos}
                disabled={!despFile || loading || downloadingTemplate}
                className="ml-3 inline-flex items-center px-6 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesando...
                  </>
                ) : (
                  <>
                    <Upload className="-ml-1 mr-2 h-5 w-5" />
                    Procesar
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                <FileSpreadsheet className="h-5 w-5 inline-block mr-2 text-blue-500" />
                Cargar Archivo de Despachos
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Seleccione un archivo CSV o Excel para procesar los despachos
              </p>
            </div>

            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-6">

                {/* Despachos por Archivo */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                      Seleccionar archivo
                    </label>
                    {despFile && (
                      <button
                        type="button"
                        onClick={limpiarArchivo}
                        className="text-sm text-red-600 hover:text-red-800 flex items-center"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Limpiar
                      </button>
                    )}
                  </div>
                  
                  {!despFile ? (
                    // Estado inicial: zona de carga
                    <label
                      htmlFor="file-upload"
                      className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer"
                    >
                      <div className="space-y-1 text-center">
                        <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <span className="font-medium text-gray-700">Cargar un archivo</span>
                          <p className="pl-1">o arrastrar y soltar</p>
                        </div>
                        <p className="text-xs text-gray-500">CSV, XLS, XLSX hasta 10MB</p>
                      </div>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        accept=".csv,text/csv,.xlsx,.xls"
                        onChange={handleDespChange}
                        className="sr-only"
                      />
                    </label>
                  ) : (
                    // Estado con archivo cargado: confirmación en el mismo cuadro
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-green-400 bg-green-50 rounded-md transition-all">
                      <div className="space-y-3 text-center w-full">
                        <div className="flex justify-center">
                          <div className="rounded-full bg-green-100 p-3">
                            <svg className="h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-green-900">
                            Archivo cargado correctamente
                          </h3>
                        </div>
                        <div className=" rounded-md p-4 pt-0 text-left">
                          <div className="space-y-2 text-sm text-gray-700">
                            <div className="flex justify-center gap-1">
                              <span className="font-medium text-gray-500">Nombre:</span>
                              <span className="text-gray-900 font-medium">{despFile.name}</span>
                            </div>
                            <div className="flex justify-center gap-1">
                              <span className="font-medium text-gray-500">Tamaño:</span>
                              <span className="text-gray-900">{(despFile.size / 1024).toFixed(2)} KB</span>
                            </div>
                            <div className="flex justify-center gap-1">
                              <span className="font-medium text-gray-500">Tipo:</span>
                              <span className="text-gray-900">{despFile.type || 'Archivo de hoja de cálculo'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Comparación de Insumos */}
      {comparacionModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Overlay */}
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => !comparando && setComparacionModal(false)}></div>
            
            {/* Truco para centrar el modal */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            {/* Modal panel */}
            <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full z-50">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Comparar Insumos con Archivo Excel
                    </h3>
                    
                    {!resultadosComparacion ? (
                      <div className="mt-4">
                        <p className="text-sm text-gray-500 mb-4">
                          Seleccione un archivo Excel con los campos <strong>ITEM</strong> y <strong>DESCRIPCION (MATERIAL MMQ)</strong> en la fila 5.
                        </p>
                        
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Archivo Excel
                          </label>
                          <input
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={(e) => setArchivoComparacion(e.target.files[0])}
                            disabled={comparando}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                          />
                        </div>

                        {archivoComparacion && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-md">
                            <p className="text-sm text-gray-700">
                              <strong>Archivo seleccionado:</strong> {archivoComparacion.name}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-4">
                        <div className="grid grid-cols-3 gap-4 mb-6">
                          <div className="bg-blue-50 p-4 rounded-lg text-center">
                            <p className="text-2xl font-bold text-blue-600">{resultadosComparacion.total}</p>
                            <p className="text-sm text-gray-600">Total en archivo</p>
                          </div>
                          <div className="bg-green-50 p-4 rounded-lg text-center">
                            <p className="text-2xl font-bold text-green-600">{resultadosComparacion.registrados.length}</p>
                            <p className="text-sm text-gray-600">Registrados (≥80%)</p>
                          </div>
                          <div className="bg-red-50 p-4 rounded-lg text-center">
                            <p className="text-2xl font-bold text-red-600">{resultadosComparacion.noRegistrados.length}</p>
                            <p className="text-sm text-gray-600">No registrados (&lt;80%)</p>
                          </div>
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                          {/* Insumos Registrados */}
                          {resultadosComparacion.registrados.length > 0 && (
                            <div className="mb-6">
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
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {!resultadosComparacion ? (
                  <>
                    <button
                      type="button"
                      onClick={compararInsumos}
                      disabled={!archivoComparacion || comparando}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {comparando ? 'Comparando...' : 'Comparar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setComparacionModal(false);
                        setArchivoComparacion(null);
                      }}
                      disabled={comparando}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={generarExcelInsumosRegistrados}
                      disabled={generandoExcel || resultadosComparacion.registrados.length === 0}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-blue-300 shadow-sm px-4 py-2 bg-blue-50 text-base font-medium text-blue-700 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      🔄 Nueva Comparación
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setComparacionModal(false);
                        setArchivoComparacion(null);
                        setResultadosComparacion(null);
                      }}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                    >
                      Cerrar
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Registro de Insumo */}
      {modalRegistro && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-registro-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Overlay */}
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => !loadingRegistro && setModalRegistro(false)}></div>
            
            {/* Truco para centrar el modal */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            {/* Modal panel */}
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
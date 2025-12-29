'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Upload, Save, X, CheckCircle, AlertCircle, Package, Calendar, Hash, DollarSign, Info, Search, ArrowLeft, Loader2, Download } from 'lucide-react';
import ClientInsumoForm from './clientInsumoForm';
import { getInsumoById } from '@/servicios/insumos/get';
import { getInsumos } from '@/servicios/insumos/get';
import Modal from '@/components/Modal';
import MovimientoInsumoCliente from './MovimientoInsumoCliente';
import ModalSeleccionInsumo from '@/components/ModalSeleccionInsumo';
import { postInventarioDirecto } from '@/servicios/inventario/post';
import { useAuth } from '@/contexts/AuthContext';
import { postInventarioDirectoFile } from '@/servicios/inventario/post';
import * as XLSX from 'xlsx';

const Registro = () => {
  const { user, logout } = useAuth();
  const ingresoArchivoInputRef = useRef(null);
  const [selectedOption, setSelectedOption] = useState(null); // null, 'entrada', 'salida'
  const [showForm, setShowForm] = useState(false);
  const [showMovimiento, setShowMovimiento] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Estados para el flujo de entrada
  const [showInsumoModal, setShowInsumoModal] = useState(false);
  const [selectedInsumo, setSelectedInsumo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [archivoIngreso, setArchivoIngreso] = useState(null);
  const [showIngresoArchivoModal, setShowIngresoArchivoModal] = useState(false);
  const [loadingIngresoMultiple, setLoadingIngresoMultiple] = useState(false);
  const [loadingPlantillaIngreso, setLoadingPlantillaIngreso] = useState(false);

  const [formData, setFormData] = useState({
    lote_cod: '',
    fecha_vencimiento: '',
    cantidad: '',
    fecha_ingreso: new Date().toISOString().split('T')[0], // Default to today
    tipo_ingreso: 'donacion', // Default value
  });

  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info', // 'info', 'error', 'success', 'warning'
    time: null
  });

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  const showMessage = (title, message, type = 'info', time = null) => {
    setModal({ isOpen: true, title, message, type, time });
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSelectOption = (option) => {
    setSelectedOption(option);
    setShowForm(false);
    setShowMovimiento(false);
    setSelectedInsumo(null);
    setFormData({
      lote_cod: '',
      fecha_vencimiento: '',
      cantidad: '',
      fecha_ingreso: new Date().toISOString().split('T')[0],
      tipo_ingreso: 'donacion',
    });

    if (option === 'salida') {
      setShowMovimiento(true);
    } else if (option === 'entrada') {
      setShowForm(true);
    }
  };

  const handleBack = () => {
    setSelectedOption(null);
    setShowForm(false);
    setShowMovimiento(false);
    setSelectedInsumo(null);
  };

  const handleSelectInsumo = (insumo) => {
    setSelectedInsumo(insumo);
    setShowInsumoModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectArchivoIngreso = (e) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    setArchivoIngreso(file);
  };

  const handleLimpiarArchivoIngreso = () => {
    setArchivoIngreso(null);
    if (ingresoArchivoInputRef.current) {
      ingresoArchivoInputRef.current.value = '';
    }
  };

  const handleAbrirSelectorArchivoIngreso = () => {
    if (!ingresoArchivoInputRef.current) return;
    ingresoArchivoInputRef.current.value = '';
    ingresoArchivoInputRef.current.click();
  };

  const handleDescargarPlantillaIngreso = async () => {
    setLoadingPlantillaIngreso(true);
    try {
      const response = await getInsumos(user.token);
      const insumos = response?.data || [];

      const wsIngreso = XLSX.utils.json_to_sheet(
        insumos.map((i) => ({
          insumo_id: i?.id,
          nombre: i?.nombre || '',
          cantidad: '',
          numero_lote: '',
          fecha_vencimiento: '',
          fecha_ingreso: '',
          tipo_ingreso: ''
        }))
      );

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, wsIngreso, 'Plantilla Ingreso');

      const fileName = `plantilla_ingreso_insumos_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.log('Error al descargar plantilla:', error);
      setModal({
        isOpen: true,
        title: 'Error',
        message: 'No se pudo generar la plantilla',
        type: 'error',
        time: 4000
      });
    } finally {
      setLoadingPlantillaIngreso(false);
    }
  };

  const convertirFechaAFormato = (fecha) => {
    if (!fecha) return '';
    
    try {
      // Si es un número de Excel (serial date)
      if (typeof fecha === 'number') {
        const date = new Date((fecha - 25569) * 86400 * 1000);
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const year = date.getUTCFullYear();
        return `${day}/${month}/${year}`;
      }
      
      // Si es string en formato YYYY-MM-DD o similar
      const date = new Date(fecha);
      if (isNaN(date.getTime())) return fecha; // Si no es válida, devolver original
      
      const day = String(date.getUTCDate()).padStart(2, '0');
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const year = date.getUTCFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Error al convertir fecha:', error);
      return fecha;
    }
  };

  const handleEnviarIngresoMultiple = async () => {
    if (!archivoIngreso) return;

    setLoadingIngresoMultiple(true);

    try {
      const {token, hospital_id, sede_id} = user;
      
      // Leer el archivo Excel subido por el usuario
      const fileData = await archivoIngreso.arrayBuffer();
      const workbook = XLSX.read(fileData, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Filtrar solo las filas que tienen datos (cantidad > 0 o lote lleno)
      const filasConDatos = jsonData.filter(row => 
        row.cantidad && row.cantidad > 0 && row.numero_lote
      );

      if (filasConDatos.length === 0) {
        setLoadingIngresoMultiple(false);
        showMessage('Error', 'No hay datos válidos en el archivo. Asegúrate de llenar cantidad y número de lote.', 'error', 4000);
        return;
      }

      // Reorganizar las columnas al formato esperado por el backend
      const datosTransformados = filasConDatos.map(row => ({
        id_insumo: row.insumo_id,
        lote: row.numero_lote || '',
        fecha_vencimiento: convertirFechaAFormato(row.fecha_vencimiento),
        fecha_registro: convertirFechaAFormato(row.fecha_ingreso),
        tipo_ingreso: row.tipo_ingreso || 'donacion',
        cantidad: row.cantidad || 0
      }));

      // Crear nuevo archivo Excel con el formato correcto
      const wsTransformado = XLSX.utils.json_to_sheet(datosTransformados);
      const wbTransformado = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wbTransformado, wsTransformado, 'Ingreso');

      // Descargar preview del archivo transformado
      const previewFileName = `preview_ingreso_${new Date().toISOString().split('T')[0]}_${Date.now()}.xlsx`;
      XLSX.writeFile(wbTransformado, previewFileName);

      // Convertir a Blob para enviar
      const excelBuffer = XLSX.write(wbTransformado, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const archivoTransformado = new File([blob], archivoIngreso.name, { type: blob.type });

      // Enviar al backend
      const result = await postInventarioDirectoFile(token, archivoTransformado, hospital_id, sede_id);

      if(!result.status){
        if(result.autenticacion==1 || result.autenticacion==2){
          showMessage('Error', 'Su sesión ha expirado', 'error', 4000);
          logout();
          return;
        }
        setLoadingIngresoMultiple(false);
        showMessage('Error', result.mensaje || 'Error al registrar entrada', 'error', 4000);
        return;
      }
      
      setLoadingIngresoMultiple(false);
      console.log("Result: "+JSON.stringify(result.data, null, 2))
      showMessage('Éxito', result.mensaje, 'success', 3000);
      setShowIngresoArchivoModal(false);
      setArchivoIngreso(null);
    } catch (error) {
      console.error('Error al procesar el archivo:', error);
      setLoadingIngresoMultiple(false);
      showMessage('Error', 'No se pudo procesar el archivo Excel. Verifica el formato.', 'error', 4000);
    }
  };

  const handleSubmitEntrada = async (e) => {
    e.preventDefault();
    if (!selectedInsumo) {
      setModal({ isOpen: true, title: 'Error', message: 'Debe seleccionar un insumo', type: 'error', time: 3000 });
      return;
    }
    if (!formData.lote_cod || !formData.fecha_vencimiento || !formData.cantidad || !formData.fecha_ingreso) {
      setModal({ isOpen: true, title: 'Error', message: 'Todos los campos son obligatorios', type: 'error', time: 3000 });
      return;
    }

    setLoading(true);

    const payload = {
      tipo_ingreso: formData.tipo_ingreso,
      fecha_ingreso: formData.fecha_ingreso,
      sede_id: user.sede_id,
      items: [
        {
          insumo_id: selectedInsumo.id,
          cantidad: parseInt(formData.cantidad), 
          numero_lote: formData.lote_cod,
          fecha_vencimiento: formData.fecha_vencimiento
        }
      ],
      observaciones: 'Ingreso directo desde cliente' // Opcional: agregar campo en el formulario
    };

    const result = await postInventarioDirecto(payload, user.token);

    if (!result.status) {
      if (result.autenticacion === 1 || result.autenticacion === 2) {
        logout();
        return;
      }
      setLoading(false);
      setModal({ isOpen: true, title: 'Error', message: result.mensaje || 'Error al registrar entrada', type: 'error', time: 4000 });
      return;
    }
    setLoading(false);
    setModal({ isOpen: true, title: 'Éxito', message: 'Entrada registrada correctamente', type: 'success', time: 3000 });
    // Limpiar formulario
    setFormData({
      lote_cod: '',
      fecha_vencimiento: '',
      cantidad: '',
      fecha_ingreso: new Date().toISOString().split('T')[0],
      tipo_ingreso: 'donacion',
    });
    setSelectedInsumo(null);
  };

  return (
    <>
      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        time={modal.time}
      />

      <ModalSeleccionInsumo
        isOpen={showInsumoModal}
        onClose={() => setShowInsumoModal(false)}
        onSelect={handleSelectInsumo}
      />

      {showIngresoArchivoModal && isMounted && createPortal(
        <div className="fixed inset-0 z-[10001] overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={() => setShowIngresoArchivoModal(false)}
          />

          <div className="flex min-h-screen items-center justify-center p-4 text-center">
            <div
              className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center">
                  <Upload className="h-6 w-6 text-white mr-3" />
                  <h3 className="text-xl font-semibold text-white">Ingreso por archivo</h3>
                </div>
                <button
                  type="button"
                  className="rounded-md text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-white"
                  onClick={() => setShowIngresoArchivoModal(false)}
                >
                  <span className="sr-only">Cerrar</span>
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="px-6 py-5 bg-white">
                <input
                  ref={ingresoArchivoInputRef}
                  id="ingreso-archivo-input"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleSelectArchivoIngreso}
                  className="sr-only"
                />

                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">Archivo Excel *</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleDescargarPlantillaIngreso}
                      disabled={loadingPlantillaIngreso}
                      className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingPlantillaIngreso ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 mr-1" />
                      )}
                      Descargar plantilla
                    </button>

                    {archivoIngreso && (
                      <button
                        type="button"
                        onClick={handleLimpiarArchivoIngreso}
                        className="text-sm text-red-600 hover:text-red-800 flex items-center"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Quitar
                      </button>
                    )}
                  </div>
                </div>

                {!archivoIngreso ? (
                  <label
                    htmlFor="ingreso-archivo-input"
                    className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-indigo-400 hover:bg-indigo-50 transition-all cursor-pointer"
                  >
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600 justify-center">
                        <span className="font-medium text-gray-700">Cargar un archivo</span>
                        <p className="pl-1">o arrastrar y soltar</p>
                      </div>
                      <p className="text-xs text-gray-500">XLS, XLSX hasta 10MB</p>
                    </div>
                  </label>
                ) : (
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-green-400 bg-green-50 rounded-md transition-all">
                    <div className="space-y-3 text-center w-full">
                      <div className="flex justify-center">
                        <div className="rounded-full bg-green-100 p-3">
                          <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-green-900">Archivo cargado correctamente</h3>
                      </div>
                      <div className="rounded-md p-4 pt-0 text-left">
                        <div className="space-y-2 text-sm text-gray-700">
                          <div className="flex justify-center gap-1">
                            <span className="font-medium text-gray-500">Nombre:</span>
                            <span className="text-gray-900 font-medium">{archivoIngreso.name}</span>
                          </div>
                          <div className="flex justify-center gap-1">
                            <span className="font-medium text-gray-500">Tamaño:</span>
                            <span className="text-gray-900">{(archivoIngreso.size / 1024).toFixed(2)} KB</span>
                          </div>
                          <div className="flex justify-center gap-1">
                            <span className="font-medium text-gray-500">Tipo:</span>
                            <span className="text-gray-900">{archivoIngreso.type || 'Archivo de hoja de cálculo'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-center">
                        <button
                          type="button"
                          onClick={handleAbrirSelectorArchivoIngreso}
                          className="px-4 py-2 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors border border-gray-300"
                        >
                          Cambiar archivo
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowIngresoArchivoModal(false)}
                  className="px-4 py-2 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors border border-gray-300"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={handleEnviarIngresoMultiple}
                  disabled={!archivoIngreso || loadingIngresoMultiple}
                  className="flex items-center justify-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingIngresoMultiple ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Upload className="h-5 w-5" />
                  )}
                  Enviar ingreso múltiple
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      <div className="space-y-6">
        {!selectedOption ? (
          // Pantalla de selección principal
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/10">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Gestión de Inventario</h2>
              <p className="text-gray-300">Selecciona el tipo de operación que deseas realizar</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Opción Salida - Priorizada */}
              <div
                onClick={() => handleSelectOption('salida')}
                className="group relative bg-gradient-to-br from-red-500/20 to-orange-500/20 hover:from-red-500/30 hover:to-orange-500/30 border border-red-500/30 hover:border-red-500/50 rounded-2xl p-8 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="relative z-10 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-2xl flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
                    <Upload className="h-8 w-8 text-red-400 group-hover:text-red-300" />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-red-100">
                    Salida de Inventario
                  </h3>

                  <p className="text-gray-300 group-hover:text-gray-200 mb-4">
                    Registra despachos y salidas de insumos hacia otras sedes
                  </p>

                  <div className="space-y-2 text-sm text-gray-400 group-hover:text-gray-300">
                    <div className="flex items-center justify-center gap-2">
                      <Package className="h-4 w-4" />
                      <span>Despacho entre sedes</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Control por lotes</span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/80 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors">
                      <span className="font-medium">Comenzar</span>
                      <ArrowLeft className="h-4 w-4 rotate-180" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Opción Entrada */}
              <div
                onClick={() => handleSelectOption('entrada')}
                className="group relative bg-gradient-to-br from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 border border-green-500/30 hover:border-green-500/50 rounded-2xl p-8 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="relative z-10 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-2xl flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                    <Plus className="h-8 w-8 text-green-400 group-hover:text-green-300" />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-green-100">
                    Entrada de Inventario
                  </h3>

                  <p className="text-gray-300 group-hover:text-gray-200 mb-4">
                    Registra nuevos insumos que ingresan al almacén
                  </p>

                  <div className="space-y-2 text-sm text-gray-400 group-hover:text-gray-300">
                    <div className="flex items-center justify-center gap-2">
                      <Package className="h-4 w-4" />
                      <span>Nuevos insumos</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Control de fechas</span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-colors">
                      <span className="font-medium">Comenzar</span>
                      <ArrowLeft className="h-4 w-4 rotate-180" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Contenido específico según la selección
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver
                </button>
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {selectedOption === 'entrada' ? 'Registro de Entrada' : 'Registro de Salida'}
                  </h2>
                  <p className="text-sm text-gray-300">
                    {selectedOption === 'entrada'
                      ? 'Registra la entrada de nuevos artículos al inventario'
                      : 'Registra la salida de artículos del inventario'}
                  </p>
                </div>
              </div>

              {selectedOption === 'entrada' && (
                <button
                  type="button"
                  onClick={() => setShowIngresoArchivoModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/10"
                >
                  <Upload className="h-4 w-4" />
                  Ingreso por archivo
                </button>
              )}
            </div>

            {/* Contenido específico */}
            {selectedOption === 'salida' && showMovimiento && (
              <MovimientoInsumoCliente onBack={handleBack} />
            )}

            {selectedOption === 'entrada' && showForm && (
              <div className="max-w-4xl mx-auto">
                {/* Selección de Insumo */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Insumo a registrar *
                  </label>
                  <div
                    onClick={() => setShowInsumoModal(true)}
                    className="relative w-full cursor-pointer group"
                  >
                    <div className="flex items-center justify-between w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200">
                      <div className="flex items-center flex-1">
                        <Package className="h-5 w-5 text-indigo-400 mr-3" />
                        {selectedInsumo ? (
                          <div>
                            <span className="block font-medium text-white">{selectedInsumo.nombre}</span>
                            <span className="block text-sm text-gray-400">Código: {selectedInsumo.codigo}</span>
                          </div>
                        ) : (
                          <span className="text-white/50">Seleccione un insumo de la lista...</span>
                        )}
                      </div>
                      <Search className="h-5 w-5 text-white/50 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </div>

                {/* Formulario de Registro */}
                {selectedInsumo && (
                  <form onSubmit={handleSubmitEntrada} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Código de Lote */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">
                          Número de Lote *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Hash className="h-5 w-5 text-white/50" />
                          </div>
                          <input
                            type="text"
                            name="lote_cod"
                            value={formData.lote_cod}
                            onChange={handleInputChange}
                            className="block w-full rounded-lg border border-white/10 bg-transparent pl-10 pr-3 py-2.5 text-white placeholder-white/30 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                            placeholder="Ej: L-2024-001"
                          />
                        </div>
                      </div>

                      {/* Cantidad */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">
                          Cantidad *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Package className="h-5 w-5 text-white/50" />
                          </div>
                          <input
                            type="number"
                            name="cantidad"
                            value={formData.cantidad}
                            onChange={handleInputChange}
                            min="1"
                            className="block w-full rounded-lg border border-white/10 bg-transparent pl-10 pr-3 py-2.5 text-white placeholder-white/30 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                            placeholder="0"
                          />
                        </div>
                      </div>

                      {/* Fecha de Vencimiento */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">
                          Fecha de Vencimiento *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Calendar className="h-5 w-5 text-white/50" />
                          </div>
                          <input
                            type="date"
                            name="fecha_vencimiento"
                            value={formData.fecha_vencimiento}
                            onChange={handleInputChange}
                            className="block w-full rounded-lg border border-white/10 bg-transparent pl-10 pr-3 py-2.5 text-white placeholder-white/30 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors [color-scheme:dark]"
                          />
                        </div>
                      </div>

                      {/* Fecha de Ingreso */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">
                          Fecha de Ingreso *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Calendar className="h-5 w-5 text-white/50" />
                          </div>
                          <input
                            type="date"
                            name="fecha_ingreso"
                            value={formData.fecha_ingreso}
                            onChange={handleInputChange}
                            className="block w-full rounded-lg border border-white/10 bg-transparent pl-10 pr-3 py-2.5 text-white placeholder-white/30 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors [color-scheme:dark]"
                          />
                        </div>
                      </div>

                      {/* Tipo de Ingreso */}
                      <div className="space-y-2 col-span-1 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300">
                          Tipo de Ingreso *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Info className="h-5 w-5 text-white/50" />
                          </div>
                          <select
                            name="tipo_ingreso"
                            value={formData.tipo_ingreso}
                            onChange={handleInputChange}
                            className="block w-full rounded-lg border border-white/10 bg-transparent pl-10 pr-10 py-2.5 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors appearance-none"
                          >
                            <option value="ministerio" className="bg-[#1a1f2e] text-white">Ministerio</option>
                            <option value="donacion" className="bg-[#1a1f2e] text-white">Donación</option>
                            <option value="almacenado" className="bg-[#1a1f2e] text-white">Almacenado</option>
                            <option value="adquirido" className="bg-[#1a1f2e] text-white">Adquirido</option>
                            <option value="devolucion" className="bg-[#1a1f2e] text-white">Devolución</option>
                            <option value="otro" className="bg-[#1a1f2e] text-white">Otro</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-white/50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                      <button
                        type="button"
                        onClick={handleBack}
                        className="px-4 py-2 rounded-lg bg-white/5 text-white hover:bg-white/10 transition-colors border border-white/10"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Save className="h-5 w-5" />
                        )}
                        Registrar Entrada
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Registro;

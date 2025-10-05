'use client';
import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Loader2, MapPin, Package, Plus, Minus, X } from 'lucide-react';
import ModalMensaje from './ModalMensaje';
import SelectSedeModal from '@/components/SelectSedeModal';
import InsumoSelectionModalCliente from './InsumoSelectionModalCliente';
import { getSedeByHospitalId } from '@/servicios/sedes/get';
import { getInventario } from '@/servicios/inventario/get';
import { postMovimiento } from '@/servicios/despachos/post';
import { postDespachoAPaciente } from '@/servicios/pacientes/post';
import { useAuth } from '@/contexts/AuthContext';
import { createPortal } from 'react-dom';
const MovimientoInsumoCliente = ({ onBack }) => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingSedes, setLoadingSedes] = useState(false);
  const [loadingInsumos, setLoadingInsumos] = useState(false);
  const [sedes, setSedes] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [sedeDestino, setSedeDestino] = useState(null);
  const [showSedeModal, setShowSedeModal] = useState(false);
  const [insumosSeleccionados, setInsumosSeleccionados] = useState([]);
  const [observaciones, setObservaciones] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoDespacho, setTipoDespacho] = useState('sede'); // 'sede' o 'paciente'
  const [datosPaciente, setDatosPaciente] = useState({
    nombres: '',
    apellidos: '',
    cedula: '',
  });
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    time: null
  });

  const showMessage = (title, message, type = 'info', time = null) => {
    setModal({ isOpen: true, title, message, type, time });
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleTipoDespachoChange = (tipo) => {
    setTipoDespacho(tipo);
    // Limpiar datos según el tipo
    if (tipo === 'sede') {
      setDatosPaciente({
        nombres: '',
        apellidos: '',
        cedula: ''});
      setInsumosSeleccionados([]);
    } else {
      setInsumosSeleccionados([]);
      setSedeDestino(null);
    }
  };

  const handleDatosPacienteChange = (field, value) => {
    setDatosPaciente(prev => ({
      ...prev,
      [field]: value
    }));
  };

  useEffect(() => {
    if (user?.hospital_id) {
      fetchSedes();
    }
    if (user?.sede_id) {
      fetchInsumos();
    }
  }, []);

  const fetchSedes = async () => {
    setLoadingSedes(true);
      const { token, hospital_id } = user;
      const response = await getSedeByHospitalId(hospital_id, token);
      
      if (!response.status) {
        if (response.autenticacion === 1 || response.autenticacion === 2) {
          showMessage('Error', 'Su sesión ha expirado', 'error', 4000);
          logout();
          return;
        }
        showMessage('Error', response.mensaje || 'Error al cargar sedes', 'error', 4000);
        return;
      }

      if (response.data && response.data.data) {
        // Filtrar sedes excluyendo la sede actual
        const sedesDisponibles = response.data.data.filter(sede => sede.id !== user.sede_id);
        setSedes(sedesDisponibles);
      }
      setLoadingSedes(false);
  };

  const fetchInsumos = async () => {
    setLoadingInsumos(true);
      const { token, sede_id } = user;
      const response = await getInventario(token, sede_id);
      console.log("Response Insumos: "+JSON.stringify(response, null, 2));
      if (!response.status) {
        setLoadingInsumos(false);
        if (response.autenticacion === 1 || response.autenticacion === 2) {
          showMessage('Error', 'Su sesión ha expirado', 'error', 4000);
          logout();
          return;
        }
        // showMessage('Error', response.mensaje || 'Error al cargar inventario', 'error', 4000);
        return;
      }

      if (response.data && Array.isArray(response.data)) {
        // Transformar datos para el componente
        const insumosConLotes = response.data
          .filter(item => item.cantidad_total > 0) // Solo insumos con stock
          .map(item => ({
            id: item.id || item.insumo_id,
            nombre: item?.insumo?.nombre || 'Sin nombre',
            codigo: item.codigo || item.insumo?.codigo || 'Sin código',
            cantidad_total: item.cantidad_total || 0,
            lotes: (item.lotes || []).filter(lote => lote.cantidad > 0).map(lote => ({
              ...lote,
              cantidad_seleccionada: 0
            }))
          }));
        setInsumos(insumosConLotes);
      }
      setLoadingInsumos(false);
  };

  const handleSelectSede = (sede) => {
    setSedeDestino(sede);
    setShowSedeModal(false);
    showMessage('Éxito', `Sede destino seleccionada: ${sede.nombre}`, 'success', 2000);
  };

  const handleAddInsumo = () => {
    setIsModalOpen(true);
  };

  const handleSelectInsumo = (insumo) => {
    // Verificar si el insumo ya está seleccionado
    const yaSeleccionado = insumosSeleccionados.find(i => i.id === insumo.id);
    
    if (yaSeleccionado) {
      showMessage('Advertencia', 'Este insumo ya está seleccionado', 'warning', 2000);
      return;
    }

    // Agregar insumo con la cantidad y lotes que vienen del modal
    const nuevoInsumo = {
      id: insumo.id,
      nombre: insumo.nombre,
      codigo: insumo.codigo,
      cantidad: insumo.cantidad || 0, // Usar la cantidad del modal
      lotes: insumo.lotes || [] // Usar los lotes del modal
    };

    setInsumosSeleccionados(prev => [...prev, nuevoInsumo]);
    setIsModalOpen(false);
    setSearchTerm('');
  };

  const handleRemoveInsumo = (insumoId) => {
    setInsumosSeleccionados(prev => prev.filter(i => i.id !== insumoId));
  };

  const handleUpdateInsumoLotes = (insumoId, lotes) => {
    setInsumosSeleccionados(prev => 
      prev.map(insumo => {
        if (insumo.id === insumoId) {
          const cantidadTotal = lotes.reduce((sum, lote) => sum + (lote.cantidad || 0), 0);
          return {
            ...insumo,
            lotes: lotes,
            cantidad: cantidadTotal
          };
        }
        return insumo;
      })
    );
  };


  const handleSubmit = async () => {
    // Validar según el tipo de despacho
    if (tipoDespacho === 'sede') {
      if (!sedeDestino) {
        showMessage('Error', 'Debe seleccionar una sede destino', 'error', 3000);
        return;
      }
    } else if (tipoDespacho === 'paciente') {
      // Validar datos del paciente
      const camposRequeridos = ['nombres', 'apellidos', 'cedula'];
      const camposFaltantes = camposRequeridos.filter(campo => !datosPaciente[campo].trim());
      
      if (camposFaltantes.length > 0) {
        showMessage('Error', `Debe completar los siguientes campos: ${camposFaltantes.join(', ')}`, 'error', 3000);
        return;
      }
    }

    // Validar que hay insumos seleccionados con cantidades
    const itemsParaEnviar = insumosSeleccionados.flatMap(insumo =>
      (insumo.lotes || [])
        .filter(lote => lote.cantidad > 0)
        .map(lote => ({
          lote_id: lote.lote_id,
          cantidad: lote.cantidad
        }))
    );

    if (itemsParaEnviar.length === 0) {
      showMessage('Error', 'Debe seleccionar al menos un insumo con cantidad mayor a 0', 'error', 3000);
      return;
    }

    setLoading(true);
      const { token, sede_id, hospital_id, sede } = user;
      
      let dataSend;
      let response;
      
      if (tipoDespacho === 'sede') {
        // Estructura para despacho a sede
        dataSend = {
          origen_hospital_id: hospital_id,
          origen_sede_id: sede_id,
          destino_hospital_id: hospital_id,
          destino_sede_id: sedeDestino.id,
          origen_almacen_tipo: sede.tipo_almacen,
          destino_almacen_tipo: sedeDestino.tipo_almacen,
          tipo_movimiento: 'despacho',
          fecha_despacho: new Date().toISOString().split('T')[0],
          observaciones: observaciones,
          items: itemsParaEnviar
        };
        
        console.log('Datos despacho a sede:', JSON.stringify(dataSend, null, 2));
        response = await postMovimiento(token, dataSend);
        
      } else if (tipoDespacho === 'paciente') {
        // Estructura para despacho a paciente (salida definitiva)
        dataSend = {
          hospital_id: hospital_id,
          sede_id: sede_id,
          tipo_movimiento: 'salida_paciente',
          fecha_despacho: new Date().toISOString().split('T')[0],
          observaciones: observaciones,
          paciente_nombres: datosPaciente.nombres,
          paciente_apellidos: datosPaciente.apellidos,
          paciente_cedula: datosPaciente.cedula,
          items: itemsParaEnviar
        };
        
        console.log('Datos despacho a paciente:', JSON.stringify(dataSend, null, 2));
        // Usar servicio específico para despacho a paciente
        response = await postDespachoAPaciente(token, dataSend);
      }
      
      if (!response.status) {
        setLoading(false);
        if (response.autenticacion === 1 || response.autenticacion === 2) {
          showMessage('Error', 'Su sesión ha expirado', 'error', 4000);
          logout();
          return;
        }
        showMessage('Error', response.mensaje || 'Error al crear el despacho', 'error', 4000);
        return;
      }

      const mensajeExito = tipoDespacho === 'sede' 
        ? 'Despacho a sede creado exitosamente' 
        : 'Despacho a paciente registrado exitosamente';
      showMessage('Éxito', mensajeExito, 'success', 3000);
      
      // Resetear formulario
      setSedeDestino(null);
      setInsumosSeleccionados([]);
      setObservaciones('');
      setDatosPaciente({
        nombres: '',
        apellidos: '',
        cedula: ''
      });
      fetchInsumos(); // Recargar inventario actualizado
      setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Selector de Tipo de Despacho */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Package className="h-5 w-5" />
          Tipo de Despacho
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleTipoDespachoChange('sede')}
            className={`p-4 rounded-lg border-2 transition-all ${
              tipoDespacho === 'sede'
                ? 'border-purple-400 bg-purple-500/20 text-white'
                : 'border-white/20 bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            <div className="text-center">
              <MapPin className="h-8 w-8 mx-auto mb-2" />
              <div className="font-medium">Despacho a Sede</div>
              <div className="text-sm opacity-80">Transferir a otra sede del hospital</div>
            </div>
          </button>
          
          <button
            onClick={() => handleTipoDespachoChange('paciente')}
            className={`p-4 rounded-lg border-2 transition-all ${
              tipoDespacho === 'paciente'
                ? 'border-green-400 bg-green-500/20 text-white'
                : 'border-white/20 bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            <div className="text-center">
              <Package className="h-8 w-8 mx-auto mb-2" />
              <div className="font-medium">Despacho a Paciente</div>
              <div className="text-sm opacity-80">Salida definitiva del almacén</div>
            </div>
          </button>
        </div>
      </div>

      {/* Selección de Sede Destino - Solo si es despacho a sede */}
      {tipoDespacho === 'sede' && (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Sede Destino
          </h3>
        
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Sede Seleccionada
            </label>
            <input
              type="text"
              value={sedeDestino?.nombre || ''}
              readOnly
              placeholder="Seleccione una sede destino..."
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 cursor-pointer"
              onClick={() => setShowSedeModal(true)}
            />
          </div>
          
          <button
            onClick={() => setShowSedeModal(true)}
            disabled={loadingSedes}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            {loadingSedes ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MapPin className="h-4 w-4" />
            )}
            Seleccionar
          </button>
        </div>
        </div>
      )}

      {/* Formulario de Datos del Paciente - Solo si es despacho a paciente */}
      {tipoDespacho === 'paciente' && (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Package className="h-5 w-5" />
            Datos del Paciente
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nombres *
              </label>
              <input
                type="text"
                value={datosPaciente.nombres}
                onChange={(e) => handleDatosPacienteChange('nombres', e.target.value)}
                placeholder="Nombres del paciente"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Apellidos *
              </label>
              <input
                type="text"
                value={datosPaciente.apellidos}
                onChange={(e) => handleDatosPacienteChange('apellidos', e.target.value)}
                placeholder="Apellidos del paciente"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cédula *
              </label>
              <input
                type="text"
                value={datosPaciente.cedula}
                onChange={(e) => handleDatosPacienteChange('cedula', e.target.value)}
                placeholder="Número de cédula"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
              />
            </div>
            
            {/* <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                value={datosPaciente.telefono}
                onChange={(e) => handleDatosPacienteChange('telefono', e.target.value)}
                placeholder="Número de teléfono"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
              />
            </div> */}
            
            {/* <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Edad
              </label>
              <input
                type="number"
                value={datosPaciente.edad}
                onChange={(e) => handleDatosPacienteChange('edad', e.target.value)}
                placeholder="Edad del paciente"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Género
              </label>
              <select
                value={datosPaciente.genero}
                onChange={(e) => handleDatosPacienteChange('genero', e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              >
                <option value="">Seleccionar género</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Dirección
              </label>
              <input
                type="text"
                value={datosPaciente.direccion}
                onChange={(e) => handleDatosPacienteChange('direccion', e.target.value)}
                placeholder="Dirección del paciente"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Diagnóstico
              </label>
              <textarea
                value={datosPaciente.diagnostico}
                onChange={(e) => handleDatosPacienteChange('diagnostico', e.target.value)}
                placeholder="Diagnóstico o motivo del despacho"
                rows="3"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
              />
            </div> */}
          </div>
        </div>
      )}

      {/* Selección de Insumos */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Package className="h-5 w-5" />
            Insumos a Despachar
          </h3>
          {insumosSeleccionados.length > 0 && (
            <button
              onClick={handleAddInsumo}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Plus className="h-4 w-4 mr-1" />
              Agregar Insumo
            </button>
          )}
        </div>

        {insumosSeleccionados.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-white/20 rounded-xl">
            <Package className="mx-auto h-12 w-12 text-white/70" />
            <h4 className="mt-2 text-lg font-medium text-white/70">No hay insumos seleccionados</h4>
            <p className="mt-1 text-sm text-white/40">
              Comienza agregando insumos para el despacho
            </p>
            <div className="mt-6">
              <button
                onClick={handleAddInsumo}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="h-5 w-5 mr-2" />
                Agregar Insumo
              </button>
            </div>
          </div>
        ) : (
          <div className="border border-white/20 rounded-lg bg-white/10">
            <ul className="divide-y divide-white/10">
              {insumosSeleccionados.map((item, idx) => (
                <li key={item.id ?? idx} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">{item.nombre ?? 'Insumo'}</div>
                      <div className="text-sm font-semibold text-white/50 mt-1">
                        Cantidad total: <span className="text-white">{item.cantidad} unidades</span>
                      </div>
                      
                      {/* Mostrar distribución de lotes si existe */}
                      {item.lotes && item.lotes.length > 0 && (
                        <div className="mt-3 p-3 bg-blue-500/70 rounded-md">
                          <h6 className="text-xs font-medium text-white/70 mb-2">Distribución por lotes:</h6>
                          <div className="space-y-1">
                            {item.lotes.map((lote, loteIdx) => (
                              <div key={loteIdx} className="flex justify-between text-xs text-blue-100">
                                <span>Lote {lote.numero_lote}</span>
                                <span>{lote.cantidad} unidades</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => handleRemoveInsumo(item.id)}
                      className="ml-4 inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Observaciones */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Observaciones</h3>
        <textarea
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          placeholder="Observaciones adicionales (opcional)..."
          rows={3}
          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Botones de Acción */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/10">
        <div className="flex justify-end gap-4">
          <button
            onClick={onBack}
            className="px-6 py-2 bg-gray-400 hover:bg-gray-500 text-white border border-gray-500 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              loading || 
              insumosSeleccionados.length === 0 ||
              (tipoDespacho === 'sede' && !sedeDestino) ||
              (tipoDespacho === 'paciente' && (!datosPaciente.nombres || !datosPaciente.apellidos || !datosPaciente.cedula))
            }
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {loading ? 'Procesando...' : 'Crear Despacho'}
          </button>
        </div>
      </div>

      {/* Modal de Selección de Sedes */}
      {showSedeModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[10002] overflow-y-auto">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 bg-opacity-50 transition-opacity"
            onClick={() => setShowSedeModal(false)}
          />

          {/* Modal */}
          <div className="flex min-h-screen items-center justify-center p-4 text-center">
            <div 
              className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Seleccionar Sede Destino</h3>
                
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {sedes.map(sede => (
                    <button
                      key={sede.id}
                      onClick={() => handleSelectSede(sede)}
                      className="w-full text-left p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <div className="text-gray-800 font-medium">{sede.nombre}</div>
                      <div className="text-gray-400 text-sm">Tipo: {sede.tipo_almacen}</div>
                    </button>
                  ))}
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => setShowSedeModal(false)}
                    className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal de Selección de Insumos */}
      <InsumoSelectionModalCliente
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSearchTerm(''); }}
        onSelectInsumo={handleSelectInsumo}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        insumos={insumos}
      />

      {/* Modal de Mensajes */}
      <ModalMensaje
        isOpen={modal.isOpen}
        onClose={closeModal}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        time={modal.time}
      />
    </div>
  );
};

export default MovimientoInsumoCliente;

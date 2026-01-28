'use client';

import { useState, useEffect } from 'react';
import { Package, CheckCircle, AlertCircle, Clock, Search, Truck, CheckCircle2, CheckCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getMovimientosRecepcion, getMovimientos } from '@/servicios/despachos/get';
import { useRouter } from 'next/navigation';
import Modal from '@/components/Modal';
import ModalDetallesRecepcion from './ModalDetallesRecepcion';
import ModalRegistroRecepcion from './ModalRegistroRecepcion';
import ModalMensaje from './ModalMensaje';
import { postMovimientosRecepcion } from '@/servicios/despachos/post';
import { postRepartidorSeguimiento } from '@/servicios/repartidor/post';

const Recepcion = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [recepciones, setRecepciones] = useState([]);
  const [tipoVista, setTipoVista] = useState('recepcion'); // 'recepcion', 'despacho'
  const [paginacion, setPaginacion] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info', // 'info', 'error', 'success', 'warning'
    time: null
  });
  const [modalDetalles, setModalDetalles] = useState({
    isOpen: false,
    recepcion: null
  });
  const [modalRegistrar, setModalRegistrar] = useState({
    isOpen: false,
    recepcion: null,
    insumosRecibidos: {} // {insumoId: {recibido: boolean, lotes: {loteId: {recibido: boolean, cantidadRecibida: number}}}, lotesManuales: [{numero_lote, fecha_vencimiento, cantidadRecibida}]}}
  });
  const showMessage = (title, message, type = 'info', time = null) => {
    setModal({ isOpen: true, title, message, type, time });
  };

  const agregarLineaLoteManual = (insumoId) => {
    setModalRegistrar(prev => {
      const insumoActual = prev.insumosRecibidos?.[insumoId];
      const lotesManuales = Array.isArray(insumoActual?.lotesManuales) ? insumoActual.lotesManuales : [];
      return {
        ...prev,
        insumosRecibidos: {
          ...prev.insumosRecibidos,
          [insumoId]: {
            ...insumoActual,
            lotesManuales: [
              ...lotesManuales,
              { numero_lote: '', fecha_vencimiento: '', cantidadRecibida: 0 }
            ]
          }
        }
      };
    });
  };

  const actualizarLineaLoteManual = (insumoId, index, campo, valor) => {
    setModalRegistrar(prev => {
      const insumoActual = prev.insumosRecibidos?.[insumoId];
      const lotesManuales = Array.isArray(insumoActual?.lotesManuales) ? [...insumoActual.lotesManuales] : [];
      if (!lotesManuales[index]) return prev;
      lotesManuales[index] = {
        ...lotesManuales[index],
        [campo]: campo === 'cantidadRecibida' ? (parseInt(valor) || 0) : valor
      };
      return {
        ...prev,
        insumosRecibidos: {
          ...prev.insumosRecibidos,
          [insumoId]: {
            ...insumoActual,
            lotesManuales
          }
        }
      };
    });
  };

  const eliminarLineaLoteManual = (insumoId, index) => {
    setModalRegistrar(prev => {
      const insumoActual = prev.insumosRecibidos?.[insumoId];
      const lotesManuales = Array.isArray(insumoActual?.lotesManuales) ? [...insumoActual.lotesManuales] : [];
      if (index < 0 || index >= lotesManuales.length) return prev;
      lotesManuales.splice(index, 1);
      return {
        ...prev,
        insumosRecibidos: {
          ...prev.insumosRecibidos,
          [insumoId]: {
            ...insumoActual,
            lotesManuales
          }
        }
      };
    });
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  const actualizarCantidadInsumo = (insumoId, nuevaCantidad) => {
    setModalRegistrar(prev => {
      const cantidadNumerica = parseInt(nuevaCantidad) || 0;
      const insumoActual = prev.insumosRecibidos?.[insumoId];
      if (!insumoActual) return prev;

      let recibido = insumoActual.recibido;
      if (cantidadNumerica > 0 && !recibido) recibido = true;

      return {
        ...prev,
        insumosRecibidos: {
          ...prev.insumosRecibidos,
          [insumoId]: {
            ...insumoActual,
            recibido,
            cantidadRecibida: cantidadNumerica
          }
        }
      };
    });
  };

  const abrirModalDetalles = (recepcion) => {
    setModalDetalles({
      isOpen: true,
      recepcion: recepcion
    });
  };

  const cerrarModalDetalles = () => {
    setModalDetalles({
      isOpen: false,
      recepcion: null
    });
  };

  const abrirModalRegistrar = (recepcion) => {
    // Inicializar el estado de insumos recibidos (todos marcados por defecto)
    const insumosRecibidos = {};

    const tipoAlmacen = user?.sede?.tipo_almacen;

    if (tipoAlmacen === 'almacenAUS') {
      // En almacenAUS los lotes no son reales, por lo tanto se ignoran por completo.
      // Se trabaja solo con cantidades por insumo.
      const lotes = Array.isArray(recepcion?.lotes_grupos) ? recepcion.lotes_grupos : [];

      const insumosAgrupados = lotes.reduce((acc, loteGrupo) => {
        const insumoId = loteGrupo?.lote?.insumo?.id;
        if (!insumoId) return acc;
        if (!acc[insumoId]) {
          acc[insumoId] = {
            insumo: loteGrupo?.lote?.insumo,
            total: 0
          };
        }
        acc[insumoId].total += loteGrupo?.cantidad_salida || 0;
        return acc;
      }, {});

      Object.keys(insumosAgrupados).forEach(insumoId => {
        const item = insumosAgrupados[insumoId];
        const total = item?.total || 0;
        insumosRecibidos[insumoId] = {
          recibido: total > 0,
          cantidadOriginal: total,
          cantidadRecibida: total,
          lotes: {},
          lotesManuales: [],
          insumo: item?.insumo
        };
      });

      setModalRegistrar({
        isOpen: true,
        recepcion: recepcion,
        insumosRecibidos: insumosRecibidos
      });
      return;
    }

    if (recepcion.lotes_grupos) {
      // Si el movimiento viene con lotes pero su origen es un almacenAUS y
      // la sede del usuario es almacenPrin (sede central), entonces no
      // mostramos los lotes "fake" y permitimos capturar lotes manuales.
      const esOrigenAUS = recepcion?.origen_sede?.tipo_almacen === 'almacenAUS';
      if (tipoAlmacen === 'almacenPrin' && esOrigenAUS) {
        // Agrupar por insumo y crear una entrada manual por insumo con la cantidad total
        const insumosAgrupados = recepcion.lotes_grupos.reduce((acc, loteGrupo) => {
          const insumoId = loteGrupo?.lote?.insumo?.id;
          if (!acc[insumoId]) {
            acc[insumoId] = {
              insumo: loteGrupo?.lote?.insumo,
              total: 0
            };
          }
          acc[insumoId].total += loteGrupo.cantidad_salida || 0;
          return acc;
        }, {});

        Object.keys(insumosAgrupados).forEach(insumoId => {
          const item = insumosAgrupados[insumoId];
          insumosRecibidos[insumoId] = {
            recibido: true,
            lotes: {},
            lotesManuales: [
              { numero_lote: '', fecha_vencimiento: '', cantidadRecibida: item.total || 0 }
            ],
            insumo: item.insumo
          };
        });
      } else {
        // Agrupar por insumo
        const insumosAgrupados = recepcion.lotes_grupos.reduce((acc, loteGrupo) => {
          const insumoId = loteGrupo?.lote?.insumo?.id;
          if (!acc[insumoId]) {
            acc[insumoId] = {
              insumo: loteGrupo?.lote?.insumo,
              lotes: []
            };
          }
          acc[insumoId].lotes.push(loteGrupo);
          return acc;
        }, {});

        // Marcar todos como recibidos por defecto con cantidades originales
        Object.keys(insumosAgrupados).forEach(insumoId => {
          insumosRecibidos[insumoId] = {
            recibido: true,
            lotes: {},
            lotesManuales: []
          };
          insumosAgrupados[insumoId].lotes.forEach(loteGrupo => {
            insumosRecibidos[insumoId].lotes[loteGrupo.lote.id] = {
              recibido: true,
              cantidadRecibida: loteGrupo.cantidad_salida || 0
            };
          });
        });
      }
    } else if (tipoAlmacen === 'almacenPrin') {
      // Nuevo flujo: movimientos pueden venir sin lotes/fechas.
      // En almacenPrin permitimos capturar lotes manualmente por insumo.
      const candidatos = [
        recepcion?.insumos,
        recepcion?.insumos_detalle,
        recepcion?.detalle_insumos,
        recepcion?.items_detalle,
        recepcion?.items
      ];
      const listaInsumos = candidatos.find(arr => Array.isArray(arr)) || [];

      listaInsumos.forEach((item, idx) => {
        const insumoObj = item?.insumo || item?.producto || item;
        const insumoId = item?.insumo_id || insumoObj?.id || idx;
        insumosRecibidos[insumoId] = {
          recibido: true,
          lotes: {},
          lotesManuales: [
            {
              numero_lote: '',
              fecha_vencimiento: '',
              cantidadRecibida: item?.cantidad_salida || item?.cantidad || 0
            }
          ],
          insumo: {
            id: insumoId,
            nombre: insumoObj?.nombre,
            codigo: insumoObj?.codigo,
            tipo: insumoObj?.tipo
          }
        };
      });
    }

    setModalRegistrar({
      isOpen: true,
      recepcion: recepcion,
      insumosRecibidos: insumosRecibidos
    });
  };

  const cerrarModalRegistrar = () => {
    setModalRegistrar({
      isOpen: false,
      recepcion: null,
      insumosRecibidos: {}
    });
  };

  const toggleInsumoRegistrar = (insumoId) => {
    setModalRegistrar(prev => {
      const insumoActual = prev.insumosRecibidos[insumoId];
      const nuevoEstadoInsumo = !insumoActual?.recibido;

      const tipoAlmacen = user?.sede?.tipo_almacen;
      if (tipoAlmacen === 'almacenAUS') {
        return {
          ...prev,
          insumosRecibidos: {
            ...prev.insumosRecibidos,
            [insumoId]: {
              ...insumoActual,
              recibido: nuevoEstadoInsumo,
              cantidadRecibida: nuevoEstadoInsumo ? (insumoActual?.cantidadOriginal || 0) : 0
            }
          }
        };
      }

      // Si se deselecciona el insumo padre, deseleccionar todos los lotes hijos
      const nuevosLotes = { ...insumoActual?.lotes };
      if (!nuevoEstadoInsumo) {
        // Deseleccionar todos los lotes del insumo
        Object.keys(nuevosLotes).forEach(loteId => {
          nuevosLotes[loteId] = {
            ...nuevosLotes[loteId],
            recibido: false,
            cantidadRecibida: 0
          };
        });
      } else {
        // Si se selecciona el insumo padre, restaurar todos los lotes con cantidades originales
        Object.keys(nuevosLotes).forEach(loteId => {
          // Buscar la cantidad original del lote
          const recepcion = prev.recepcion;
          if (recepcion?.lotes_grupos) {
            const loteOriginal = recepcion.lotes_grupos.find(lg =>
              lg.lote?.id?.toString() === loteId && lg.lote?.insumo?.id?.toString() === insumoId
            );
            if (loteOriginal) {
              nuevosLotes[loteId] = {
                ...nuevosLotes[loteId],
                recibido: true,
                cantidadRecibida: loteOriginal.cantidad_salida || 0
              };
            }
          }
        });
      }

      return {
        ...prev,
        insumosRecibidos: {
          ...prev.insumosRecibidos,
          [insumoId]: {
            ...insumoActual,
            recibido: nuevoEstadoInsumo,
            lotes: nuevosLotes
          }
        }
      };
    });
  };

  const toggleLoteRegistrar = (insumoId, loteId) => {
    setModalRegistrar(prev => {
      const loteActual = prev.insumosRecibidos[insumoId]?.lotes?.[loteId];
      const nuevoEstadoLote = !loteActual?.recibido;

      let nuevaCantidad = 0;

      // Si se deselecciona el lote, cantidad = 0
      if (!nuevoEstadoLote) {
        nuevaCantidad = 0;
      } else {
        // Si se selecciona, restaurar cantidad original de la consulta
        const recepcion = prev.recepcion;
        if (recepcion?.lotes_grupos) {
          const loteOriginal = recepcion.lotes_grupos.find(lg =>
            lg.lote?.id?.toString() === loteId.toString() && lg.lote?.insumo?.id?.toString() === insumoId.toString()
          );
          if (loteOriginal) {
            nuevaCantidad = loteOriginal.cantidad_salida || 0;
          }
        }
      }

      return {
        ...prev,
        insumosRecibidos: {
          ...prev.insumosRecibidos,
          [insumoId]: {
            ...prev.insumosRecibidos[insumoId],
            lotes: {
              ...prev.insumosRecibidos[insumoId]?.lotes,
              [loteId]: {
                ...loteActual,
                recibido: nuevoEstadoLote,
                cantidadRecibida: nuevaCantidad
              }
            }
          }
        }
      };
    });
  };

  const actualizarCantidadLote = (insumoId, loteId, nuevaCantidad) => {
    setModalRegistrar(prev => {
      const cantidadNumerica = parseInt(nuevaCantidad) || 0;

      // Solo cambiar el estado del checkbox si la cantidad es > 0 y estaba deseleccionado
      let nuevoEstadoRecibido = prev.insumosRecibidos[insumoId]?.lotes?.[loteId]?.recibido;
      if (cantidadNumerica > 0 && !nuevoEstadoRecibido) {
        nuevoEstadoRecibido = true;
      }
      // No deseleccionar automáticamente cuando la cantidad es 0
      // Eso debe hacerse solo con el checkbox

      return {
        ...prev,
        insumosRecibidos: {
          ...prev.insumosRecibidos,
          [insumoId]: {
            ...prev.insumosRecibidos[insumoId],
            lotes: {
              ...prev.insumosRecibidos[insumoId]?.lotes,
              [loteId]: {
                ...prev.insumosRecibidos[insumoId]?.lotes?.[loteId],
                recibido: nuevoEstadoRecibido,
                cantidadRecibida: cantidadNumerica
              }
            }
          }
        }
      };
    });
  };


  const generarArrayEnvio = () => {
    const { insumosRecibidos, recepcion } = modalRegistrar;
    const items = [];

    const tipoAlmacen = user?.sede?.tipo_almacen;
    if (tipoAlmacen === 'almacenAUS') {
      const lotesGrupos = Array.isArray(recepcion?.lotes_grupos) ? recepcion.lotes_grupos : [];

      Object.keys(insumosRecibidos).forEach(insumoId => {
        const insumo = insumosRecibidos[insumoId];
        const cantidadObjetivo = insumo?.recibido ? (parseInt(insumo?.cantidadRecibida) || 0) : 0;

        const lotesDelInsumo = lotesGrupos.filter(lg =>
          lg?.lote?.insumo?.id?.toString() === insumoId.toString()
        );

        let restante = cantidadObjetivo;
        lotesDelInsumo.forEach(lg => {
          const maxEnviado = lg?.cantidad_salida || 0;
          const asignada = cantidadObjetivo > 0 ? Math.min(restante, maxEnviado) : 0;
          restante = Math.max(0, restante - asignada);

          items.push({
            lote_id: parseInt(lg?.lote?.id),
            cantidad: asignada
          });
        });
      });

      const fechaActual = new Date().toISOString().split('T')[0];
      return {
        movimiento_stock_id: recepcion?.id || null,
        fecha_recepcion: fechaActual,
        user_id_receptor: user?.id || null,
        items: items
      };
    }

    // Recorrer todos los insumos y sus lotes para generar los items
    Object.keys(insumosRecibidos).forEach(insumoId => {
      const insumo = insumosRecibidos[insumoId];
      if (insumo.lotes) {
        Object.keys(insumo.lotes).forEach(loteId => {
          const lote = insumo.lotes[loteId];

          // Agregar al array de items usando lote_id (incluso si cantidad es 0)
          items.push({
            lote_id: parseInt(loteId),
            cantidad: lote.cantidadRecibida || 0
          });
        });
      }

      if (Array.isArray(insumo?.lotesManuales)) {
        insumo.lotesManuales.forEach(lm => {
          items.push({
            insumo_id: parseInt(insumoId),
            numero_lote: lm?.numero_lote || '',
            fecha_vencimiento: lm?.fecha_vencimiento || '',
            cantidad: lm?.cantidadRecibida || 0
          });
        });
      }
    });

    // Generar fecha actual en formato YYYY-MM-DD
    const fechaActual = new Date().toISOString().split('T')[0];

    // Estructura final del objeto de envío
    const datosEnvio = {
      movimiento_stock_id: recepcion?.id || null,
      fecha_recepcion: fechaActual,
      user_id_receptor: user?.id || null,
      items: items
    };

    return datosEnvio;
  };

  const confirmarRegistro = async () => {
    setLoading(true);
    const datosEnvio = generarArrayEnvio();
    const { token } = user;
    console.log('Datos a enviar:', JSON.stringify(datosEnvio, null, 2));
    const response = await postMovimientosRecepcion(token, datosEnvio);
    // console.log('Response postMovimientosRecepcion:', JSON.stringify(response, null, 2));
    if (!response.status) {
      if (response.autenticacion == 1 || response.autenticacion == 2) {
        showMessage('Error', 'Su sesión ha expirado', 'error', 4000);
        logout();
        router.replace('/');
        setLoading(false);
        return;
      }
      showMessage('Error', response.mensaje || 'Error en la solicitud', 'error', 10000);
      setLoading(false);
      return;
    }

    // Éxito - cerrar modal y mostrar mensaje
    setModalRegistrar({
      isOpen: false,
      recepcion: null,
      insumosRecibidos: {}
    });

    // Recargar la lista de recepciones
    handleRecepciones();

    showMessage('Éxito', response.mensaje, 'success', 3000);
    setLoading(false);
  };

  const updateStatusMovimiento = async (movimientoStockId) => {
    const { token } = user;
    const data =
    {
      "movimiento_stock_id": movimientoStockId,
      "estado": "despachado",
      "observaciones": "Despachado al usuario"
    }
    const response = await postRepartidorSeguimiento(token, data);
    if (!response.status) {
      if (response.autenticacion == 1 || response.autenticacion == 2) {
        showMessage('Error', 'Su sesión ha expirado', 'error', 4000);
        logout();
        router.replace('/');
        return;
      }
      showMessage('Error', response.mensaje || 'Error en la solicitud', 'error', 4000);
      return;
    }
    showMessage('Éxito', response.mensaje, 'success', 3000);
    handleRecepciones();
  };

  useEffect(() => {
    if (user) {
      handleRecepciones();
    }
  }, [tipoVista]);

  const handleRecepciones = async (page = 1) => {
    setLoading(true);
    const { token, sede_id } = user;
    let response;

    try {
      if (tipoVista === 'recepcion') {
        response = await getMovimientosRecepcion(token, sede_id, page);
      } else if (tipoVista === 'despacho') {
        response = await getMovimientos(token, sede_id);
      }

      if (!response.status) {
        if (response.autenticacion == 1 || response.autenticacion == 2) {
          showMessage('Error', 'Su sesión ha expirado', 'error', 4000);
          logout();
          router.replace('/');
          return;
        }
        showMessage('Error', response.mensaje || 'Error en la solicitud', 'error', 4000);
        return;
      }

      if (response.data) {
        // Para recepciones (con paginación)
        if (response.data.data) {
          setRecepciones(response.data.data);
          setPaginacion({
            currentPage: response.data.current_page || page,
            totalPages: response.data.last_page || 1,
            totalItems: response.data.total || 0,
            itemsPerPage: response.data.per_page || 10
          });
        } else {
          // Para despachos (sin paginación)
          setRecepciones(response.data);
          setPaginacion({
            currentPage: 1,
            totalPages: 1,
            totalItems: response.data.length || 0,
            itemsPerPage: response.data.length || 0
          });
        }
      }
    } catch (error) {
      console.log('Error en handleRecepciones:', error);
      showMessage('Error', 'Error de conexión', 'error', 4000);
    } finally {
      setLoading(false);
    }
  };

  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= paginacion.totalPages) {
      handleRecepciones(nuevaPagina);
    }
  };

  const paginaAnterior = () => {
    if (paginacion.currentPage > 1) {
      cambiarPagina(paginacion.currentPage - 1);
    }
  };

  const paginaSiguiente = () => {
    if (paginacion.currentPage < paginacion.totalPages) {
      cambiarPagina(paginacion.currentPage + 1);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pendiente: {
        bg: 'bg-yellow-100 text-yellow-800',
        icon: <Clock className="h-4 w-4" />,
        label: 'Pendiente'
      },
      despachado: {
        bg: 'bg-purple-100 text-purple-700',
        icon: <Truck className="h-4 w-4" />,
        label: 'Despachado'
      },
      entregado: {
        bg: 'bg-blue-100 text-blue-800',
        icon: <CheckCircle2 className="h-4 w-4" />,
        label: 'Entregado'
      },
      en_camino: {
        bg: 'bg-pink-100 text-pink-800',
        icon: <Truck className="h-4 w-4" />,
        label: 'En Camino'
      },
      recibido: {
        bg: 'bg-green-100 text-green-800',
        icon: <CheckCheck className="h-4 w-4" />,
        label: 'Recibido'
      },
      con_incidencias: {
        bg: 'bg-red-100 text-red-800',
        icon: <AlertCircle className="h-4 w-4" />,
        label: 'Con Incidencias'
      }
    };

    const config = statusConfig[status] || statusConfig.pendiente;

    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${config.bg}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/10 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <h2 className="text-xl font-semibold text-white">
            {tipoVista === 'recepcion' ? 'Recepción de Movimientos' :
              'Despachos Realizados'}
          </h2>

          {/* Selector de tipo de vista */}
          <div className="flex w-full md:w-auto overflow-x-auto bg-white/5 rounded-lg p-1 border border-white/20 no-scrollbar">
            <button
              onClick={() => setTipoVista('recepcion')}
              className={`flex-1 md:flex-none whitespace-nowrap px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${tipoVista === 'recepcion'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
            >
              Recepciones
            </button>
            <button
              onClick={() => setTipoVista('despacho')}
              className={`flex-1 md:flex-none whitespace-nowrap px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${tipoVista === 'despacho'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
            >
              Despachos
            </button>
          </div>
        </div>

        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder={`Buscar ${tipoVista === 'recepcion' ? 'recepción' :
                'despacho'
              }...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className=" w-full">
          <thead className="bg-white/5">
            <tr className="bg-white/15">
              {!loading && recepciones.length !== 0 && (
                <>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {tipoVista === 'recepcion' ? 'ID Recepción' :
                      tipoVista === 'despacho' ? 'ID Despacho' :
                        'ID Despacho'}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Fecha/Hora
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {tipoVista === 'recepcion' ? 'Origen' :
                      'Sede Destino'}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Items
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Acciones</span>
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="bg-white/5 ">
            {loading ? (
              <tr className="w-full">
                <td colSpan="6" className="px-6 py-12 text-center w-full">
                  <div className="flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4"></div>
                    <p className="text-white/70">Cargando {
                      tipoVista === 'recepcion' ? 'recepciones' :
                        'despachos'
                    }...</p>
                  </div>
                </td>
              </tr>
            ) : recepciones.length === 0 ? (
              <tr className="w-full">
                <td colSpan="6" className="px-6 py-12 text-center">
                  <p className="text-white/50">No se encontraron {
                    tipoVista === 'recepcion' ? 'recepciones' :
                      'despachos'
                  }</p>
                </td>
              </tr>
            ) : (
              recepciones.map((recepcion, index) => {
                return (
                  <tr key={recepcion.id || index} className="hover:bg-white/5">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {recepcion.codigo_grupo || recepcion.id || `MOV-${index + 1}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                      {formatDate(recepcion.fecha_despacho)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                      {tipoVista === 'recepcion'
                        ? (recepcion.origen_hospital?.nombre || recepcion.origen || 'N/A')
                        : (recepcion.destino_sede?.nombre || recepcion.destino || 'N/A')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getStatusBadge(recepcion.estado)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                      {recepcion.lotes_grupos?.length || recepcion.items || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                      {recepcion.cantidad_salida_total || recepcion.total || recepcion.cantidad_total_items || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {/* <button 
                    onClick={() => updateStatusMovimiento(recepcion.id)}
                    className="text-white bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded cursor-pointer hover:text-white mr-3"
                  >
                    Cambiar
                  </button> */}
                      <button
                        onClick={() => {
                          abrirModalDetalles(recepcion);
                        }}
                        className="text-white bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded cursor-pointer hover:text-white mr-3"
                      >
                        Detalles
                      </button>

                      {(() => {
                        const esAUSaCentral =
                          recepcion?.origen_sede?.tipo_almacen === 'almacenAUS' &&
                          recepcion?.destino_sede?.tipo_almacen === 'almacenPrin';

                        const bloquearRegistrarPorAUS = tipoVista === 'despacho' && esAUSaCentral;

                        const puedeRegistrarBase =
                          recepcion.estado === 'entregado' ||
                          (user?.sede?.tipo_almacen !== 'almacenPrin' && recepcion.estado === 'despachado' && !recepcion.paciente_nombres) ||
                          (recepcion.estado === 'pendiente' && user?.sede?.hospital_id);

                        return puedeRegistrarBase && !bloquearRegistrarPorAUS;
                      })() && (
                        <button
                          onClick={() => abrirModalRegistrar(recepcion)}
                          className="text-green-400 hover:text-green-300"
                        >
                          Registrar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>


      {/* Paginación - Solo para recepciones */}
      {paginacion.totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={paginaAnterior}
              disabled={paginacion.currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={paginaSiguiente}
              disabled={paginacion.currentPage === paginacion.totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{(paginacion.currentPage - 1) * paginacion.itemsPerPage + 1}</span> a{' '}
                <span className="font-medium">{Math.min(paginacion.currentPage * paginacion.itemsPerPage, paginacion.totalItems)}</span> de{' '}
                <span className="font-medium">{paginacion.totalItems}</span> resultados
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={paginaAnterior}
                  disabled={paginacion.currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>

                {/* Páginas numeradas */}
                {Array.from({ length: Math.min(5, paginacion.totalPages) }, (_, i) => {
                  let pageNum;
                  if (paginacion.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (paginacion.currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (paginacion.currentPage >= paginacion.totalPages - 2) {
                    pageNum = paginacion.totalPages - 4 + i;
                  } else {
                    pageNum = paginacion.currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => cambiarPagina(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${pageNum === paginacion.currentPage
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={paginaSiguiente}
                  disabled={paginacion.currentPage === paginacion.totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Modal para mensajes */}
      <ModalMensaje
        isOpen={modal.isOpen}
        onClose={closeModal}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        time={modal.time}
      />

      {/* Modal de Detalles */}
      <ModalDetallesRecepcion
        isOpen={modalDetalles.isOpen}
        recepcion={modalDetalles.recepcion}
        onClose={cerrarModalDetalles}
        formatDate={formatDate}
        userSedeTipo={user?.sede?.tipo_almacen}
      />

      {/* Modal de Registro */}
      <ModalRegistroRecepcion
        isOpen={modalRegistrar.isOpen}
        recepcion={modalRegistrar.recepcion}
        insumosRecibidos={modalRegistrar.insumosRecibidos}
        onClose={cerrarModalRegistrar}
        onToggleInsumo={toggleInsumoRegistrar}
        onToggleLote={toggleLoteRegistrar}
        onUpdateCantidad={actualizarCantidadLote}
        onUpdateCantidadInsumo={actualizarCantidadInsumo}
        onAddManualLote={agregarLineaLoteManual}
        onUpdateManualLote={actualizarLineaLoteManual}
        onConfirmar={confirmarRegistro}
        formatDate={formatDate}
        loading={loading}
        userSedeTipo={user?.sede?.tipo_almacen}
        onRemoveManualLote={eliminarLineaLoteManual}
      />
    </div>
  );
};

export default Recepcion;

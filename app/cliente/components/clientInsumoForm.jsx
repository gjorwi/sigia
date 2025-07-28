

export default function ClientInsumoForm (
  {
    id,
    handleNewInsumoSubmit,
    handleNewInsumoChange,
    newInsumoFormData,
    newInsumoErrors,
    showCantidadPorPaquete,
    insumoTipos,
    insumoMedida,
    setShowForm,
    activeTab
  }) {
  return (
    <form id={id} onSubmit={handleNewInsumoSubmit} className="divide-y divide-gray-200">
      <div className="px-4 py-5 sm:p-6">
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6 text-white">
          {/* Codigo */}
          <div className="sm:col-span-3">
            <label htmlFor="codigo" className="block text-sm font-medium text-white">
              Codigo *
            </label>
            <div className="mt-1">
              <input
                type="text"
                placeholder="Ej: camposjose@gmail.com"
                id="codigo"
                name="codigo"
                value={newInsumoFormData?.codigo}
                onChange={handleNewInsumoChange}
                className={`block w-full px-4 py-2 text-base border placeholder-white/50 ${
                  newInsumoErrors.codigo
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                } rounded-md shadow-sm transition duration-150 ease-in-out`}
              />
              {newInsumoErrors.codigo && (
                <p className="mt-1 text-sm text-red-600">{newInsumoErrors.codigo}</p>
              )}
            </div>
          </div>
          {/* Nombre */}
          <div className="sm:col-span-3">
            <label htmlFor="nombre" className="block text-sm font-medium text-white">
              Nombre *
            </label>
            <div className="mt-1">
              <input
                type="text"
                placeholder="Ej: Jose"
                id="nombre"
                name="nombre"
                value={newInsumoFormData?.nombre}
                onChange={handleNewInsumoChange}
                className={`block w-full px-4 py-2 text-base border placeholder-white/50 ${
                  newInsumoErrors.nombre
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                } rounded-md shadow-sm transition duration-150 ease-in-out`}
              />
              {newInsumoErrors.nombre && (
                <p className="mt-1 text-sm text-red-600">{newInsumoErrors.nombre}</p>
              )}
            </div>
          </div>
          {/* Tipo */}
          <div className="sm:col-span-3">
            <label htmlFor="tipo" className="block text-sm font-medium text-white">
              Tipo *
            </label>
            <select
              id="tipo"
              name="tipo"
              value={newInsumoFormData?.tipo}
              onChange={handleNewInsumoChange}
              className={`block w-full px-4 capitalize py-2 text-white text-base border ${
                newInsumoErrors.tipo
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              } rounded-md shadow-sm transition duration-150 ease-in-out`}
            >
              <option value="" className="text-gray-700">Seleccione...</option>
              {insumoTipos.map((tipo) => (
                <option key={tipo.id} value={tipo.nombre} className="capitalize text-gray-700">
                  {tipo.nombre}
                </option>
              ))}
            </select>
            {newInsumoErrors.tipo && (
              <p className="mt-1 text-sm text-red-600">{newInsumoErrors.tipo}</p>
            )}
          </div>
          {/* Medida */}
          <div className="sm:col-span-3">
            <label htmlFor="medida" className="block text-sm font-medium text-white">
              Unidad de Medida *
            </label>
            <select
              id="medida"
              name="medida"
              value={newInsumoFormData?.medida}
              onChange={handleNewInsumoChange}
              className={`block w-full px-4 py-2 text-base border  text-white placeholder-white/50 ${
                newInsumoErrors.medida
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              } rounded-md shadow-sm transition duration-150 ease-in-out`}
            >
              <option value="" className={'text-gray-700'}>Seleccione...</option>
              {insumoMedida.map((medida) => (
                <option key={medida.id} value={medida.nombre} className="text-gray-700 capitalize">
                  {medida.nombre}
                </option>
              ))}
            </select>
            {newInsumoErrors.medida && (
              <p className="mt-1 text-sm text-red-600">{newInsumoErrors.medida}</p>
            )}
          </div>
          {/* Cantidad por paquete (solo visible para caja/paquete) */}
          {showCantidadPorPaquete && (
            <div className="sm:col-span-3">
              <label htmlFor="cantidadPorPaquete" className="block text-sm font-medium text-white">
                Cantidad por {newInsumoFormData.medida.toLowerCase()}
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                id="cantidadPorPaquete"
                name="cantidadPorPaquete"
                value={newInsumoFormData?.cantidadPorPaquete || ''}
                placeholder="1"
                onChange={(e) => {
                  // Solo permite números
                  if (e.target.value === '' || /^\d+$/.test(e.target.value)) {
                    handleNewInsumoChange({
                      target: {
                        name: 'cantidadPorPaquete',
                        value: e.target.value === '' ? '' : parseInt(e.target.value, 10)
                      }
                    });
                  }
                }}
                className={`mt-1 block w-full px-3 py-2 border text-left ${
                  newInsumoErrors.cantidadPorPaquete
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                } rounded-md shadow-sm`}
              />
              {newInsumoErrors.cantidadPorPaquete && (
                <p className="mt-1 text-sm text-red-600">{newInsumoErrors.cantidadPorPaquete}</p>
              )}
            </div>
          )}
          {/* Descripcion */}
          <div className="sm:col-span-3">
            <label htmlFor="descripcion" className="block text-sm font-medium text-white">
              Descripción *
            </label>
            <div className="mt-1">
              <textarea
                placeholder="Ej: Jose"
                id="descripcion"
                name="descripcion"
                value={newInsumoFormData?.descripcion}
                onChange={handleNewInsumoChange}
                className={`block w-full px-4 py-2 text-base border placeholder-white/50 ${
                  newInsumoErrors.descripcion 
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                } rounded-md shadow-sm transition duration-150 ease-in-out`}
              />
              {newInsumoErrors.descripcion && (
                <p className="mt-1 text-sm text-red-600">{newInsumoErrors.descripcion}</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
    </form>
  )
}

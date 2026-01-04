'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, FileSpreadsheet } from 'lucide-react';

export default function Herramientas() {
  const router = useRouter();

  const herramientas = [
    {
      nombre: 'Comparar Insumos',
      descripcion: 'Compare insumos de archivos Excel con los registrados en el sistema',
      icono: FileSpreadsheet,
      ruta: '/administrador/herramientas/comparar-insumos',
      color: 'bg-blue-500'
    }
  ];

  return (
    <div className="md:pl-64 flex flex-col">
      <div className="flex-1 flex flex-col">
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
             

              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Herramientas</h1>
                <p className="mt-2 text-sm text-gray-600">
                  Utilidades y herramientas para facilitar la gestión del sistema
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {herramientas.map((herramienta, idx) => (
                  <div
                    key={idx}
                    onClick={() => router.push(herramienta.ruta)}
                    className="relative group bg-white overflow-hidden shadow rounded-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-blue-400"
                  >
                    <div className="p-6">
                      <div className="inline-flex p-3 rounded-lg bg-blue-50 mb-4">
                        <herramienta.icono className="h-8 w-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {herramienta.nombre}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {herramienta.descripcion}
                      </p>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

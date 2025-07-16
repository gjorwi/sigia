'use client';
import dynamic from 'next/dynamic';
import { Warehouse } from 'lucide-react';

const WarehouseMap = dynamic(
    () => import('@/components/WarehouseMap'),
    { ssr: false }
);

export default function Mapa() {
    return (
        <div className="md:pl-64 flex flex-col">
          <main className="flex-1 p-4">
            <WarehouseMap />
            <div className="bg-gray-50 p-4 rounded-lg mt-4">
              <h4 className="font-medium text-gray-900 mb-2">Resumen de Almacenes</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-3 rounded-lg shadow border border-green-100">
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-green-100 text-green-600 mr-3">
                      <Warehouse className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Almacén Central</p>
                      <p className="font-semibold text-green-600">Inventario Alto</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg shadow border border-yellow-100">
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-yellow-100 text-yellow-600 mr-3">
                      <Warehouse className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Almacén Norte</p>
                      <p className="font-semibold text-yellow-600">Inventario Medio</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg shadow border border-red-100">
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-red-100 text-red-600 mr-3">
                      <Warehouse className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Almacén Este</p>
                      <p className="font-semibold text-red-600">Inventario Bajo</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
    );
}
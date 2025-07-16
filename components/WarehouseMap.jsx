'use client';

import dynamic from 'next/dynamic';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import { isBrowser, defaultCenter, defaultZoom, warehouses, getMarkerColor } from '@/utils/mapUtils';

// Dynamic import for client-side only components
const MapComponent = dynamic(
  () => import('react-leaflet').then((mod) => {
    // Set up default icon for markers
    const DefaultIcon = L.icon({
      iconUrl: '/images/marker-icon.png',
      iconRetinaUrl: '/images/marker-icon-2x.png',
      shadowUrl: '/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = DefaultIcon;
    
    return mod;
  }),
  { ssr: false }
);

// Custom hospital icon component
const HospitalIcon = ({ color = 'blue' }) => {
  const colorVariants = {
    green: 'text-green-500',
    red: 'text-red-500',
    yellow: 'text-yellow-500',
    blue: 'text-blue-500',
  };

  return (
    <div className="relative">
      <div className={`w-10 h-10 rounded-full bg-white border-2 border-${color}-500 flex items-center justify-center shadow-md`}>
        <svg 
          className={`w-5 h-5 ${colorVariants[color] || 'text-blue-500'}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" 
          />
        </svg>
      </div>
      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full border border-gray-300 flex items-center justify-center">
        <span className="text-xs font-bold text-gray-700">1</span>
      </div>
    </div>
  );
};

const WarehouseMap = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !isBrowser) {
    return (
      <div className="h-[600px] w-full rounded-lg bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Cargando mapa...</p>
      </div>
    );
  }

  return (
    <div className="h-[600px] w-full rounded-lg overflow-hidden border border-gray-200 shadow-sm">
      <div className="p-4 bg-white border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Ubicación de Almacenes en Venezuela</h3>
        <p className="text-sm text-gray-600">Visualización de almacenes por nivel de inventario</p>
      </div>
      <MapContainer 
        center={defaultCenter} 
        zoom={defaultZoom}
        style={{ height: 'calc(100% - 80px)', width: '100%' }}
        className="z-0"
        zoomControl={true}
        scrollWheelZoom={true}
        minZoom={6}
        maxBounds={[
          [0.5, -74], // Southwest coordinates of Venezuela
          [13, -59]   // Northeast coordinates of Venezuela
        ]}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {warehouses.map((warehouse) => {
          const { color, text } = getMarkerColor(warehouse.inventory);
          const colorClass = text.replace('text-', 'bg-').replace('-600', '-100').replace('border-', 'border-');
          
          return (
            <Marker 
              key={warehouse.id} 
              position={[warehouse.lat, warehouse.lng]}
              icon={L.divIcon({
                html: `
                  <div class="relative group">
                    <div class="w-10 h-10 rounded-full ${colorClass} border-2 border-gray-900 flex items-center justify-center shadow-md transform transition-transform group-hover:scale-110">
                      <svg class="w-5 h-5 text-${color}-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div class="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full border-2 border-gray-900 flex items-center justify-center">
                      <span class="text-xs font-bold text-gray-600">${warehouse.id}</span>
                    </div>
                    <div class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                      ${warehouse.name}
                      <div class="absolute bottom-0 left-1/2 w-2 h-2 bg-gray-800 transform -translate-x-1/2 translate-y-1/2 rotate-45"></div>
                    </div>
                  </div>
                `,
                className: 'bg-transparent border-none',
                iconSize: [40, 40],
                iconAnchor: [20, 40],
                popupAnchor: [0, -40],
                tooltipAnchor: [0, -20]
              })}
            >
              <Popup>
                <div className="text-sm min-w-[200px]">
                  <h3 className="font-bold text-base">{warehouse.name}</h3>
                  <div className="border-t border-gray-200 my-2"></div>
                  <p className="mt-1">
                    <span className="font-medium">Ciudad:</span> {warehouse.city}
                  </p>
                  <p className="mt-1">
                    <span className="font-medium">Estado:</span> {warehouse.region}
                  </p>
                  <p className="mt-1">
                    <span className="font-medium">Inventario:</span>{' '}
                    <span className={`font-semibold ${text}`}>
                      {warehouse.inventory}
                    </span>
                  </p>
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500">ID: {warehouse.id}</p>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      <div className="p-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex justify-between items-center">
        <div className="flex space-x-4">
          <div className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>
            <span>Alto</span>
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-yellow-500 mr-1"></span>
            <span>Medio</span>
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-red-500 mr-1"></span>
            <span>Bajo</span>
          </div>
        </div>
        <div>
          <span className="text-xs">Haz clic en un marcador para más detalles</span>
        </div>
      </div>
    </div>
  );
};

export default WarehouseMap;

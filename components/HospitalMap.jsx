'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useState, useEffect } from 'react';
import L from 'leaflet';
import { Hospital } from 'lucide-react';

// Fix for default markers in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/images/marker-icon-2x.png',
  iconUrl: '/images/marker-icon.png',
  shadowUrl: '/images/marker-shadow.png',
});

// Create custom hospital icon
const createHospitalIcon = () => {
  return L.divIcon({
    html: `<div style="
      background-color: #dc2626;
      width: 32px;
      height: 32px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    ">
      <div style="
        transform: rotate(45deg);
        color: white;
        font-size: 16px;
        font-weight: bold;
      ">H</div>
    </div>`,
    className: 'custom-hospital-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

export default function HospitalMap({ hospitales, center = [10.4806, -66.9036], zoom = 6 }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-gray-500">Cargando mapa...</div>
      </div>
    );
  }

  // Convert coordinates to decimal format
  const convertToDecimal = (coord) => {
    if (typeof coord !== 'number') return 0;
    
    // If the coordinate is very large, convert it to decimal degrees
    if (Math.abs(coord) > 180) {
      return coord / 1000000;
    }
    return coord;
  };

  // Filter hospitals that have valid coordinates
  const validHospitals = hospitales?.filter(hospital => 
    hospital.ubicacion && 
    hospital.ubicacion.lat && 
    hospital.ubicacion.lng &&
    !isNaN(convertToDecimal(hospital.ubicacion.lat)) &&
    !isNaN(convertToDecimal(hospital.ubicacion.lng))
  ) || [];

  // Calculate center if there are valid hospitals
  const mapCenter = validHospitals.length > 0 
    ? [
        validHospitals.reduce((sum, h) => sum + convertToDecimal(h.ubicacion.lat), 0) / validHospitals.length,
        validHospitals.reduce((sum, h) => sum + convertToDecimal(h.ubicacion.lng), 0) / validHospitals.length
      ]
    : center;

  const hospitalIcon = createHospitalIcon();

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden border border-gray-200">
      <MapContainer
        center={mapCenter}
        zoom={validHospitals.length > 0 ? 8 : zoom}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {validHospitals.map((hospital) => {
          const lat = convertToDecimal(hospital.ubicacion.lat);
          const lng = convertToDecimal(hospital.ubicacion.lng);
          
          return (
            <Marker
              key={hospital.id}
              position={[lat, lng]}
              icon={hospitalIcon}
            >
              <Popup>
                <div className="p-3 min-w-[250px]">
                  <div className="flex items-center mb-3">
                    <Hospital className="h-5 w-5 text-red-600 mr-2" />
                    <h3 className="font-semibold text-lg">{hospital.nombre}</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex">
                      <span className="font-medium w-16">RIF:</span>
                      <span>{hospital.rif}</span>
                    </div>
                    <div className="flex">
                      <span className="font-medium w-16">Dirección:</span>
                      <span>{hospital.direccion}</span>
                    </div>
                    <div className="flex">
                      <span className="font-medium w-16">Teléfono:</span>
                      <span>{hospital.telefono}</span>
                    </div>
                    <div className="flex">
                      <span className="font-medium w-16">Email:</span>
                      <span className="text-blue-600 hover:underline">{hospital.email}</span>
                    </div>
                    <div className="flex">
                      <span className="font-medium w-16">Tipo:</span>
                      <span>{hospital.tipo}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium w-16">Estado:</span>
                      <span className={`ml-1 px-2 py-1 rounded text-xs font-medium ${
                        hospital.estado === 'Activo' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {hospital.estado}
                      </span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      {validHospitals.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-90">
          <div className="text-center">
            <Hospital className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No hay hospitales con coordenadas válidas para mostrar en el mapa</p>
          </div>
        </div>
      )}
    </div>
  );
}

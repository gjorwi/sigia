/**
 * Script para generar municipios.js y parroquias.js con IDs como slugs
 * Ejecutar con: node scripts/generateConstantes.js
 */

const fs = require('fs');
const path = require('path');

// Función para convertir texto a slug (minúscula, sin acentos)
function toSlug(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

// Leer archivos originales
const municipiosPath = path.join(__dirname, '..', 'constantes', 'municipios.js');
const parroquiasPath = path.join(__dirname, '..', 'constantes', 'parroquias.js');

// Parsear el archivo de municipios
const municipiosContent = fs.readFileSync(municipiosPath, 'utf8');
const municipiosMatch = municipiosContent.match(/export const municipios = \[([\s\S]*?)\];/);

if (!municipiosMatch) {
  console.error('No se pudo parsear municipios.js');
  process.exit(1);
}

// Extraer municipios como objetos
const municipiosRaw = municipiosMatch[1];
const municipioRegex = /\{\s*id:\s*'([^']+)',\s*nombre:\s*'([^']+)',\s*provinciaId:\s*'([^']+)'\s*\}/g;

const municipios = [];
const municipioIdMap = {}; // Mapeo de id viejo -> id nuevo
let match;

while ((match = municipioRegex.exec(municipiosRaw)) !== null) {
  const [, oldId, nombre, provinciaId] = match;
  const newId = toSlug(nombre);
  
  // Si ya existe un municipio con el mismo slug, agregar sufijo del estado
  let finalId = newId;
  const existingWithSameSlug = municipios.find(m => m.id === newId && m.provinciaId !== provinciaId);
  if (existingWithSameSlug) {
    finalId = `${newId} ${provinciaId}`;
  }
  
  // Verificar si ya existe exactamente el mismo id
  while (municipios.find(m => m.id === finalId)) {
    finalId = `${newId} ${provinciaId}`;
    if (municipios.find(m => m.id === finalId)) {
      // Agregar número si aún hay conflicto
      let counter = 2;
      while (municipios.find(m => m.id === `${finalId} ${counter}`)) {
        counter++;
      }
      finalId = `${finalId} ${counter}`;
    }
    break;
  }
  
  municipioIdMap[oldId] = finalId;
  municipios.push({
    id: finalId,
    nombre,
    provinciaId
  });
}

console.log(`Procesados ${municipios.length} municipios`);

// Generar nuevo municipios.js
let newMunicipiosContent = 'export const municipios = [\n';

// Agrupar por provinciaId para mantener comentarios
const provinciaNames = {
  'distrito capital': 'Distrito Capital',
  'amazonas': 'Amazonas',
  'anzoategui': 'Anzoátegui',
  'apure': 'Apure',
  'aragua': 'Aragua',
  'barinas': 'Barinas',
  'bolivar': 'Bolívar',
  'carabobo': 'Carabobo',
  'cojedes': 'Cojedes',
  'delta amacuro': 'Delta Amacuro',
  'falcon': 'Falcón',
  'guarico': 'Guárico',
  'lara': 'Lara',
  'merida': 'Mérida',
  'miranda': 'Miranda',
  'monagas': 'Monagas',
  'nueva esparta': 'Nueva Esparta',
  'portuguesa': 'Portuguesa',
  'sucre': 'Sucre',
  'tachira': 'Táchira',
  'trujillo': 'Trujillo',
  'vargas': 'Vargas',
  'yaracuy': 'Yaracuy',
  'zulia': 'Zulia',
  'dependencias federales': 'Dependencias Federales',
  'guayana esequiba': 'Guayana Esequiba'
};

let currentProvincia = null;
for (const mun of municipios) {
  if (mun.provinciaId !== currentProvincia) {
    if (currentProvincia !== null) {
      newMunicipiosContent += '\n';
    }
    currentProvincia = mun.provinciaId;
    newMunicipiosContent += `  // ${provinciaNames[mun.provinciaId] || mun.provinciaId}\n`;
  }
  newMunicipiosContent += `  { id: '${mun.id}', nombre: '${mun.nombre}', provinciaId: '${mun.provinciaId}' },\n`;
}

newMunicipiosContent += '];\n';

// Guardar municipios.js
fs.writeFileSync(municipiosPath, newMunicipiosContent, 'utf8');
console.log('municipios.js actualizado');

// Ahora procesar parroquias
const parroquiasContent = fs.readFileSync(parroquiasPath, 'utf8');
const parroquiasMatch = parroquiasContent.match(/export const parroquias = \[([\s\S]*?)\];/);

if (!parroquiasMatch) {
  console.error('No se pudo parsear parroquias.js');
  process.exit(1);
}

const parroquiasRaw = parroquiasMatch[1];
const parroquiaRegex = /\{\s*id:\s*'([^']+)',\s*nombre:\s*'([^']+)',\s*municipioId:\s*'([^']+)'\s*\}/g;

const parroquias = [];

while ((match = parroquiaRegex.exec(parroquiasRaw)) !== null) {
  const [, oldId, nombre, oldMunicipioId] = match;
  const newId = toSlug(nombre);
  const newMunicipioId = municipioIdMap[oldMunicipioId] || oldMunicipioId;
  
  // Verificar duplicados
  let finalId = newId;
  if (parroquias.find(p => p.id === newId)) {
    finalId = `${newId} ${newMunicipioId}`;
  }
  
  parroquias.push({
    id: finalId,
    nombre,
    municipioId: newMunicipioId
  });
}

console.log(`Procesadas ${parroquias.length} parroquias`);

// Generar nuevo parroquias.js
let newParroquiasContent = 'export const parroquias = [\n';

// Agrupar por municipioId
let currentMunicipio = null;
for (const par of parroquias) {
  if (par.municipioId !== currentMunicipio) {
    if (currentMunicipio !== null) {
      newParroquiasContent += '\n';
    }
    currentMunicipio = par.municipioId;
    // Buscar nombre del municipio
    const mun = municipios.find(m => m.id === par.municipioId);
    const munName = mun ? mun.nombre : par.municipioId;
    newParroquiasContent += `  // ${munName}\n`;
  }
  newParroquiasContent += `  { id: '${par.id}', nombre: '${par.nombre}', municipioId: '${par.municipioId}' },\n`;
}

newParroquiasContent += '];\n';

// Guardar parroquias.js
fs.writeFileSync(parroquiasPath, newParroquiasContent, 'utf8');
console.log('parroquias.js actualizado');

console.log('\n✅ Archivos generados exitosamente!');
console.log('Los IDs ahora son slugs (minúscula, sin acentos)');

// Publica Cantones.shp y Parroquias.shp directamente a Supabase, replicando
// la misma lógica de src/utils/territorialMaps.ts (simplificación de anillos
// y subida a Storage + tabla mapas_recursos), sin pasar por el navegador.
//
// Uso:
//   SUPABASE_URL=... SUPABASE_ANON_KEY=... node scripts/publish-territorial-maps.mjs ["ruta a la carpeta"]

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import JSZip from 'jszip';
import shp from 'shpjs';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const sourceDir = path.resolve(process.argv[2] || path.join(repoRoot, '..', 'Base'));

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const STORAGE_BUCKET = 'mapas';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Faltan las variables de entorno SUPABASE_URL y/o SUPABASE_ANON_KEY.');
  process.exit(1);
}

if (!fs.existsSync(sourceDir)) {
  console.error(`No encontré la carpeta de origen: ${sourceDir}`);
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const simplifyRing = (ring, maxPoints = 180) => {
  const valid = ring.filter((point) => Array.isArray(point) && Number.isFinite(point[0]) && Number.isFinite(point[1]));
  if (valid.length <= maxPoints) return valid;

  const step = Math.ceil(valid.length / maxPoints);
  const sampled = valid.filter((_, index) => index === 0 || index === valid.length - 1 || index % step === 0);
  const first = sampled[0];
  const last = sampled[sampled.length - 1];
  if (first && last && (first[0] !== last[0] || first[1] !== last[1])) sampled.push(first);
  return sampled;
};

const optimizeCollection = (collection) => ({
  type: 'FeatureCollection',
  name: collection.name,
  fileName: collection.fileName,
  features: collection.features.map((feature) => {
    if (!feature.geometry) return feature;

    const geometry = feature.geometry.type === 'Polygon'
      ? { type: 'Polygon', coordinates: feature.geometry.coordinates.map((ring) => simplifyRing(ring)) }
      : { type: 'MultiPolygon', coordinates: feature.geometry.coordinates.map((polygon) => polygon.map((ring) => simplifyRing(ring))) };

    return { type: 'Feature', properties: feature.properties, geometry };
  })
});

const loadShapefileAsGeoJson = async (baseName) => {
  const extensions = ['.shp', '.shx', '.dbf', '.prj', '.cpg'];
  const files = fs.readdirSync(sourceDir).filter((file) => {
    const parsed = path.parse(file);
    return parsed.name.toLowerCase() === baseName.toLowerCase() && extensions.includes(parsed.ext.toLowerCase());
  });

  if (!files.some((file) => file.toLowerCase().endsWith('.shp'))) {
    throw new Error(`No encontré ${baseName}.shp en ${sourceDir}`);
  }

  const zip = new JSZip();
  for (const file of files) {
    zip.file(file, fs.readFileSync(path.join(sourceDir, file)));
  }
  const buffer = await zip.generateAsync({ type: 'nodebuffer' });
  const parsed = await shp(buffer);

  const features = (Array.isArray(parsed) ? parsed[0].features : parsed.features)
    .filter((feature) => feature?.type === 'Feature' && (feature.geometry?.type === 'Polygon' || feature.geometry?.type === 'MultiPolygon'))
    .map((feature) => ({
      type: 'Feature',
      properties: feature.properties && typeof feature.properties === 'object' ? feature.properties : {},
      geometry: feature.geometry
    }));

  if (!features.length) throw new Error(`${baseName}.shp no contiene polígonos válidos.`);

  return { type: 'FeatureCollection', name: baseName, fileName: `${baseName}.shp`, features };
};

const main = async () => {
  console.log('Leyendo Cantones.shp...');
  const cantonesRaw = await loadShapefileAsGeoJson('Cantones');
  console.log(`  ${cantonesRaw.features.length} features`);

  console.log('Leyendo Parroquias.shp...');
  const parroquiasRaw = await loadShapefileAsGeoJson('Parroquias');
  console.log(`  ${parroquiasRaw.features.length} features`);

  const optimizedCantones = optimizeCollection(cantonesRaw);
  const optimizedParroquias = optimizeCollection(parroquiasRaw);

  const folder = `territorial/${Date.now()}`;
  const payloads = [
    { id: 'territorial-cantones', title: 'Cantones de Tungurahua', description: 'Ubicación provincial con Baños de Agua Santa destacado.', filename: 'cantones.geojson', collection: optimizedCantones },
    { id: 'territorial-parroquias', title: 'Parroquias de Baños de Agua Santa', description: 'Territorio cantonal dividido por parroquias.', filename: 'parroquias.geojson', collection: optimizedParroquias }
  ];

  for (const item of payloads) {
    const objectPath = `${folder}/${item.filename}`;
    const blob = Buffer.from(JSON.stringify(item.collection));

    console.log(`Subiendo ${objectPath} (${(blob.length / 1024).toFixed(1)} KB)...`);
    const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(objectPath, blob, {
      upsert: true,
      contentType: 'application/geo+json'
    });

    if (uploadError) {
      console.error(`❌ Error subiendo ${item.filename}:`, uploadError.message || uploadError);
      process.exit(1);
    }

    const { data: publicData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(objectPath);

    const { error: dbError } = await supabase.from('mapas_recursos').upsert({
      id: item.id,
      titulo: item.title,
      descripcion: item.description,
      tif_url: null,
      preview_url: publicData.publicUrl,
      storage_folder: folder,
      updated_at: new Date().toISOString()
    });

    if (dbError) {
      console.error(`❌ Error guardando registro de ${item.id}:`, dbError.message || dbError);
      process.exit(1);
    }

    console.log(`✅ ${item.title} publicado: ${publicData.publicUrl}`);
  }

  console.log('\nListo. Los mapas territoriales quedaron publicados en Supabase.');
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

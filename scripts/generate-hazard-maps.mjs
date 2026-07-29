import { fromFile } from 'geotiff';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const sourceDir = path.resolve(process.argv[2] || path.join(repoRoot, '..', 'Amenazas Naturales'));
const outDir = path.join(repoRoot, 'public', 'mapas');
const MAX_DIMENSION = 1200;
const DIACRITICS_REGEX = new RegExp('[\\u0300-\\u036f]', 'g');

const MAP_RESOURCES = [
  { id: 'inundaciones', shortTitle: 'Inundaciones', fileKeywords: ['inundaciones', 'inundacion', 'inun_reclass1', 'inun_reclass', 'inun'] },
  { id: 'volcanico', shortTitle: 'Amenaza volcánica', fileKeywords: ['peligro_volcanico', 'peligro_volcanico1', 'volcanico', 'volcan'] },
  { id: 'deslizamientos', shortTitle: 'Deslizamientos', fileKeywords: ['deslizamientos', 'deslizamiento'] },
  { id: 'heladas', shortTitle: 'Heladas', fileKeywords: ['heladas1', 'heladas', 'helada'] },
  { id: 'incendios_forestales', shortTitle: 'Incendios forestales', fileKeywords: ['incendios_forestales1', 'incendios_forestales', 'incendios', 'forestales'] },
  { id: 'sequia_hidrologica', shortTitle: 'Sequía hidrológica', fileKeywords: ['sequia_hidrologica1', 'sequia_hidrologica', 'sequia', 'hidrologica'] }
];

const normalizeFileName = (value) =>
  value
    .normalize('NFD')
    .replace(DIACRITICS_REGEX, '')
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, '_');

const parseWorldFile = (content) => {
  const values = content
    .split(/\r?\n/)
    .map((line) => Number(line.trim()))
    .filter((value) => Number.isFinite(value));

  if (values.length < 6) return null;

  return {
    a: values[0],
    d: values[1],
    b: values[2],
    e: values[3],
    c: values[4],
    f: values[5],
    epsg: 'EPSG:32717',
    source: 'tfw'
  };
};

const findFile = (files, keywords, extensionRegex) => {
  const normalizedKeywords = keywords.map(normalizeFileName);
  return files.find((file) => {
    if (!extensionRegex.test(file)) return false;
    const normalized = normalizeFileName(file);
    return normalizedKeywords.some((keyword) => normalized.includes(keyword));
  });
};

const loadRaster = async (tifPath, geoReference) => {
  const tiff = await fromFile(tifPath);
  const image = await tiff.getImage();
  const originalWidth = image.getWidth();
  const originalHeight = image.getHeight();
  const scale = Math.min(1, MAX_DIMENSION / Math.max(originalWidth, originalHeight));
  const width = Math.max(1, Math.round(originalWidth * scale));
  const height = Math.max(1, Math.round(originalHeight * scale));

  const rasters = await image.readRasters({ samples: [0], width, height, resampleMethod: 'nearest' });
  const band = rasters[0];
  const values = new Uint8Array(width * height);
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  for (let i = 0; i < width * height; i += 1) {
    const value = Math.round(Number(band[i]));
    if (value >= 1 && value <= 5) {
      values[i] = value;
      counts[value] += 1;
    }
  }

  return { values, width, height, originalWidth, originalHeight, counts, geoReference };
};

const main = async () => {
  if (!fs.existsSync(sourceDir)) {
    console.error(`No encontré la carpeta de origen: ${sourceDir}`);
    process.exit(1);
  }

  fs.mkdirSync(outDir, { recursive: true });
  const files = fs.readdirSync(sourceDir);
  const available = [];

  for (const resource of MAP_RESOURCES) {
    const tifName = findFile(files, resource.fileKeywords, /\.tiff?$/i);

    if (!tifName) {
      console.warn(`⚠️  ${resource.shortTitle}: no encontré un .tif para "${resource.id}". Se omite.`);
      continue;
    }

    const tfwName = findFile(files, resource.fileKeywords, /\.tfw$/i);
    const tifPath = path.join(sourceDir, tifName);
    const geoReference = tfwName ? parseWorldFile(fs.readFileSync(path.join(sourceDir, tfwName), 'utf8')) : null;

    console.log(`Procesando ${resource.shortTitle} (${tifName})...`);
    const raster = await loadRaster(tifPath, geoReference || undefined);

    const payload = {
      format: 'susceptibility-raster-v1',
      valuesBase64: Buffer.from(raster.values).toString('base64'),
      width: raster.width,
      height: raster.height,
      originalWidth: raster.originalWidth,
      originalHeight: raster.originalHeight,
      counts: raster.counts,
      geoReference: raster.geoReference,
      generatedAt: new Date().toISOString()
    };

    fs.writeFileSync(path.join(outDir, `${resource.id}.json`), JSON.stringify(payload));
    available.push(resource.id);
    console.log(`✅ ${resource.shortTitle}: ${raster.width}x${raster.height}px, conteos ${JSON.stringify(raster.counts)}`);
  }

  fs.writeFileSync(
    path.join(outDir, 'manifest.json'),
    JSON.stringify({ ids: available, generatedAt: new Date().toISOString() })
  );

  console.log(`\nListo: ${available.length}/${MAP_RESOURCES.length} mapas generados en public/mapas/.`);
  const missing = MAP_RESOURCES.filter((resource) => !available.includes(resource.id));
  if (missing.length) {
    console.log(`Faltan: ${missing.map((resource) => resource.shortTitle).join(', ')}.`);
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

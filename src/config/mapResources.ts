export type MapResourceId =
  | 'inundaciones'
  | 'volcanico'
  | 'deslizamientos'
  | 'heladas'
  | 'incendios_forestales'
  | 'sequia_hidrologica'
  | 'sismico';

export type MapResource = {
  id: MapResourceId;
  title: string;
  shortTitle: string;
  subtitle: string;
  description: string;
  storagePrefix: string;
  fileKeywords: string[];
  accent: string;
  legendLabels?: Record<number, string>;
};

// Subtítulos de tarjetas vacíos para mantener las tarjetas limpias y sin textos secundarios.
export const MAP_RESOURCES: MapResource[] = [
  {
    id: 'inundaciones',
    title: 'Mapa de amenaza por inundaciones',
    shortTitle: 'Inundaciones',
    subtitle: '',
    description: 'Mapa temático de susceptibilidad por inundaciones. Permite identificar niveles de amenaza, cambiar simbología, activar instituciones y revisar zonas vulnerables.',
    storagePrefix: 'inundaciones',
    fileKeywords: ['inundaciones', 'inundacion', 'inun_reclass1', 'inun_reclass', 'inun'],
    accent: 'from-cyan-500 to-blue-600'
  },
  {
    id: 'volcanico',
    title: 'Mapa de amenaza volcánica',
    shortTitle: 'Amenaza volcánica',
    subtitle: '',
    description: 'Mapa temático de amenaza volcánica. Permite revisar zonas expuestas, cambiar simbología y cruzar la información con instituciones educativas.',
    storagePrefix: 'volcanico',
    fileKeywords: ['peligro_volcanico', 'peligro_volcanico1', 'volcanico', 'volcan'],
    accent: 'from-orange-500 to-red-600',
    legendLabels: {
      1: 'Flujo de lahares, probabilidad menor',
      2: 'Multipeligro, probabilidad mayor',
      3: 'Avalancha de escombros, probabilidad menor',
      4: 'Avalancha de escombros, probabilidad mayor',
      5: 'Multipeligro, probabilidad menor'
    }
  },
  {
    id: 'deslizamientos',
    title: 'Mapa de amenaza por deslizamientos',
    shortTitle: 'Deslizamientos',
    subtitle: '',
    description: 'Mapa temático de amenaza por deslizamientos. Ayuda a comprender zonas de ladera y sectores donde puede existir mayor susceptibilidad.',
    storagePrefix: 'deslizamientos',
    fileKeywords: ['deslizamientos', 'deslizamiento'],
    accent: 'from-emerald-500 to-lime-600'
  },
  {
    id: 'heladas',
    title: 'Mapa de amenaza por heladas',
    shortTitle: 'Heladas',
    subtitle: '',
    description: 'Mapa temático de amenaza por heladas. Permite revisar zonas susceptibles y relacionarlas con instituciones educativas y medidas preventivas.',
    storagePrefix: 'heladas',
    fileKeywords: ['heladas1', 'heladas', 'helada'],
    accent: 'from-sky-300 to-blue-500'
  },
  {
    id: 'incendios_forestales',
    title: 'Mapa de amenaza por incendios forestales',
    shortTitle: 'Incendios forestales',
    subtitle: '',
    description: 'Mapa temático de amenaza por incendios forestales. Ayuda a ubicar sectores de riesgo y reforzar acciones de prevención comunitaria.',
    storagePrefix: 'incendios-forestales',
    fileKeywords: ['incendios_forestales1', 'incendios_forestales', 'incendios', 'forestales'],
    accent: 'from-red-500 to-amber-500'
  },
  {
    id: 'sequia_hidrologica',
    title: 'Mapa de amenaza por sequía hidrológica',
    shortTitle: 'Sequía hidrológica',
    subtitle: '',
    description: 'Mapa temático de amenaza por sequía hidrológica. Permite analizar zonas vulnerables y conversar sobre uso responsable del agua.',
    storagePrefix: 'sequia-hidrologica',
    fileKeywords: ['sequia_hidrologica1', 'sequia_hidrologica', 'sequia', 'hidrologica'],
    accent: 'from-yellow-500 to-orange-600'
  },
  {
    id: 'sismico',
    title: 'Mapa de amenaza sísmica',
    shortTitle: 'Amenaza sísmica',
    subtitle: '',
    description: 'Mapa temático de amenaza sísmica. Muestra niveles de aceleración sísmica (PGA) para identificar las zonas con mayor exposición ante un sismo.',
    storagePrefix: 'sismico',
    fileKeywords: ['peligro_sismico', 'amenaza_sismica', 'sismico', 'sismo', 'aceleracion_sismica', 'banos'],
    accent: 'from-lime-600 via-yellow-500 to-orange-600',
    legendLabels: {
      1: '0.40 - 0.45 PGA',
      2: '0.45 - 0.50 PGA',
      3: '0.50 - 0.55 PGA',
      4: '0.55 - 0.60 PGA'
    }
  }
];

export const DEFAULT_MAP_RESOURCE_ID: MapResourceId = 'inundaciones';

export const getMapResource = (id: string | null | undefined): MapResource => {
  return MAP_RESOURCES.find((resource) => resource.id === id) || MAP_RESOURCES[0];
};

export const normalizeFileName = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, '_');

export const fileMatchesResource = (file: File, resource: MapResource) => {
  const normalized = normalizeFileName(file.name);
  return resource.fileKeywords.some((keyword) => normalized.includes(normalizeFileName(keyword)));
};

export const findResourceFile = (files: File[], resource: MapResource, extensionRegex: RegExp) => {
  const byKeyword = files.find((file) => extensionRegex.test(file.name) && fileMatchesResource(file, resource));
  return byKeyword || files.find((file) => extensionRegex.test(file.name));
};

export const findAssociatedFiles = (files: File[], resource: MapResource) => {
  return files.filter((file) => {
    const normalized = normalizeFileName(file.name);
    const isCommonLayer = /\.kml$/i.test(file.name) || normalized.includes('territorio_banos');
    return fileMatchesResource(file, resource) || isCommonLayer;
  });
};

import { useMemo, useState } from 'react';
import simplify from 'simplify-js';
import type { GeoJsonFeature, GeoJsonFeatureCollection, Position } from '../utils/territorialMaps';
import { getFeatureName, isBanosFeature } from '../utils/territorialMaps';

type Props = {
  collection: GeoJsonFeatureCollection | null;
  mode: 'cantones' | 'parroquias';
  className?: string;
  loading?: boolean;
  audience?: 'admin' | 'student';
  onRetry?: () => void;
};

const COLORS = ['#34d399', '#38bdf8', '#a78bfa', '#fbbf24', '#fb7185', '#2dd4bf', '#60a5fa', '#a3e635', '#f472b6', '#fb923c'];
// Los datos publicados ya vienen simplificados con Douglas-Peucker (ver
// scripts/publish-territorial-maps.mjs); esto es solo una red de seguridad
// por si algún día se publica una capa sin simplificar. Tolerancia generosa
// para que casi nunca se active sobre datos ya optimizados.
const MAX_POINTS_PER_RING = 4000;
// Mismo caso que en territorialMaps.ts: las coordenadas están en grados, no
// metros, aunque el .prj original diga UTM.
const SAFETY_TOLERANCE = 0.00008;

const forEachPosition = (feature: GeoJsonFeature, callback: (position: Position) => void) => {
  if (!feature.geometry) return;
  const walk = (value: any) => {
    if (Array.isArray(value) && value.length >= 2 && Number.isFinite(value[0]) && Number.isFinite(value[1])) {
      callback([Number(value[0]), Number(value[1])]);
      return;
    }
    if (Array.isArray(value)) value.forEach(walk);
  };
  walk(feature.geometry.coordinates);
};

const simplifyRing = (ring: Position[]) => {
  const valid = ring.filter((point) => Array.isArray(point) && Number.isFinite(point[0]) && Number.isFinite(point[1]));
  if (valid.length <= MAX_POINTS_PER_RING) return valid;

  const points = valid.map(([x, y]) => ({ x, y }));
  const simplified = simplify(points, SAFETY_TOLERANCE, true);
  const result: Position[] = simplified.map((p) => [p.x, p.y]);

  const first = result[0];
  const last = result[result.length - 1];
  if (first && last && (first[0] !== last[0] || first[1] !== last[1])) result.push(first);
  return result;
};

const TerritorialMapView = ({ collection, mode, className = '', loading = false, audience = 'admin', onRetry }: Props) => {
  const [activeName, setActiveName] = useState('');

  const projected = useMemo(() => {
    try {
      if (!collection?.features.length) return null;

      let minX = Number.POSITIVE_INFINITY;
      let maxX = Number.NEGATIVE_INFINITY;
      let minY = Number.POSITIVE_INFINITY;
      let maxY = Number.NEGATIVE_INFINITY;
      let pointCount = 0;

      collection.features.forEach((feature) => {
        forEachPosition(feature, ([x, y]) => {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
          pointCount += 1;
        });
      });

      if (!pointCount || !Number.isFinite(minX) || !Number.isFinite(maxX) || !Number.isFinite(minY) || !Number.isFinite(maxY)) return null;

      const width = Math.max(maxX - minX, 0.000001);
      const height = Math.max(maxY - minY, 0.000001);
      const pad = 28;
      const viewW = 760;
      const viewH = 470;
      const scale = Math.min((viewW - pad * 2) / width, (viewH - pad * 2) / height);
      const offsetX = (viewW - width * scale) / 2;
      const offsetY = (viewH - height * scale) / 2;
      const project = ([x, y]: Position) => [offsetX + (x - minX) * scale, viewH - (offsetY + (y - minY) * scale)] as const;

      const pathFor = (feature: GeoJsonFeature) => {
        if (!feature.geometry) return '';
        const polygons = feature.geometry.type === 'Polygon'
          ? [feature.geometry.coordinates as Position[][]]
          : feature.geometry.coordinates as Position[][][];

        return polygons
          .map((polygon) => polygon
            .map((ring) => simplifyRing(ring)
              .map((point, index) => {
                const [x, y] = project(point);
                return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
              })
              .join(' ') + ' Z')
            .join(' '))
          .join(' ');
      };

      return { viewW, viewH, pathFor, pointCount };
    } catch (error) {
      console.error('No se pudo preparar el mapa territorial:', error);
      return { error: 'El mapa contiene demasiados puntos o una geometría no compatible.' } as const;
    }
  }, [collection]);

  if (!collection) {
    const studentCopy = loading
      ? 'Estamos preparando el territorio para tu misión.'
      : 'No pudimos descargar el mapa en este momento. Puedes intentarlo de nuevo.';
    const adminCopy = loading
      ? 'Consultando los mapas publicados...'
      : 'Selecciona la carpeta de Cantones y Parroquias. La vista previa aparecerá aquí sin recargar la página.';

    return (
      <div className={`flex min-h-[300px] items-center justify-center rounded-[1.8rem] border-4 border-dashed border-cyan-200 bg-gradient-to-br from-cyan-50 to-violet-50 p-8 text-center ${className}`}>
        <div className="flex max-w-md flex-col items-center">
          {loading && <span className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-cyan-200 border-t-violet-600" />}
          <p className="text-sm font-black uppercase tracking-[0.18em] text-cyan-700">
            {loading ? 'Cargando territorio' : audience === 'student' ? 'Mapa no disponible' : 'Mapa territorial pendiente'}
          </p>
          <p className="mt-3 text-sm font-bold leading-relaxed text-slate-600">{audience === 'student' ? studentCopy : adminCopy}</p>
          {!loading && onRetry && (
            <button type="button" onClick={onRetry} className="mt-5 rounded-2xl bg-violet-600 px-5 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg hover:bg-violet-700">
              Volver a intentar
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!projected || 'error' in projected) {
    return (
      <div className={`flex min-h-[300px] items-center justify-center rounded-[1.8rem] border-4 border-red-200 bg-red-50 p-8 text-center ${className}`}>
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-red-600">No se pudo dibujar la vista previa</p>
          <p className="mt-3 max-w-md text-sm font-bold leading-relaxed text-red-800">{projected?.error || 'La capa no contiene coordenadas válidas.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-[1.8rem] border-4 border-white bg-gradient-to-br from-sky-50 via-white to-amber-50 p-3 shadow-xl ${className}`}>
      <svg viewBox={`0 0 ${projected.viewW} ${projected.viewH}`} className="h-full min-h-[300px] w-full" role="img" aria-label={mode === 'cantones' ? 'Mapa de cantones de Tungurahua' : 'Mapa de parroquias de Baños'}>
        {collection.features.map((feature, index) => {
          const name = getFeatureName(feature, `${mode === 'cantones' ? 'Cantón' : 'Parroquia'} ${index + 1}`);
          const banos = isBanosFeature(feature);
          const fill = mode === 'cantones' ? (banos ? '#f43f5e' : COLORS[index % COLORS.length]) : COLORS[index % COLORS.length];
          const path = projected.pathFor(feature);
          if (!path) return null;

          return (
            <path
              key={`${name}-${index}`}
              d={path}
              fill={fill}
              stroke={banos ? '#9f1239' : '#334155'}
              strokeWidth={banos ? 3.5 : 1.4}
              vectorEffect="non-scaling-stroke"
              fillRule="evenodd"
              className="cursor-interactive transition-all duration-150 hover:opacity-75"
              onPointerEnter={() => setActiveName(name)}
              onPointerLeave={() => setActiveName('')}
            >
              <title>{name}</title>
            </path>
          );
        })}
      </svg>

      <div className="pointer-events-none absolute left-4 top-4 rounded-full border-2 border-white bg-violet-600 px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-xl">
        {activeName || (mode === 'cantones' ? 'Explora los cantones' : 'Explora las parroquias')}
      </div>

      <div className="pointer-events-none absolute bottom-4 left-4 rounded-full bg-white/95 px-3 py-2 text-[10px] font-black text-slate-600 shadow-lg">
        Vista optimizada · {projected.pointCount.toLocaleString()} puntos leídos
      </div>

      {mode === 'cantones' && (
        <div className="pointer-events-none absolute bottom-4 right-4 flex items-center gap-2 rounded-full border-2 border-white bg-rose-500 px-3 py-2 text-xs font-black text-white shadow-xl">
          <span className="h-3 w-3 rounded-full bg-yellow-300" /> Baños de Agua Santa
        </div>
      )}
    </div>
  );
};

export default TerritorialMapView;

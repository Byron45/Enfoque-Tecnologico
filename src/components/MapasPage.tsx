import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, Info, Layers3, MapPin, Maximize2, Minus, Move, Plus, RotateCcw, School, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MAP_RESOURCES, type MapResourceId, getMapResource } from '../config/mapResources';
import { isSupabaseConfigured, supabase } from '../supabaseClient';
import {
  type GeoTiffRaster,
  type PaletteName,
  fetchPortableRaster,
  loadGeoTiffRaster,
  portablePayloadToRaster,
  renderRasterToDataUrl,
  susceptibilityPalettes
} from '../utils/geotiffRenderer';
import { getLocalHazardMap, getLocalHazardMapIds } from '../utils/localMapStore';
import {
  fetchTerritorialMap,
  TERRITORIAL_IDS,
  getFeatureName,
  type GeoJsonFeatureCollection,
  type GeoJsonFeature,
  type Position
} from '../utils/territorialMaps';
import simplify from 'simplify-js';
import { INSTITUCIONES_BANOS, type InstitucionBanos } from '../data/institucionesData';
import GuideAssistant from './GuideAssistant';
import { GUIDE_STEPS } from '../utils/guideSteps';

const paletteLabels: Record<PaletteName, string> = {
  institucional: 'Original',
  semaforo: 'Semáforo',
  contraste: 'Contraste',
  azul: 'Azul',
  gris: 'Gris'
};

const PARROQUIA_COLORS = ['#38bdf8', '#fbbf24', '#f472b6', '#34d399', '#a78bfa', '#fb923c', '#2dd4bf'];

const MAX_POINTS_PER_RING = 4000;
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

type MapaRecord = {
  id: string;
  titulo: string | null;
  descripcion: string | null;
  tif_url: string | null;
  preview_url: string | null;
  storage_folder: string | null;
  updated_at: string | null;
};

type HoverInfo = {
  x: number;
  y: number;
  value: number;
  label: string;
  color: string;
} | null;

type RenderMode = 'raster' | 'tif' | 'preview' | 'local' | 'static' | 'fallback';

const MapasPage = () => {
  const navigate = useNavigate();
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const [selectedMapId, setSelectedMapId] = useState<MapResourceId>('instituciones');
  const selectedResource = getMapResource(selectedMapId);
  const [publishedIds, setPublishedIds] = useState<Set<string>>(new Set(['instituciones']));
  const [zoom, setZoom] = useState(0.9);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [mapaUrl, setMapaUrl] = useState('');
  const [raster, setRaster] = useState<GeoTiffRaster | null>(null);
  const [titulo, setTitulo] = useState(selectedResource.title);
  const [descripcion, setDescripcion] = useState(selectedResource.description);
  const [estado, setEstado] = useState('Cargando mapa...');
  const [isLoading, setIsLoading] = useState(true);
  const [isRecoloring, setIsRecoloring] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [activePalette, setActivePalette] = useState<PaletteName>('institucional');
  const [counts, setCounts] = useState<Record<number, number> | null>(null);
  const [renderMode, setRenderMode] = useState<RenderMode>('static');
  const [hoverInfo, setHoverInfo] = useState<HoverInfo>(null);
  const [pointerPos, setPointerPos] = useState<{ x: number; y: number } | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  // Parroquias & Instituciones State
  const [parroquiasCollection, setParroquiasCollection] = useState<GeoJsonFeatureCollection | null>(null);
  const [showSchools, setShowSchools] = useState(true);
  const [searchSchool, setSearchSchool] = useState('');
  const [activeSchool, setActiveSchool] = useState<InstitucionBanos | null>(null);
  const [activeParroquiaName, setActiveParroquiaName] = useState('');

  const filteredSchools = useMemo(() => {
    const q = searchSchool.trim().toLowerCase();
    if (!q) return INSTITUCIONES_BANOS;
    return INSTITUCIONES_BANOS.filter(
      (s) => s.name.toLowerCase().includes(q) || (s.parroquia && s.parroquia.toLowerCase().includes(q))
    );
  }, [searchSchool]);

  // SVG Projection for Parroquias & Institutions
  const parroquiasProjected = useMemo(() => {
    if (!parroquiasCollection?.features.length) return null;

    let minX = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    let pointCount = 0;

    parroquiasCollection.features.forEach((feature) => {
      forEachPosition(feature, ([x, y]) => {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        pointCount += 1;
      });
    });

    INSTITUCIONES_BANOS.forEach((inst) => {
      if (inst.longitude < minX) minX = inst.longitude;
      if (inst.longitude > maxX) maxX = inst.longitude;
      if (inst.latitude < minY) minY = inst.latitude;
      if (inst.latitude > maxY) maxY = inst.latitude;
    });

    if (!pointCount || !Number.isFinite(minX) || !Number.isFinite(maxX) || !Number.isFinite(minY) || !Number.isFinite(maxY)) return null;

    const width = Math.max(maxX - minX, 0.000001);
    const height = Math.max(maxY - minY, 0.000001);
    const pad = 36;
    const viewW = 860;
    const viewH = 540;
    const scale = Math.min((viewW - pad * 2) / width, (viewH - pad * 2) / height);
    const offsetX = (viewW - width * scale) / 2;
    const offsetY = (viewH - height * scale) / 2;
    const project = ([x, y]: Position) => [
      offsetX + (x - minX) * scale,
      viewH - (offsetY + (y - minY) * scale)
    ] as const;

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

    const projectedInstitutions = INSTITUCIONES_BANOS.map((inst) => {
      const [x, y] = project([inst.longitude, inst.latitude]);
      return {
        ...inst,
        svgX: x,
        svgY: y
      };
    });

    return { viewW, viewH, pathFor, pointCount, projectedInstitutions };
  }, [parroquiasCollection]);

  const selectedLegend = useMemo(() => {
    const base = susceptibilityPalettes[activePalette];
    const overrides = selectedResource.legendLabels;
    if (!overrides) return base;
    return base.map((item) => ({ ...item, label: overrides[item.value] || item.label }));
  }, [activePalette, selectedResource]);

  const visibleLegend = useMemo(() => {
    if (selectedResource.id !== 'sismico') return selectedLegend;
    return selectedLegend.filter((item) => item.value !== 5);
  }, [selectedLegend, selectedResource.id]);

  const hasVisibleMap = selectedMapId === 'instituciones' ? Boolean(parroquiasCollection) : Boolean(mapaUrl);

  const resetView = () => {
    setZoom(0.9);
    setPan({ x: 0, y: 0 });
  };

  const focusSchool = (inst: InstitucionBanos) => {
    setActiveSchool(inst);
    if (!parroquiasProjected) return;
    const projected = parroquiasProjected.projectedInstitutions.find((i) => i.id === inst.id);
    if (!projected) return;
    const targetZoom = 3.2;
    setZoom(targetZoom);

    const dx = projected.svgX - parroquiasProjected.viewW / 2;
    const dy = projected.svgY - parroquiasProjected.viewH / 2;
    const screenScale = 0.85 * targetZoom;

    setPan({
      x: -dx * screenScale,
      y: -dy * screenScale
    });
  };

  const focusBanosUrban = () => {
    if (!parroquiasProjected) return;
    const targetZoom = 3.2;
    setZoom(targetZoom);
    const urbanInst = parroquiasProjected.projectedInstitutions.find((i) => i.id === 'inst-1') || parroquiasProjected.projectedInstitutions[0];
    if (urbanInst) {
      const dx = urbanInst.svgX - parroquiasProjected.viewW / 2;
      const dy = urbanInst.svgY - parroquiasProjected.viewH / 2;
      const screenScale = 0.85 * targetZoom;
      setPan({
        x: -dx * screenScale,
        y: -dy * screenScale
      });
    }
  };

  const refreshPublishedList = async () => {
    const ids = new Set<string>(['instituciones']);

    try {
      (await getLocalHazardMapIds()).forEach((id) => ids.add(id));
    } catch (error) {
      console.warn('No se pudo leer el listado local de mapas:', error);
    }

    try {
      const response = await fetch('/mapas/manifest.json', { cache: 'no-store' });
      if (response.ok) {
        const manifest = await response.json() as { ids?: string[] };
        (manifest.ids || []).forEach((id) => ids.add(id));
      }
    } catch (error) {
      console.warn('No se pudo leer el manifiesto de mapas publicados:', error);
    }

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('mapas_recursos').select('id');
        if (error) throw error;
        (data || []).forEach((item: { id: string }) => ids.add(item.id));
      } catch (error) {
        console.warn('No se pudo leer listado remoto de mapas:', error);
      }
    }

    setPublishedIds(ids);
  };

  useEffect(() => {
    const refresh = () => {
      refreshPublishedList();
      setReloadToken((value) => value + 1);
    };

    refreshPublishedList();
    window.addEventListener('hazardMapsUpdated', refresh as EventListener);
    window.addEventListener('focus', refresh);
    window.addEventListener('storage', refresh);

    return () => {
      window.removeEventListener('hazardMapsUpdated', refresh as EventListener);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const applyRaster = (loadedRaster: GeoTiffRaster, mode: RenderMode, message: string) => {
      if (cancelled) return;
      setRaster(loadedRaster);
      setMapaUrl(renderRasterToDataUrl(loadedRaster, selectedLegend));
      setCounts(loadedRaster.counts);
      setRenderMode(mode);
      setEstado(message);
      setPublishedIds((previous) => new Set(previous).add(selectedResource.id));
    };

    const loadLocal = async () => {
      try {
        const local = await getLocalHazardMap(selectedResource.id);
        if (!local || cancelled) return false;

        const loadedRaster = portablePayloadToRaster(local.raster);
        setTitulo(local.title || selectedResource.title);
        setDescripcion(local.description || selectedResource.description);
        setUpdatedAt(local.updatedAt);
        applyRaster(loadedRaster, 'local', 'Mapa listo. Puedes acercar, mover y cambiar colores.');
        return true;
      } catch (error) {
        console.warn('No se pudo abrir el mapa guardado en este navegador:', error);
        return false;
      }
    };

    const loadRemote = async () => {
      if (!isSupabaseConfigured) return false;

      try {
        const { data, error } = await supabase
          .from('mapas_recursos')
          .select('id, titulo, descripcion, tif_url, preview_url, storage_folder, updated_at')
          .eq('id', selectedResource.id)
          .maybeSingle();

        if (error || !data || cancelled) return false;
        const mapa = data as MapaRecord;

        setTitulo(mapa.titulo || selectedResource.title);
        setDescripcion(mapa.descripcion || selectedResource.description);
        setUpdatedAt(mapa.updated_at);

        if (mapa.storage_folder && mapa.storage_folder !== 'database-fallback') {
          try {
            const rasterPath = `${mapa.storage_folder}/raster.json`;
            const { data: rasterPublic } = supabase.storage.from('mapas').getPublicUrl(rasterPath);
            const loadedRaster = await fetchPortableRaster(rasterPublic.publicUrl);
            applyRaster(loadedRaster, 'raster', 'Mapa listo. Puedes acercar, mover y cambiar colores.');
            return true;
          } catch (error) {
            console.warn('No se pudo cargar raster.json:', error);
          }
        }

        if (mapa.tif_url) {
          try {
            const loadedRaster = await loadGeoTiffRaster(mapa.tif_url, 1200);
            applyRaster(loadedRaster, 'tif', 'Mapa GeoTIFF listo para explorar.');
            return true;
          } catch (error) {
            console.warn('No se pudo cargar el GeoTIFF publicado:', error);
          }
        }

        if (mapa.preview_url) {
          setMapaUrl(mapa.preview_url);
          setRenderMode('preview');
          setEstado('Mapa listo para observar.');
          setPublishedIds((previous) => new Set(previous).add(selectedResource.id));
          return true;
        }
      } catch (error) {
        console.warn('No se pudo consultar el mapa remoto:', error);
      }

      return false;
    };

    const loadStatic = async () => {
      try {
        const loadedRaster = await fetchPortableRaster(`/mapas/${selectedResource.id}.json`);
        if (cancelled) return false;
        applyRaster(loadedRaster, 'static', 'Mapa oficial listo. Puedes acercar, mover y cambiar colores.');
        return true;
      } catch (error) {
        console.warn('No se pudo cargar el mapa estático publicado:', error);
        return false;
      }
    };

    const load = async () => {
      setIsLoading(true);
      setRaster(null);
      setCounts(null);
      setHoverInfo(null);
      setMapaUrl('');
      setTitulo(selectedResource.title);
      setDescripcion(selectedResource.description);
      setUpdatedAt(null);
      resetView();

      if (selectedMapId === 'instituciones') {
        setEstado('Cargando mapa territorial de parroquias e instituciones...');
        try {
          const collection = await fetchTerritorialMap(TERRITORIAL_IDS.parroquias);
          if (!cancelled) {
            setParroquiasCollection(collection);
            setEstado('Mapa de instituciones listo. Toca o haz clic sobre los puntos para conocer cada escuela.');
            setRenderMode('static');
          }
        } catch (err) {
          console.warn('Error cargando mapa territorial de parroquias:', err);
          if (!cancelled) setEstado('No se pudo cargar el mapa territorial de parroquias.');
        }
        if (!cancelled) setIsLoading(false);
        return;
      }

      setEstado(`Buscando ${selectedResource.shortTitle}...`);
      setRenderMode('fallback');

      const remoteLoaded = await loadRemote();
      if (!remoteLoaded) {
        const staticLoaded = await loadStatic();
        if (!staticLoaded) {
          const localLoaded = await loadLocal();
          if (!localLoaded && !cancelled) {
            setEstado('Este mapa todavía no está disponible. Pide a tu docente que lo prepare.');
            setRenderMode('fallback');
          }
        }
      }

      if (!cancelled) setIsLoading(false);
    };

    load();
    return () => { cancelled = true; };
  }, [selectedMapId, reloadToken]);

  useEffect(() => {
    if (!raster || selectedMapId === 'instituciones') return;

    setIsRecoloring(true);
    setEstado(`Aplicando paleta ${paletteLabels[activePalette]}...`);

    const frame = window.requestAnimationFrame(() => {
      try {
        setMapaUrl(renderRasterToDataUrl(raster, selectedLegend));
        setEstado('Mapa listo. Pasa el mouse para descubrir el nivel de amenaza.');
      } catch (error) {
        console.error(error);
        setEstado('No se pudo aplicar la paleta seleccionada.');
      } finally {
        setIsRecoloring(false);
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [activePalette, raster, selectedLegend, selectedMapId]);

  const zoomIn = () => setZoom((previous) => Math.min(previous + 0.2, 4));
  const zoomOut = () => setZoom((previous) => Math.max(previous - 0.2, 0.55));

  useEffect(() => {
    const node = viewerRef.current;
    if (!node) return;

    const handleWheel = (event: WheelEvent) => {
      if (!hasVisibleMap) return;
      event.preventDefault();
      const delta = event.deltaY > 0 ? -0.12 : 0.12;
      setZoom((previous) => Math.min(4, Math.max(0.55, previous + delta)));
    };

    node.addEventListener('wheel', handleWheel, { passive: false });
    return () => node.removeEventListener('wheel', handleWheel);
  }, [hasVisibleMap]);

  const updateHoverInfo = (event: React.PointerEvent<HTMLDivElement>) => {
    if (selectedMapId === 'instituciones' || !raster || !imageRef.current) {
      setHoverInfo(null);
      return;
    }

    const rect = imageRef.current.getBoundingClientRect();
    const localX = (event.clientX - rect.left) / rect.width;
    const localY = (event.clientY - rect.top) / rect.height;

    if (localX < 0 || localX > 1 || localY < 0 || localY > 1) {
      setHoverInfo(null);
      return;
    }

    const px = Math.min(raster.width - 1, Math.max(0, Math.floor(localX * raster.width)));
    const py = Math.min(raster.height - 1, Math.max(0, Math.floor(localY * raster.height)));
    const value = raster.values[py * raster.width + px];
    const legend = selectedLegend.find((item) => item.value === value);

    if (!legend) {
      setHoverInfo(null);
      return;
    }

    setHoverInfo({
      x: event.clientX - (viewerRef.current?.getBoundingClientRect().left || 0),
      y: event.clientY - (viewerRef.current?.getBoundingClientRect().top || 0),
      value,
      label: legend.label,
      color: legend.color
    });
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!hasVisibleMap) return;
    setDragging(true);
    dragStart.current = { x: event.clientX, y: event.clientY, panX: pan.x, panY: pan.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    updateHoverInfo(event);
    const rect = viewerRef.current?.getBoundingClientRect();
    if (rect) setPointerPos({ x: event.clientX - rect.left, y: event.clientY - rect.top });
    if (!dragging) return;
    setPan({
      x: dragStart.current.panX + event.clientX - dragStart.current.x,
      y: dragStart.current.panY + event.clientY - dragStart.current.y
    });
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const toggleFullscreen = async () => {
    if (!viewerRef.current) return;
    try {
      if (!document.fullscreenElement) await viewerRef.current.requestFullscreen();
      else await document.exitFullscreen();
    } catch (error) {
      console.warn('No se pudo activar pantalla completa:', error);
    }
  };

  return (
    <main className="min-h-screen bg-[#010413] text-white p-3 md:p-5 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-44 -left-32 h-[34rem] w-[34rem] rounded-full bg-cyan-500/20 blur-[130px]" />
        <div className="absolute -bottom-44 -right-32 h-[34rem] w-[34rem] rounded-full bg-emerald-500/18 blur-[130px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.045)_1px,transparent_1px)] [background-size:34px_34px] opacity-35" />
      </div>

      <section className="relative z-10 mx-auto max-w-[96rem] space-y-4">
        <header className="rounded-[2rem] border border-white/10 bg-white/5 p-4 md:p-6 backdrop-blur-2xl shadow-[0_30px_100px_rgba(0,0,0,0.35)]">
          <button onClick={() => navigate('/hub')} className="mb-5 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-cyan-100 hover:bg-white/15"><ArrowLeft size={16} /> Volver al centro de mando</button>

          <div className="grid gap-4 lg:grid-cols-[1fr_0.75fr] lg:items-end">
            <div>
              <p className="text-cyan-300 text-[10px] font-black uppercase tracking-[0.32em] mb-2">Explorador de mapas</p>
              <h1 className="text-3xl md:text-5xl xl:text-6xl font-black tracking-tight leading-none">{titulo}</h1>
              <p className="mt-3 max-w-3xl text-slate-300 font-semibold leading-relaxed">{descripcion}</p>
            </div>
            <div className="rounded-[1.7rem] border border-cyan-300/20 bg-cyan-400/10 p-4 flex items-start gap-3"><Info className="text-cyan-300 shrink-0" size={22} /><p className="text-sm text-cyan-50/80 font-semibold leading-relaxed">Selecciona un mapa temático o de instituciones, cambia colores y explora el cantón Baños de Agua Santa.</p></div>
          </div>
        </header>

        {/* Selector de Mapas y Módulos */}
        <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-3">
          {MAP_RESOURCES.map((resource) => {
            const isPublished = publishedIds.has(resource.id);
            const isSelected = selectedMapId === resource.id;
            return (
              <button
                key={resource.id}
                onClick={() => {
                  setSelectedMapId(resource.id);
                  setActiveSchool(null);
                }}
                className={`rounded-[1.35rem] border p-3 text-left transition-all ${
                  isSelected
                    ? 'border-cyan-300 bg-cyan-400/15 shadow-[0_0_30px_rgba(34,211,238,0.18)] scale-[1.02]'
                    : 'border-white/10 bg-white/5 hover:border-cyan-300/40'
                }`}
              >
                <div className={`mb-3 h-1.5 rounded-full bg-gradient-to-r ${resource.accent}`} />
                <div className="flex items-center justify-between gap-1">
                  <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                    {resource.id === 'instituciones' ? 'Educación' : 'Amenaza'}
                  </p>
                  <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-black uppercase tracking-[0.1em] ${isPublished ? 'bg-emerald-400/15 text-emerald-200 border border-emerald-300/20' : 'bg-orange-400/10 text-orange-200 border border-orange-300/20'}`}>
                    {isPublished ? 'Disponible' : 'Próximamente'}
                  </span>
                </div>
                <h2 className="mt-1 text-base md:text-lg font-black leading-tight">{resource.shortTitle}</h2>
              </button>
            );
          })}
        </section>

        {/* Visor Interactivo y Panel Lateral */}
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-3 md:p-4 shadow-2xl backdrop-blur-2xl">
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_370px] gap-4 items-stretch">
            {/* Visor */}
            <div className="rounded-[1.6rem] border border-white/10 bg-slate-950/75 p-4 min-h-0">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-300">Visor interactivo</p>
                  <p className="text-sm text-slate-400 font-semibold mt-1">{estado}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {selectedMapId === 'instituciones' && (
                    <>
                      <button
                        onClick={focusBanosUrban}
                        className="inline-flex items-center gap-1.5 rounded-2xl border border-amber-300/30 bg-amber-400/15 px-3 py-2 text-xs font-black uppercase tracking-wider text-amber-200 hover:bg-amber-400/25 transition shadow"
                        title="Hacer zoom y enfocar el centro urbano de Baños donde están las escuelas agrupadas"
                      >
                        <Search size={14} /> Enfocar Baños Centro
                      </button>
                      <button
                        onClick={resetView}
                        className="inline-flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-black uppercase tracking-wider text-slate-300 hover:bg-white/15 transition shadow"
                        title="Ver todo el cantón completo"
                      >
                        <RotateCcw size={14} /> Todo el cantón
                      </button>
                    </>
                  )}
                  <ControlButton label="Alejar" onClick={zoomOut}><Minus size={17} /></ControlButton>
                  <ControlButton label="Acercar" onClick={zoomIn}><Plus size={17} /></ControlButton>
                  <ControlButton label="Reiniciar" onClick={resetView}><RotateCcw size={17} /></ControlButton>
                  <ControlButton label="Pantalla completa" onClick={toggleFullscreen}><Maximize2 size={17} /></ControlButton>
                </div>
              </div>

              <div
                ref={viewerRef}
                data-cursor="crosshair"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={() => { setDragging(false); setHoverInfo(null); setPointerPos(null); }}
                onPointerCancel={() => { setDragging(false); setHoverInfo(null); setPointerPos(null); }}
                className={`relative h-[58vh] min-h-[420px] max-h-[640px] overflow-hidden rounded-[1.35rem] border border-white/10 bg-slate-950 select-none ${dragging ? 'cursor-grabbing' : hasVisibleMap ? 'cursor-grab' : 'cursor-default'}`}
              >
                {(isLoading || isRecoloring) && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/75 backdrop-blur-[2px]">
                    <div className="rounded-2xl border border-slate-700 bg-slate-900 px-5 py-4 text-sm font-black uppercase tracking-[0.18em] text-white shadow-xl flex items-center gap-3">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-300 border-t-transparent" />
                      {isLoading ? 'Cargando mapa...' : 'Cambiando colores...'}
                    </div>
                  </div>
                )}

                {/* Renderizado de Instituciones sobre Parroquias SVG */}
                {selectedMapId === 'instituciones' ? (
                  parroquiasProjected ? (
                    <div
                      className="absolute left-1/2 top-1/2 max-h-[94%] max-w-[94%]"
                      style={{
                        height: '94%',
                        aspectRatio: `${parroquiasProjected.viewW} / ${parroquiasProjected.viewH}`,
                        transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${zoom})`,
                        transformOrigin: 'center center'
                      }}
                    >
                      <svg
                        viewBox={`0 0 ${parroquiasProjected.viewW} ${parroquiasProjected.viewH}`}
                        className="h-full w-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
                      >
                        {/* Polígonos de Parroquias */}
                        {parroquiasCollection?.features.map((feature, index) => {
                          const name = getFeatureName(feature, `Parroquia ${index + 1}`);
                          const fill = PARROQUIA_COLORS[index % PARROQUIA_COLORS.length];
                          const path = parroquiasProjected.pathFor(feature);
                          if (!path) return null;
                          return (
                            <path
                              key={`${name}-${index}`}
                              d={path}
                              fill={fill}
                              stroke="#0f172a"
                              strokeWidth={1.4}
                              vectorEffect="non-scaling-stroke"
                              fillRule="evenodd"
                              className="cursor-pointer transition-all duration-150 hover:opacity-85"
                              onPointerEnter={() => setActiveParroquiaName(name)}
                              onPointerLeave={() => setActiveParroquiaName('')}
                            >
                              <title>{name}</title>
                            </path>
                          );
                        })}

                        {/* Puntos de Instituciones Educativas */}
                        {showSchools && parroquiasProjected.projectedInstitutions.map((inst) => {
                          const isSelected = activeSchool?.id === inst.id;
                          const rOuter = isSelected ? 12 : zoom >= 2.5 ? 9 : zoom >= 1.6 ? 7 : 5.5;
                          const rInner = isSelected ? 4.5 : zoom >= 2.5 ? 3.5 : 2.5;

                          return (
                            <g
                              key={inst.id}
                              transform={`translate(${inst.svgX}, ${inst.svgY})`}
                              className="cursor-pointer transition-transform"
                              onClick={(e) => {
                                e.stopPropagation();
                                focusSchool(inst);
                              }}
                            >
                              {/* Círculo de pulso si está seleccionada */}
                              {isSelected && (
                                <circle r="22" fill="none" stroke="#f59e0b" strokeWidth="3" className="animate-ping opacity-80" />
                              )}
                              {/* Marcador exterior */}
                              <circle
                                r={rOuter}
                                fill={isSelected ? '#f59e0b' : '#ef4444'}
                                stroke="#ffffff"
                                strokeWidth={zoom >= 2 ? '2' : '1.5'}
                                className="drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] transition-all hover:scale-125"
                              />
                              {/* Punto interior */}
                              <circle r={rInner} fill="#ffffff" />

                              {/* Etiqueta flotante visible con zoom o selección */}
                              {(zoom >= 2.1 || isSelected) && (
                                <g transform="translate(0, -13)" className="pointer-events-none select-none">
                                  <rect
                                    x={-(Math.min(inst.name.length, 24) * 3 + 8)}
                                    y="-13"
                                    width={Math.min(inst.name.length, 24) * 6 + 16}
                                    height="16"
                                    rx="8"
                                    fill="#0f172a"
                                    fillOpacity="0.92"
                                    stroke={isSelected ? '#f59e0b' : '#ffffff'}
                                    strokeWidth="1"
                                  />
                                  <text
                                    x="0"
                                    y="-2"
                                    textAnchor="middle"
                                    fill={isSelected ? '#fde047' : '#ffffff'}
                                    fontSize="8"
                                    fontWeight="900"
                                  >
                                    {inst.name.length > 24 ? inst.name.slice(0, 22) + '...' : inst.name}
                                  </text>
                                </g>
                              )}
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
                      <div className="max-w-md rounded-[2rem] border border-white/15 bg-slate-900/90 p-6 text-white shadow-xl">
                        <MapPin className="mx-auto mb-4 text-cyan-400 animate-bounce" size={42} />
                        <h3 className="text-2xl font-black">Preparando territorio</h3>
                        <p className="mt-3 text-sm font-bold text-slate-400">Descargando límites parroquiales de Baños de Agua Santa...</p>
                      </div>
                    </div>
                  )
                ) : hasVisibleMap ? (
                  /* Renderizado normal de mapas raster GeoTIFF */
                  <div
                    className="absolute left-1/2 top-1/2 max-h-[92%] max-w-[92%]"
                    style={{
                      height: '92%',
                      aspectRatio: raster ? `${raster.width} / ${raster.height}` : '1 / 1',
                      transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${zoom})`,
                      transformOrigin: 'center center'
                    }}
                  >
                    <img ref={imageRef} src={mapaUrl} alt={titulo} draggable={false} className="h-full w-full object-contain" />
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
                    <div className="max-w-md rounded-[2rem] border border-white/15 bg-slate-900/90 p-6 text-white shadow-xl">
                      <MapPin className="mx-auto mb-4 text-cyan-400" size={42} />
                      <h3 className="text-2xl font-black">Mapa en preparación</h3>
                      <p className="mt-3 text-sm font-bold text-slate-400">Este contenido todavía no está disponible. Tu docente lo habilitará muy pronto.</p>
                    </div>
                  </div>
                )}

                {/* Indicadores de estado flotantes */}
                {hasVisibleMap && <div className="absolute left-4 top-4 rounded-2xl bg-slate-900/90 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white shadow border border-white/10">Zoom: {Math.round(zoom * 100)}%</div>}
                {hasVisibleMap && <div className="absolute bottom-4 left-4 rounded-2xl bg-slate-900/90 px-4 py-3 text-xs font-bold text-slate-200 shadow border border-white/10 flex items-center gap-2"><Move size={16} className="text-cyan-400" /> Mover con el mouse o touch</div>}

                {/* Tooltip de parroquia hover */}
                {selectedMapId === 'instituciones' && activeParroquiaName && !activeSchool && (
                  <div className="pointer-events-none absolute left-4 bottom-16 rounded-2xl border border-white/15 bg-slate-950/90 px-4 py-2 text-xs font-black uppercase tracking-wider text-cyan-300 shadow-xl backdrop-blur-md">
                    Parroquia: {activeParroquiaName}
                  </div>
                )}

                {/* Tooltip de información de institución activa */}
                {selectedMapId === 'instituciones' && activeSchool && (
                  <div
                    onPointerDown={(e) => e.stopPropagation()}
                    className="absolute right-4 top-4 z-30 max-w-sm rounded-2xl bg-slate-950/95 p-4 text-white shadow-2xl border border-white/15 backdrop-blur-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 text-amber-400">
                        <School size={18} />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">Institución Educativa</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setActiveSchool(null);
                        }}
                        onPointerDown={(e) => e.stopPropagation()}
                        className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
                        aria-label="Cerrar información"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <h3 className="mt-1.5 text-base font-black leading-snug">{activeSchool.name}</h3>
                    <div className="mt-2.5 space-y-1 text-xs font-semibold text-slate-300">
                      <p className="flex items-center gap-1.5 text-cyan-300">
                        <MapPin size={14} className="shrink-0" /> {activeSchool.parroquia || 'Baños de Agua Santa'}
                      </p>
                      {activeSchool.elevation && (
                        <p className="text-slate-400">Altitud aproximada: {activeSchool.elevation} m.s.n.m.</p>
                      )}
                      <p className="text-[10px] text-slate-500 font-mono">Coord: {activeSchool.latitude.toFixed(4)}, {activeSchool.longitude.toFixed(4)}</p>
                    </div>
                  </div>
                )}

                {/* Tooltip de nivel de amenaza (para mapas raster) */}
                {selectedMapId !== 'instituciones' && hoverInfo && (
                  <div className="pointer-events-none absolute z-30 max-w-[260px] rounded-2xl bg-slate-950 px-4 py-3 text-white shadow-2xl border border-white/10" style={{ left: Math.min(hoverInfo.x + 16, (viewerRef.current?.clientWidth || 0) - 260), top: Math.max(12, hoverInfo.y - 62) }}>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200">Nivel de amenaza</p>
                    <div className="mt-1 flex items-start gap-2">
                      <span className="mt-1 h-4 w-4 shrink-0 rounded-full border border-white/20" style={{ backgroundColor: hoverInfo.color }} />
                      <span className="text-lg font-black leading-snug">{hoverInfo.label}</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400">Valor raster: {hoverInfo.value}</p>
                  </div>
                )}

                {/* Mirilla / Crosshair */}
                {hasVisibleMap && pointerPos && (
                  <svg aria-hidden="true" viewBox="0 0 28 28" className="pointer-events-none absolute z-40 drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]" style={{ left: pointerPos.x - 14, top: pointerPos.y - 14, width: 28, height: 28 }}>
                    <line x1="14" y1="1" x2="14" y2="9" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    <line x1="14" y1="19" x2="14" y2="27" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    <line x1="1" y1="14" x2="9" y2="14" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    <line x1="19" y1="14" x2="27" y2="14" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    <line x1="14" y1="1" x2="14" y2="9" stroke="#0f172a" strokeWidth="1.25" strokeLinecap="round" />
                    <line x1="14" y1="19" x2="14" y2="27" stroke="#0f172a" strokeWidth="1.25" strokeLinecap="round" />
                    <line x1="1" y1="14" x2="9" y2="14" stroke="#0f172a" strokeWidth="1.25" strokeLinecap="round" />
                    <line x1="19" y1="14" x2="27" y2="14" stroke="#0f172a" strokeWidth="1.25" strokeLinecap="round" />
                    <circle cx="14" cy="14" r="2.75" fill="none" stroke="white" strokeWidth="2" />
                    <circle cx="14" cy="14" r="2.75" fill="none" stroke="#0f172a" strokeWidth="0.85" />
                  </svg>
                )}
              </div>
            </div>

            {/* Panel Lateral */}
            <aside className="rounded-[1.6rem] border border-white/10 bg-slate-950/70 p-4 xl:h-[calc(58vh+6.9rem)] xl:min-h-[520px] xl:max-h-[740px] xl:overflow-y-auto space-y-4">
              {/* VISTA ESPECÍFICA DE INSTITUCIONES */}
              {selectedMapId === 'instituciones' ? (
                <>
                  <PanelCard>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-400/20 text-orange-400">
                          <School size={22} />
                        </div>
                        <div>
                          <p className="text-orange-300 text-[10px] font-black uppercase tracking-[0.3em]">Instituciones</p>
                          <h2 className="text-2xl font-black">Escuelas de Baños</h2>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowSchools((prev) => !prev)}
                        className="rounded-2xl border border-white/10 bg-slate-950/60 p-2.5 text-cyan-200 hover:bg-cyan-400 hover:text-slate-950 transition"
                        title={showSchools ? 'Ocultar puntos en el mapa' : 'Mostrar puntos en el mapa'}
                      >
                        {showSchools ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                    </div>

                    <div className="mb-3 relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={searchSchool}
                        onChange={(e) => setSearchSchool(e.target.value)}
                        placeholder="Buscar institución o parroquia..."
                        className="w-full rounded-xl border border-white/15 bg-slate-900/80 py-2 pl-9 pr-3 text-xs font-bold text-white placeholder:text-slate-500 outline-none focus:border-cyan-400"
                      />
                    </div>

                    <p className="text-xs font-bold text-slate-400 mb-2">
                      Puntos cargados: {filteredSchools.length} de {INSTITUCIONES_BANOS.length}
                    </p>

                    <div className="max-h-56 space-y-1.5 overflow-y-auto pr-1">
                      {filteredSchools.map((inst) => {
                        const isSelected = activeSchool?.id === inst.id;
                        return (
                          <button
                            key={inst.id}
                            onClick={() => focusSchool(inst)}
                            className={`w-full rounded-xl border p-2.5 text-left transition-all ${
                              isSelected
                                ? 'border-amber-400 bg-amber-400/20 shadow-md scale-[1.01]'
                                : 'border-white/10 bg-slate-950/50 hover:border-orange-300/50'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <MapPin size={15} className={`shrink-0 mt-0.5 ${isSelected ? 'text-amber-400' : 'text-orange-400'}`} />
                              <div>
                                <p className="text-xs font-black text-white leading-tight">{inst.name}</p>
                                <p className="mt-0.5 text-[10px] font-bold text-cyan-300">{inst.parroquia}</p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </PanelCard>

                  <PanelCard>
                    <p className="text-cyan-300 text-[10px] font-black uppercase tracking-[0.3em] mb-1">División Territorial</p>
                    <h2 className="text-2xl font-black mb-3">Parroquias</h2>
                    <div className="space-y-2">
                      {parroquiasCollection?.features.map((feature, idx) => {
                        const name = getFeatureName(feature, `Parroquia ${idx + 1}`);
                        const color = PARROQUIA_COLORS[idx % PARROQUIA_COLORS.length];
                        return (
                          <div key={idx} className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2">
                            <span className="h-4 w-6 rounded border border-white/20 shrink-0" style={{ backgroundColor: color }} />
                            <span className="text-xs font-bold text-white">{name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </PanelCard>
                </>
              ) : (
                /* VISTAS DE MAPAS DE AMENAZA (Sin el bloque innecesario de instituciones) */
                <>
                  <PanelCard>
                    <div className="flex items-center gap-3 mb-4">
                      <Layers3 className="text-cyan-300" size={22} />
                      <div>
                        <p className="text-cyan-300 text-[10px] font-black uppercase tracking-[0.3em]">Simbología</p>
                        <h2 className="text-2xl font-black">Cambiar colores</h2>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {(Object.keys(susceptibilityPalettes) as PaletteName[]).map((palette) => (
                        <button
                          key={palette}
                          onClick={() => setActivePalette(palette)}
                          disabled={!raster}
                          className={`rounded-2xl border px-3 py-2 text-xs font-black uppercase tracking-[0.12em] transition-all ${
                            activePalette === palette
                              ? 'border-cyan-300 bg-cyan-400 text-slate-950'
                              : 'border-white/10 bg-slate-950/55 text-slate-300 hover:border-cyan-300/50'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {paletteLabels[palette]}
                        </button>
                      ))}
                    </div>
                  </PanelCard>

                  <PanelCard>
                    <p className="text-orange-300 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Leyenda</p>
                    <h2 className="text-2xl font-black mb-4">Susceptibilidad</h2>
                    <div className="space-y-3">
                      {visibleLegend.map((item) => (
                        <div key={item.value} className="flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/55 p-3">
                          <div className="flex items-start gap-3">
                            <span className="mt-0.5 h-6 w-10 shrink-0 rounded-lg border border-white/20" style={{ backgroundColor: item.color }} />
                            <span className="font-black text-sm leading-snug">{item.label}</span>
                          </div>
                          {counts && <span className="shrink-0 text-[10px] font-bold text-slate-500">{counts[item.value]?.toLocaleString('es-EC')}</span>}
                        </div>
                      ))}
                    </div>
                  </PanelCard>
                </>
              )}

              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="rounded-[1.5rem] border border-emerald-300/20 bg-emerald-400/10 p-4">
                <p className="text-emerald-300 text-[10px] font-black uppercase tracking-[0.28em] mb-2">Uso educativo</p>
                <h3 className="text-xl font-black">¿Para qué sirve?</h3>
                <p className="mt-3 text-slate-300 text-sm font-semibold leading-relaxed">
                  {selectedMapId === 'instituciones'
                    ? 'Identifica la ubicación de las escuelas de Baños en cada parroquia para planificar zonas seguras y rutas de evacuación.'
                    : 'Relaciona amenazas naturales con el territorio para conversar sobre rutas seguras, puntos de encuentro y prevención comunitaria.'}
                </p>
                {updatedAt && <p className="mt-4 text-xs font-bold text-slate-500">Última actualización: {new Date(updatedAt).toLocaleString('es-EC')}</p>}
              </motion.div>
            </aside>
          </div>
        </section>
      </section>

      <GuideAssistant guideId="mapas" steps={GUIDE_STEPS.mapas} />
    </main>
  );
};

const PanelCard = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 backdrop-blur-2xl">{children}</div>
);

const ControlButton = ({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) => (
  <button onClick={onClick} title={label} className="rounded-2xl border border-white/10 bg-white/10 p-3 text-white hover:bg-cyan-400 hover:text-slate-950 transition-colors">{children}</button>
);

export default MapasPage;

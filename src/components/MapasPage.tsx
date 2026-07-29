import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, Info, Layers3, MapPin, Maximize2, Minus, Move, Plus, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MAP_RESOURCES, type MapResourceId, getMapResource } from '../config/mapResources';
import { isSupabaseConfigured, supabase } from '../supabaseClient';
import {
  type GeoTiffRaster,
  type InstitutionPoint,
  type PaletteName,
  fetchPortableRaster,
  loadGeoTiffRaster,
  portablePayloadToRaster,
  renderRasterToDataUrl,
  susceptibilityPalettes
} from '../utils/geotiffRenderer';
import { getLocalHazardMap, getLocalHazardMapIds } from '../utils/localMapStore';

const paletteLabels: Record<PaletteName, string> = {
  institucional: 'Original',
  semaforo: 'Semáforo',
  contraste: 'Contraste',
  azul: 'Azul',
  gris: 'Gris'
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

const getThreatColor = (value?: number) => susceptibilityPalettes.institucional.find((item) => item.value === value)?.color || '#ef4444';

const MapasPage = () => {
  const navigate = useNavigate();
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const [selectedMapId, setSelectedMapId] = useState<MapResourceId>('inundaciones');
  const selectedResource = getMapResource(selectedMapId);
  const [publishedIds, setPublishedIds] = useState<Set<string>>(new Set());
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
  const [renderMode, setRenderMode] = useState<RenderMode>('fallback');
  const [hoverInfo, setHoverInfo] = useState<HoverInfo>(null);
  const [showSchools, setShowSchools] = useState(true);
  const [activePoint, setActivePoint] = useState<InstitutionPoint | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const selectedLegend = useMemo(() => {
    const base = susceptibilityPalettes[activePalette];
    const overrides = selectedResource.legendLabels;
    if (!overrides) return base;
    return base.map((item) => ({ ...item, label: overrides[item.value] || item.label }));
  }, [activePalette, selectedResource]);
  const schoolPoints = useMemo(() => (raster?.points || []).filter((point) => point.insideMap && point.xRatio !== undefined && point.yRatio !== undefined), [raster]);
  const hasVisibleMap = Boolean(mapaUrl);

  const resetView = () => {
    setZoom(0.9);
    setPan({ x: 0, y: 0 });
  };

  const refreshPublishedList = async () => {
    const ids = new Set<string>();

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
        applyRaster(loadedRaster, 'local', 'Mapa listo. Puedes acercar, mover, cambiar colores y explorar las escuelas.');
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
        applyRaster(loadedRaster, 'static', 'Mapa oficial listo. Puedes acercar, mover, cambiar colores y explorar las escuelas.');
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
      setActivePoint(null);
      setMapaUrl('');
      setTitulo(selectedResource.title);
      setDescripcion(selectedResource.description);
      setUpdatedAt(null);
      setEstado(`Buscando ${selectedResource.shortTitle}...`);
      setRenderMode('fallback');
      resetView();

      // La versión publicada en Supabase tiene prioridad para evitar que una copia local
      // antigua oculte el mapa que deben ver todos los estudiantes. Si Supabase no tiene
      // el mapa (o no está configurado), usamos el archivo estático incluido en el sitio
      // -disponible para cualquier visitante sin depender de este navegador- y solo al
      // final la copia local, pensada como vista previa del propio dispositivo del admin.
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
    if (!raster) return;

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
  }, [activePalette, raster, selectedLegend]);

  const zoomIn = () => setZoom((previous) => Math.min(previous + 0.2, 4));
  const zoomOut = () => setZoom((previous) => Math.max(previous - 0.2, 0.55));

  const updateHoverInfo = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!raster || !imageRef.current) {
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
              <p className="text-cyan-300 text-[10px] font-black uppercase tracking-[0.32em] mb-2">Explorador de amenazas</p>
              <h1 className="text-3xl md:text-5xl xl:text-6xl font-black tracking-tight leading-none">{titulo}</h1>
              <p className="mt-3 max-w-3xl text-slate-300 font-semibold leading-relaxed">{descripcion}</p>
            </div>
            <div className="rounded-[1.7rem] border border-cyan-300/20 bg-cyan-400/10 p-4 flex items-start gap-3"><Info className="text-cyan-300 shrink-0" size={22} /><p className="text-sm text-cyan-50/80 font-semibold leading-relaxed">Selecciona un mapa, cambia los colores y observa las instituciones educativas.</p></div>
          </div>
        </header>

        <section className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-3">
          {MAP_RESOURCES.map((resource) => {
            const isPublished = publishedIds.has(resource.id);
            return (
              <button key={resource.id} onClick={() => setSelectedMapId(resource.id)} className={`rounded-[1.35rem] border p-3 text-left transition-all ${selectedMapId === resource.id ? 'border-cyan-300 bg-cyan-400/15 shadow-[0_0_30px_rgba(34,211,238,0.18)]' : 'border-white/10 bg-white/5 hover:border-cyan-300/40'}`}>
                <div className={`mb-3 h-1.5 rounded-full bg-gradient-to-r ${resource.accent}`} />
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Amenaza</p>
                  <span className={`rounded-full px-2 py-1 text-[8px] font-black uppercase tracking-[0.12em] ${isPublished ? 'bg-emerald-400/15 text-emerald-200 border border-emerald-300/20' : 'bg-orange-400/10 text-orange-200 border border-orange-300/20'}`}>{isPublished ? 'Disponible' : 'Próximamente'}</span>
                </div>
                <h2 className="mt-1 text-lg md:text-xl font-black leading-tight">{resource.shortTitle}</h2>
                <p className="mt-1 text-xs md:text-sm font-semibold text-slate-400">{resource.subtitle}</p>
              </button>
            );
          })}
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-3 md:p-4 shadow-2xl backdrop-blur-2xl">
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_370px] gap-4 items-stretch">
            <div className="rounded-[1.6rem] border border-white/10 bg-slate-950/75 p-4 min-h-0">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div><p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-300">Visor interactivo</p><p className="text-sm text-slate-400 font-semibold mt-1">{estado}</p></div>
                <div className="flex gap-2"><ControlButton label="Alejar" onClick={zoomOut}><Minus size={17} /></ControlButton><ControlButton label="Acercar" onClick={zoomIn}><Plus size={17} /></ControlButton><ControlButton label="Reiniciar" onClick={resetView}><RotateCcw size={17} /></ControlButton><ControlButton label="Pantalla completa" onClick={toggleFullscreen}><Maximize2 size={17} /></ControlButton></div>
              </div>

              <div ref={viewerRef} data-cursor="crosshair" onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={() => { setDragging(false); setHoverInfo(null); setActivePoint(null); }} onPointerCancel={() => { setDragging(false); setHoverInfo(null); setActivePoint(null); }} className={`relative h-[58vh] min-h-[420px] max-h-[640px] overflow-hidden rounded-[1.35rem] border border-white/10 bg-white select-none ${dragging ? 'cursor-grabbing' : hasVisibleMap ? 'cursor-grab' : 'cursor-default'}`}>
                {(isLoading || isRecoloring) && <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/55 backdrop-blur-[2px]"><div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-black uppercase tracking-[0.18em] text-slate-900 shadow-xl">{isLoading ? 'Cargando mapa...' : 'Cambiando colores...'}</div></div>}

                {hasVisibleMap ? (
                  <div className="absolute left-1/2 top-1/2 max-h-[92%] max-w-[92%]" style={{ height: '92%', aspectRatio: raster ? `${raster.width} / ${raster.height}` : '1 / 1', transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${zoom})`, transformOrigin: 'center center' }}>
                    <img ref={imageRef} src={mapaUrl} alt={titulo} draggable={false} className="h-full w-full object-contain" />
                    {showSchools && schoolPoints.map((point) => <button key={point.id} type="button" onPointerEnter={() => setActivePoint(point)} onPointerLeave={() => setActivePoint(null)} onClick={(event) => { event.stopPropagation(); setActivePoint(point); }} className="absolute z-10 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_18px_rgba(239,68,68,0.75)] transition-transform hover:scale-150" style={{ left: `${(point.xRatio || 0) * 100}%`, top: `${(point.yRatio || 0) * 100}%`, backgroundColor: getThreatColor(point.threatValue) }} title={point.name} />)}
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
                    <div className="max-w-md rounded-[2rem] border border-slate-200 bg-slate-50 p-6 text-slate-900 shadow-xl">
                      <MapPin className="mx-auto mb-4 text-cyan-600" size={42} />
                      <h3 className="text-2xl font-black">Mapa en preparación</h3>
                      <p className="mt-3 text-sm font-bold text-slate-600">Este contenido todavía no está disponible. Tu docente lo habilitará muy pronto.</p>
                    </div>
                  </div>
                )}

                {hasVisibleMap && <div className="absolute left-4 top-4 rounded-2xl bg-white/90 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-900 shadow border border-slate-200">Zoom: {Math.round(zoom * 100)}%</div>}
                {hasVisibleMap && <div className="absolute bottom-4 left-4 rounded-2xl bg-white/90 px-4 py-3 text-xs font-bold text-slate-800 shadow border border-slate-200 flex items-center gap-2"><Move size={16} className="text-cyan-600" /> Mover con el mouse o touch</div>}
                {hasVisibleMap && <div className="absolute bottom-4 right-4 rounded-2xl bg-white/90 px-4 py-3 text-xs font-bold text-slate-800 shadow border border-slate-200">Modo: {renderMode === 'local' ? 'Disponible en este dispositivo' : renderMode === 'static' ? 'Mapa oficial' : renderMode === 'raster' ? 'Raster interactivo' : renderMode === 'tif' ? 'GeoTIFF' : renderMode === 'preview' ? 'Vista publicada' : 'Base'}</div>}

                {hoverInfo && !activePoint && <div className="pointer-events-none absolute z-30 max-w-[260px] rounded-2xl bg-slate-950 px-4 py-3 text-white shadow-2xl border border-white/10" style={{ left: Math.min(hoverInfo.x + 16, (viewerRef.current?.clientWidth || 0) - 260), top: Math.max(12, hoverInfo.y - 62) }}><p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200">Nivel de amenaza</p><div className="mt-1 flex items-start gap-2"><span className="mt-1 h-4 w-4 shrink-0 rounded-full border border-white/20" style={{ backgroundColor: hoverInfo.color }} /><span className="text-lg font-black leading-snug">{hoverInfo.label}</span></div><p className="text-[10px] font-bold text-slate-400">Valor raster: {hoverInfo.value}</p></div>}
                {activePoint && <div className="absolute right-4 top-4 z-30 max-w-sm rounded-2xl bg-slate-950 px-4 py-3 text-white shadow-2xl border border-white/10"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-200">Institución educativa</p><h3 className="mt-1 text-lg font-black leading-tight">{activePoint.name}</h3><div className="mt-2 flex items-center gap-2"><span className="h-4 w-4 rounded-full border border-white/20" style={{ backgroundColor: getThreatColor(activePoint.threatValue) }} /><span className="text-sm font-bold text-slate-300">Amenaza: {activePoint.threatLabel || 'Sin dato'}</span></div></div>}
              </div>
            </div>

            <aside className="rounded-[1.6rem] border border-white/10 bg-slate-950/70 p-4 xl:h-[calc(58vh+6.9rem)] xl:min-h-[520px] xl:max-h-[740px] xl:overflow-y-auto space-y-4">
              <PanelCard>
                <div className="flex items-center gap-3 mb-4"><Layers3 className="text-cyan-300" size={22} /><div><p className="text-cyan-300 text-[10px] font-black uppercase tracking-[0.3em]">Simbología</p><h2 className="text-2xl font-black">Cambiar colores</h2></div></div>
                <div className="grid grid-cols-2 gap-2">{(Object.keys(susceptibilityPalettes) as PaletteName[]).map((palette) => <button key={palette} onClick={() => setActivePalette(palette)} disabled={!raster} className={`rounded-2xl border px-3 py-2 text-xs font-black uppercase tracking-[0.12em] transition-all ${activePalette === palette ? 'border-cyan-300 bg-cyan-400 text-slate-950' : 'border-white/10 bg-slate-950/55 text-slate-300 hover:border-cyan-300/50'} disabled:opacity-50 disabled:cursor-not-allowed`}>{paletteLabels[palette]}</button>)}</div>
              </PanelCard>

              <PanelCard>
                <div className="mb-4 flex items-center justify-between gap-3"><div className="flex items-center gap-3"><MapPin className="text-orange-300" size={22} /><div><p className="text-orange-300 text-[10px] font-black uppercase tracking-[0.3em]">Instituciones</p><h2 className="text-2xl font-black">Escuelas</h2></div></div><button onClick={() => setShowSchools((previous) => !previous)} disabled={!schoolPoints.length} className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-cyan-200 hover:bg-cyan-400 hover:text-slate-950 disabled:opacity-40">{showSchools ? <Eye size={18} /> : <EyeOff size={18} />}</button></div>
                <p className="text-sm font-semibold text-slate-400">Puntos cargados: {schoolPoints.length}</p>
                <div className="mt-3 max-h-44 space-y-2 overflow-auto pr-1">{schoolPoints.length ? schoolPoints.map((point) => <button key={point.id} onClick={() => setActivePoint(point)} className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-left hover:border-orange-300/50"><p className="text-xs font-black text-white">{point.name}</p><p className="text-[10px] font-bold text-slate-500">Amenaza: {point.threatLabel || 'Sin dato'}</p></button>) : <p className="text-sm font-bold text-slate-500">Aún no hay puntos KML para este mapa.</p>}</div>
              </PanelCard>

              <PanelCard>
                <p className="text-orange-300 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Leyenda</p><h2 className="text-2xl font-black mb-4">Susceptibilidad</h2>
                <div className="space-y-3">{selectedLegend.map((item) => <div key={item.value} className="flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/55 p-3"><div className="flex items-start gap-3"><span className="mt-0.5 h-6 w-10 shrink-0 rounded-lg border border-white/20" style={{ backgroundColor: item.color }} /><span className="font-black text-sm leading-snug">{item.label}</span></div>{counts && <span className="shrink-0 text-[10px] font-bold text-slate-500">{counts[item.value]?.toLocaleString('es-EC')}</span>}</div>)}</div>
              </PanelCard>

              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="rounded-[1.5rem] border border-emerald-300/20 bg-emerald-400/10 p-4">
                <p className="text-emerald-300 text-[10px] font-black uppercase tracking-[0.28em] mb-2">Uso educativo</p><h3 className="text-xl font-black">¿Para qué sirve?</h3><p className="mt-3 text-slate-300 text-sm font-semibold leading-relaxed">Relaciona amenazas naturales con instituciones educativas para conversar sobre rutas seguras, puntos de encuentro y prevención comunitaria.</p>{updatedAt && <p className="mt-4 text-xs font-bold text-slate-500">Última actualización: {new Date(updatedAt).toLocaleString('es-EC')}</p>}
              </motion.div>
            </aside>
          </div>
        </section>
      </section>
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

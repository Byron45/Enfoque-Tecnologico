import { AnimatePresence, motion } from 'framer-motion';
import { X, Backpack, Home, AlertTriangle, ShieldCheck, Maximize2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { useState } from 'react';

import mochilaUrl from '../assets/guia/mochila.webp';
import planUrl from '../assets/guia/plan.webp';
import seguridadUrl from '../assets/guia/seguridad.webp';

type TabKey = 'mochila' | 'plan' | 'seguridad';

type Props = {
  open: boolean;
  onClose: () => void;
};

const GUIDES: Record<TabKey, { title: string; subtitle: string; url: string; alt: string }> = {
  mochila: {
    title: 'Mochila de Emergencia',
    subtitle: 'Preparación para 72 horas con suministros esenciales.',
    url: mochilaUrl,
    alt: 'Infografía de Mochila de Emergencia'
  },
  plan: {
    title: 'Plan Familiar de Emergencia',
    subtitle: 'Organización del hogar, roles y rutas seguras ante desastres.',
    url: planUrl,
    alt: 'Infografía de Plan Familiar de Emergencia'
  },
  seguridad: {
    title: 'Plan de Seguridad',
    subtitle: 'Protocolos de protección y resiliencia en la comunidad y escuela.',
    url: seguridadUrl,
    alt: 'Infografía de Plan de Seguridad'
  }
};

const GuiaRapidaModal = ({ open, onClose }: Props) => {
  const [activeTab, setActiveTab] = useState<TabKey | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);

  const resetAndClose = () => {
    setActiveTab(null);
    setFullscreen(false);
    setZoom(1);
    onClose();
  };

  const handleOpenFullscreen = () => {
    setZoom(1);
    setFullscreen(true);
  };

  const currentGuide = activeTab ? GUIDES[activeTab] : null;

  return (
    <>
      <AnimatePresence>
        {open && !fullscreen && (
          <motion.div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-[#071D4A]/85 p-4 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: 24, scale: 0.96 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 16, scale: 0.96 }}
              className="relative flex w-full max-w-5xl flex-col overflow-hidden rounded-[2.2rem] border-4 border-white bg-white shadow-2xl"
            >
              {/* Header */}
              <header className="relative bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 p-6 text-white md:p-8">
                <button
                  onClick={resetAndClose}
                  className="absolute right-4 top-4 rounded-full bg-white/20 p-2.5 text-white hover:bg-white/30 transition backdrop-blur-sm shadow-md"
                  aria-label="Cerrar guía rápida"
                >
                  <X size={24} />
                </button>
                
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 shadow-lg backdrop-blur-md">
                    <AlertTriangle size={36} className="text-yellow-300" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[.22em] text-violet-200">Guía de Supervivencia</p>
                    <h2 className="text-3xl font-black md:text-4xl">Guía Rápida</h2>
                  </div>
                </div>
              </header>

              {/* Content */}
              <div className="bg-slate-50 p-6 md:p-8 min-h-[420px] max-h-[75vh] overflow-y-auto">
                {!activeTab ? (
                  <div className="flex h-full flex-col items-center justify-center space-y-6">
                    <p className="text-center text-xl font-black text-slate-700 mb-2">
                      ¿Qué tema quieres revisar hoy, Agente?
                    </p>
                    
                    <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <button
                        onClick={() => setActiveTab('mochila')}
                        className="group flex flex-col items-center justify-between rounded-3xl border-4 border-orange-200 bg-white p-6 text-center shadow-[0_12px_30px_rgba(249,115,22,0.15)] transition hover:-translate-y-1.5 hover:border-orange-400 hover:shadow-[0_20px_40px_rgba(249,115,22,0.25)]"
                      >
                        <div className="mb-4 rounded-2xl bg-orange-100 p-5 text-orange-500 transition-transform group-hover:scale-110">
                          <Backpack size={54} />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-slate-800">Mochila de Emergencia</h3>
                          <p className="mt-2 text-xs font-bold leading-relaxed text-slate-500">Lo que debes tener listo para 72 horas.</p>
                        </div>
                        <span className="mt-4 inline-flex rounded-full bg-orange-50 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-orange-600 border border-orange-200">Ver guía</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('plan')}
                        className="group flex flex-col items-center justify-between rounded-3xl border-4 border-emerald-200 bg-white p-6 text-center shadow-[0_12px_30px_rgba(16,185,129,0.15)] transition hover:-translate-y-1.5 hover:border-emerald-400 hover:shadow-[0_20px_40px_rgba(16,185,129,0.25)]"
                      >
                        <div className="mb-4 rounded-2xl bg-emerald-100 p-5 text-emerald-500 transition-transform group-hover:scale-110">
                          <Home size={54} />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-slate-800">Plan Familiar</h3>
                          <p className="mt-2 text-xs font-bold leading-relaxed text-slate-500">Cómo organizarse en casa ante desastres.</p>
                        </div>
                        <span className="mt-4 inline-flex rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-emerald-600 border border-emerald-200">Ver guía</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('seguridad')}
                        className="group flex flex-col items-center justify-between rounded-3xl border-4 border-cyan-200 bg-white p-6 text-center shadow-[0_12px_30px_rgba(6,182,212,0.15)] transition hover:-translate-y-1.5 hover:border-cyan-400 hover:shadow-[0_20px_40px_rgba(6,182,212,0.25)] sm:col-span-2 lg:col-span-1"
                      >
                        <div className="mb-4 rounded-2xl bg-cyan-100 p-5 text-cyan-600 transition-transform group-hover:scale-110">
                          <ShieldCheck size={54} />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-slate-800">Plan de Seguridad</h3>
                          <p className="mt-2 text-xs font-bold leading-relaxed text-slate-500">Medidas y protocolos de seguridad comunitaria.</p>
                        </div>
                        <span className="mt-4 inline-flex rounded-full bg-cyan-50 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-cyan-700 border border-cyan-200">Ver guía</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col items-center"
                  >
                    <div className="mb-4 flex w-full flex-wrap items-center justify-between gap-3">
                      <button 
                        onClick={() => setActiveTab(null)}
                        className="font-black text-violet-600 hover:text-violet-800 flex items-center gap-2 text-sm uppercase tracking-wider transition"
                      >
                        &larr; Volver a las opciones
                      </button>

                      <button
                        onClick={handleOpenFullscreen}
                        className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
                      >
                        <Maximize2 size={16} /> Ver en pantalla completa / Ampliar
                      </button>
                    </div>
                    
                    <div 
                      onClick={handleOpenFullscreen}
                      className="group relative w-full max-w-3xl cursor-zoom-in overflow-hidden rounded-[2rem] border-4 border-slate-200 shadow-xl bg-white transition hover:border-violet-400"
                      title="Toca para ver en pantalla completa y leer cómodamente"
                    >
                      <img 
                        src={currentGuide?.url} 
                        alt={currentGuide?.alt}
                        className="w-full h-auto object-contain transition-transform duration-200 group-hover:scale-[1.01]"
                      />
                      <div className="absolute bottom-3 right-3 rounded-full bg-slate-900/80 px-3.5 py-1.5 text-xs font-black text-white backdrop-blur-md opacity-90 transition group-hover:opacity-100 flex items-center gap-1.5">
                        <Maximize2 size={14} /> Clic para pantalla completa
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visor de Pantalla Completa para lectura nítida */}
      <AnimatePresence>
        {fullscreen && currentGuide && (
          <motion.div
            className="fixed inset-0 z-[160] flex flex-col bg-slate-950/95 p-3 md:p-6 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Barra de control superior */}
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white backdrop-blur-md shadow-xl">
              <div className="flex items-center gap-3">
                <h3 className="text-lg md:text-xl font-black">{currentGuide.title}</h3>
                <span className="hidden sm:inline text-xs font-semibold text-slate-300">· Zoom: {Math.round(zoom * 100)}%</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoom((prev) => Math.max(0.6, prev - 0.2))}
                  className="rounded-xl border border-white/15 bg-white/10 p-2 text-white hover:bg-white/20 transition"
                  title="Alejar"
                  aria-label="Alejar"
                >
                  <ZoomOut size={18} />
                </button>
                <button
                  onClick={() => setZoom((prev) => Math.min(3.5, prev + 0.2))}
                  className="rounded-xl border border-white/15 bg-white/10 p-2 text-white hover:bg-white/20 transition"
                  title="Acercar"
                  aria-label="Acercar"
                >
                  <ZoomIn size={18} />
                </button>
                <button
                  onClick={() => setZoom(1)}
                  className="rounded-xl border border-white/15 bg-white/10 p-2 text-white hover:bg-white/20 transition"
                  title="Restablecer tamaño"
                  aria-label="Restablecer tamaño"
                >
                  <RotateCcw size={18} />
                </button>
                <button
                  onClick={() => setFullscreen(false)}
                  className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-rose-500 transition shadow-lg ml-2"
                >
                  <X size={16} /> Cerrar visor
                </button>
              </div>
            </div>

            {/* Contenedor de imagen con zoom y scroll */}
            <div className="relative flex-1 overflow-auto rounded-3xl border-2 border-white/10 bg-slate-900/80 p-4 flex items-center justify-center">
              <div 
                className="transition-transform duration-150 ease-out origin-center"
                style={{ transform: `scale(${zoom})` }}
              >
                <img
                  src={currentGuide.url}
                  alt={currentGuide.alt}
                  className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GuiaRapidaModal;

import { AnimatePresence, motion } from 'framer-motion';
import { X, Backpack, Home, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

import mochilaUrl from '../assets/guia/mochila.webp';
import planUrl from '../assets/guia/plan.webp';

type Props = {
  open: boolean;
  onClose: () => void;
};

const GuiaRapidaModal = ({ open, onClose }: Props) => {
  const [activeTab, setActiveTab] = useState<'mochila' | 'plan' | null>(null);

  const resetAndClose = () => {
    setActiveTab(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
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
            className="relative flex w-full max-w-4xl flex-col overflow-hidden rounded-[2.2rem] border-4 border-white bg-white shadow-2xl"
          >
            {/* Header */}
            <header className="relative bg-gradient-to-r from-violet-600 to-fuchsia-500 p-6 text-white md:p-8">
              <button
                onClick={resetAndClose}
                className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white hover:bg-white/30 transition backdrop-blur-sm"
              >
                <X size={24} />
              </button>
              
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 shadow-lg backdrop-blur-md">
                  <AlertTriangle size={36} className="text-yellow-300" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[.2em] text-violet-200">Guía de Supervivencia</p>
                  <h2 className="text-3xl font-black md:text-4xl">Guía Rápida</h2>
                </div>
              </div>
            </header>

            {/* Content */}
            <div className="bg-slate-50 p-6 md:p-8 min-h-[400px]">
              {!activeTab ? (
                <div className="flex h-full flex-col items-center justify-center space-y-6">
                  <p className="text-center text-xl font-bold text-slate-600 mb-4">
                    ¿Qué quieres revisar hoy, Agente?
                  </p>
                  
                  <div className="grid w-full gap-5 sm:grid-cols-2">
                    <button
                      onClick={() => setActiveTab('mochila')}
                      className="group flex flex-col items-center justify-center rounded-3xl border-4 border-orange-200 bg-white p-8 text-center shadow-[0_12px_30px_rgba(249,115,22,0.15)] transition hover:-translate-y-2 hover:border-orange-400 hover:shadow-[0_20px_40px_rgba(249,115,22,0.25)]"
                    >
                      <div className="mb-4 rounded-full bg-orange-100 p-6 text-orange-500 transition-transform group-hover:scale-110">
                        <Backpack size={64} />
                      </div>
                      <h3 className="text-2xl font-black text-slate-800">Mochila de Emergencia</h3>
                      <p className="mt-2 text-sm font-bold text-slate-500">Todo lo que debes tener listo.</p>
                    </button>

                    <button
                      onClick={() => setActiveTab('plan')}
                      className="group flex flex-col items-center justify-center rounded-3xl border-4 border-emerald-200 bg-white p-8 text-center shadow-[0_12px_30px_rgba(16,185,129,0.15)] transition hover:-translate-y-2 hover:border-emerald-400 hover:shadow-[0_20px_40px_rgba(16,185,129,0.25)]"
                    >
                      <div className="mb-4 rounded-full bg-emerald-100 p-6 text-emerald-500 transition-transform group-hover:scale-110">
                        <Home size={64} />
                      </div>
                      <h3 className="text-2xl font-black text-slate-800">Plan Familiar</h3>
                      <p className="mt-2 text-sm font-bold text-slate-500">Cómo organizarse en casa.</p>
                    </button>
                  </div>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col items-center"
                >
                  <button 
                    onClick={() => setActiveTab(null)}
                    className="mb-4 self-start font-black text-violet-600 hover:underline flex items-center gap-2"
                  >
                    &larr; Volver a las opciones
                  </button>
                  
                  <div className="w-full max-w-2xl overflow-hidden rounded-[2rem] border-4 border-slate-200 shadow-xl bg-white">
                    <img 
                      src={activeTab === 'mochila' ? mochilaUrl : planUrl} 
                      alt={activeTab === 'mochila' ? 'Mochila de emergencia' : 'Plan familiar'}
                      className="w-full h-auto object-contain"
                    />
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GuiaRapidaModal;

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  Droplets,
  EyeOff,
  Flame,
  Mountain,
  PlayCircle,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import GuideAssistant from './GuideAssistant';
import MissionVisualPanel from './MissionVisualPanel';
import Quiz from './Quiz';
import { GUIDE_STEPS } from '../utils/guideSteps';

const MISSION_IMAGE_URL = '';

const MisionVolcan = () => {
  const navigate = useNavigate();
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  const handleWinQuiz = async () => {
    setShowQuiz(false);
    setLoading(true);

    const nombre = localStorage.getItem('agenteNombre');

    if (!nombre) {
      alert('No se encontró el nombre del agente. Vuelve al lobby para registrarte.');
      setLoading(false);
      navigate('/');
      return;
    }

    localStorage.setItem('agenteNivel', '2');
    localStorage.setItem('misionVolcanCompletada', 'true');
    window.dispatchEvent(new Event('agenteNivelActualizado'));

    try {
      const { error } = await supabase
        .from('agentes')
        .update({
          mision_volcan: true,
          nivel: 2,
          ultima_conexion: new Date().toISOString()
        })
        .eq('nombre', nombre);

      if (error) {
        console.warn('Supabase no sincronizó Volcán, pero el progreso local fue guardado:', error.message);
      }
    } catch (error) {
      console.warn('Fallo de conexión con Supabase. Progreso local guardado:', error);
    }

    setIsCompleted(true);

    setTimeout(() => {
      setLoading(false);
      navigate('/hub');
    }, 1300);
  };

  const consejos = [
    {
      icono: <ShieldCheck size={20} />,
      titulo: 'Protección facial',
      texto: 'Usa mascarilla para evitar respirar ceniza.'
    },
    {
      icono: <EyeOff size={20} />,
      titulo: 'Visión segura',
      texto: 'Evita lentes de contacto si hay ceniza en el ambiente.'
    },
    {
      icono: <Droplets size={20} />,
      titulo: 'Reserva hídrica',
      texto: 'Cubre tanques y recipientes de agua.'
    }
  ];

  return (
    <main className="h-screen max-h-screen bg-[#010413] text-white relative overflow-hidden cursor-none p-3 md:p-5">

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          className="absolute left-1/2 top-1/2 w-[1100px] h-[1100px] -translate-x-1/2 -translate-y-1/2"
        >
          <div className="absolute top-0 left-1/2 w-96 h-96 bg-orange-500/35 rounded-full blur-[125px]" />
          <div className="absolute bottom-10 right-0 w-[420px] h-[420px] bg-red-500/25 rounded-full blur-[135px]" />
          <div className="absolute left-0 top-1/2 w-80 h-80 bg-yellow-400/18 rounded-full blur-[120px]" />
        </motion.div>

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.045)_1px,transparent_1px)] [background-size:32px_32px] opacity-40" />
      </div>

      <section className="relative z-10 h-full max-w-7xl mx-auto grid grid-rows-[auto_1fr] gap-4">
        <header className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[2rem] px-5 py-4 flex items-center justify-between gap-4 shadow-2xl">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-orange-400 mb-1">
              <Flame size={15} className="animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.35em]">Protocolo de ceniza activado</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none">
              Alerta <span className="text-orange-500">Volcánica</span>
            </h1>
          </div>

          <button
            onClick={() => navigate('/hub')}
            className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-3 rounded-2xl text-white/60 text-[10px] font-black uppercase tracking-widest hover:text-orange-400 hover:border-orange-400/40 transition-all"
          >
            <ChevronLeft size={16} />
            <span className="hidden sm:inline">Volver al Hub</span>
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.8fr] gap-4 min-h-0">
          <section className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[2rem] overflow-hidden min-h-0 grid grid-rows-[1fr_auto]">
            <MissionVisualPanel
              imageUrl={MISSION_IMAGE_URL}
              missionLabel="Misión 01"
              title="Actividad volcánica"
              description="Reconoce señales de alerta, protege tus vías respiratorias y ubica zonas seguras ante caída de ceniza."
              accentTextClass="text-orange-300"
              accentBgClass="from-orange-950 via-red-950 to-slate-950"
              icon={<Mountain size={16} />}
            />

            <div className="p-4 md:p-5 bg-slate-950/60 border-t border-white/10">
              <div className="flex items-start gap-3">
                <div className="bg-orange-500/15 border border-orange-400/20 p-3 rounded-2xl text-orange-300">
                  <AlertTriangle size={20} />
                </div>

                <div>
                  <h3 className="text-orange-300 font-black text-[10px] uppercase tracking-[0.25em] mb-1">Análisis de misión</h3>
                  <p className="text-white/70 text-xs md:text-sm leading-relaxed font-semibold">
                    El volcán Tungurahua forma parte de la identidad del Distrito 18D03. Aprende a proteger tus vías respiratorias, cuidar el agua y reconocer zonas de riesgo.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <aside className="grid grid-rows-[auto_1fr_auto] gap-4 min-h-0">
            <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[2rem] p-5">
              <div className="flex items-center gap-2 text-orange-300 mb-2">
                <Sparkles size={16} />
                <span className="text-[9px] font-black uppercase tracking-[0.28em]">Objetivo</span>
              </div>
              <p className="text-sm text-white/75 font-semibold leading-relaxed">
                Observa el escenario, recuerda los consejos tácticos y completa la evaluación para subir al Nivel 2.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 min-h-0">
              {consejos.map((item) => (
                <motion.div key={item.titulo} whileHover={{ y: -3, scale: 1.01 }} className="bg-white/5 border border-white/10 rounded-[1.5rem] p-4 backdrop-blur-xl">
                  <div className="flex items-start gap-3">
                    <div className="bg-orange-500/15 border border-orange-400/20 p-2.5 rounded-2xl text-orange-300">{item.icono}</div>
                    <div>
                      <h4 className="font-black text-[10px] uppercase tracking-widest mb-1 text-white">{item.titulo}</h4>
                      <p className="text-slate-400 text-[11px] leading-relaxed font-semibold uppercase">{item.texto}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.button
              type="button"
              onClick={() => setShowQuiz(true)}
              disabled={loading || isCompleted}
              whileHover={!loading && !isCompleted ? { scale: 1.02, y: -2 } : {}}
              whileTap={!loading && !isCompleted ? { scale: 0.97 } : {}}
              className={`w-full p-4 rounded-[1.5rem] font-black uppercase tracking-[0.22em] transition-all flex items-center justify-center gap-3 text-xs md:text-sm ${
                isCompleted ? 'bg-emerald-500 text-white' : 'bg-orange-600 hover:bg-orange-500 text-white shadow-[0_15px_35px_rgba(249,115,22,0.28)]'
              } disabled:opacity-70`}
            >
              {loading ? 'Actualizando nivel...' : isCompleted ? <><CheckCircle2 size={18} />Misión lograda</> : <><PlayCircle size={18} />Iniciar evaluación</>}
            </motion.button>
          </aside>
        </div>
      </section>

      {showQuiz && <Quiz tipo="volcan" onClose={() => setShowQuiz(false)} onWin={handleWinQuiz} />}

      <GuideAssistant guideId="mision-volcan" steps={GUIDE_STEPS['mision-volcan']} />
    </main>
  );
};

export default MisionVolcan;

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  ChevronLeft,
  ClipboardCheck,
  PlayCircle,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import misionDiagnosticoHeroUrl from '../assets/mision-diagnostico-hero.webp';
import GuideAssistant from './GuideAssistant';
import MissionVisualPanel from './MissionVisualPanel';
import Quiz from './Quiz';
import { GUIDE_STEPS } from '../utils/guideSteps';

const MISSION_IMAGE_URL = misionDiagnosticoHeroUrl;

const MisionDiagnostico = () => {
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
    localStorage.setItem('misionDiagnosticoCompletada', 'true');
    window.dispatchEvent(new Event('agenteNivelActualizado'));

    try {
      const registroId = localStorage.getItem('agenteRegistroId');
      const query = supabase
        .from('agentes')
        .update({
          mision_diagnostico: true,
          nivel: 2,
          ultima_conexion: new Date().toISOString()
        });

      const { error } = registroId ? await query.eq('id', registroId) : await query.eq('nombre', nombre);

      if (error) {
        console.warn('Supabase no sincronizó Diagnóstico, pero el progreso local fue guardado:', error.message);
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
      icono: <ClipboardCheck size={20} />,
      titulo: 'Conocimientos previos',
      texto: 'Responde con lo que ya sabes sobre desastres naturales.'
    },
    {
      icono: <Sparkles size={20} />,
      titulo: 'Sin apuros',
      texto: 'Tómate tu tiempo, puedes intentarlo de nuevo si te equivocas.'
    },
    {
      icono: <ShieldCheck size={20} />,
      titulo: 'Tu punto de partida',
      texto: 'Así sabremos desde dónde empieza tu aventura como agente.'
    }
  ];

  return (
    <main className="h-screen max-h-screen bg-[#010413] text-white relative overflow-hidden cursor-none p-3 md:p-5">

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute left-1/2 top-1/2 w-[1100px] h-[1100px] -translate-x-1/2 -translate-y-1/2"
        >
          <div className="absolute top-0 left-1/2 w-96 h-96 bg-indigo-500/35 rounded-full blur-[125px]" />
          <div className="absolute bottom-10 right-0 w-[420px] h-[420px] bg-violet-500/28 rounded-full blur-[135px]" />
          <div className="absolute left-0 top-1/2 w-80 h-80 bg-sky-400/18 rounded-full blur-[120px]" />
        </motion.div>

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.045)_1px,transparent_1px)] [background-size:32px_32px] opacity-40" />
      </div>

      <section className="relative z-10 h-full max-w-7xl mx-auto grid grid-rows-[auto_1fr] gap-4">
        <header className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[2rem] px-5 py-4 flex items-center justify-between gap-4 shadow-2xl">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-indigo-300 mb-1">
              <ClipboardCheck size={15} className="animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.35em]">Evaluación de conocimientos previos</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none">
              Diagnóstico <span className="text-indigo-400">Inicial</span>
            </h1>
          </div>

          <button
            onClick={() => navigate('/hub')}
            className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-3 rounded-2xl text-white/60 text-[10px] font-black uppercase tracking-widest hover:text-indigo-300 hover:border-indigo-400/40 transition-all"
          >
            <ChevronLeft size={16} />
            <span className="hidden sm:inline">Volver al Hub</span>
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-4 min-h-0">
          <section className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[2rem] overflow-hidden min-h-0 grid grid-rows-[1fr_auto]">
            <MissionVisualPanel
              imageUrl={MISSION_IMAGE_URL}
              missionLabel="Misión 01"
              title="¿Qué tanto sabes?"
              description="Antes de comenzar tus misiones, queremos saber qué tanto conoces sobre Gestión de Riesgos: amenazas, vulnerabilidad, prevención, resiliencia y más conceptos clave que todo Agente de Prevención debe dominar."
              accentTextClass="text-indigo-300"
              accentBgClass="from-indigo-950 via-violet-950 to-slate-950"
              icon={<ClipboardCheck size={16} />}
            />

            <div className="p-4 md:p-5 bg-slate-950/60 border-t border-white/10">
              <div className="flex items-start gap-3">
                <div className="bg-indigo-500/15 border border-indigo-400/20 p-3 rounded-2xl text-indigo-300">
                  <ShieldCheck size={20} />
                </div>

                <div>
                  <h3 className="text-indigo-300 font-black text-[10px] uppercase tracking-[0.25em] mb-1">Análisis de misión</h3>
                  <p className="text-white/70 text-xs md:text-sm leading-relaxed font-semibold">
                    Este diagnóstico nos ayuda a conocer qué tanto sabes sobre desastres naturales antes de comenzar tus misiones. No necesitas prepararte, solo responde lo que ya sabes.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <aside className="grid grid-rows-[auto_1fr_auto] gap-4 min-h-0">
            <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[2rem] p-5">
              <div className="flex items-center gap-2 text-indigo-300 mb-2">
                <Sparkles size={16} />
                <span className="text-[9px] font-black uppercase tracking-[0.28em]">Objetivo</span>
              </div>
              <p className="text-sm text-white/75 font-semibold leading-relaxed">
                Responde las 10 preguntas sobre conceptos de Gestión de Riesgos y sube al Nivel 2 para desbloquear tu primera misión.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 min-h-0">
              {consejos.map((item) => (
                <motion.div key={item.titulo} whileHover={{ y: -3, scale: 1.01 }} className="bg-white/5 border border-white/10 rounded-[1.5rem] p-4 backdrop-blur-xl">
                  <div className="flex items-start gap-3">
                    <div className="bg-indigo-500/15 border border-indigo-400/20 p-2.5 rounded-2xl text-indigo-300">{item.icono}</div>
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
                isCompleted ? 'bg-emerald-500 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_15px_35px_rgba(79,70,229,0.28)]'
              } disabled:opacity-70`}
            >
              {loading ? 'Actualizando nivel...' : isCompleted ? <><CheckCircle2 size={18} />Nivel 2 desbloqueado</> : <><PlayCircle size={18} />Iniciar evaluación</>}
            </motion.button>
          </aside>
        </div>
      </section>

      {showQuiz && <Quiz tipo="diagnostico" onClose={() => setShowQuiz(false)} onWin={handleWinQuiz} />}

      <GuideAssistant guideId="mision-diagnostico" steps={GUIDE_STEPS['mision-diagnostico']} />
    </main>
  );
};

export default MisionDiagnostico;

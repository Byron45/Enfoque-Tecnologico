import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Award,
  BookOpen,
  ChevronRight,
  Compass,
  LogOut,
  Map,
  Mountain,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Star,
  Video,
  Waves
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import brandLogoUrl from '../assets/logo-agentes-prevencion.png';
import GuideAssistant from './GuideAssistant';
import { GUIDE_STEPS } from '../utils/guideSteps';

const LOGO_URL = brandLogoUrl;

const AVATARS = {
  chica: 'https://blogger.googleusercontent.com/img/a/AVvXsEh_PnIcFYcgmsvgfKqk4Mr0s40x0a5f1_pIFmBRlR0oVInL1-uaLQIez5BrYNp-ua4-mBmHqb2A8Ox4tElSIJx3LtHnBaO-cGTxzHomjYO1f2X6KQzCYn8I0LmpqNe6o1UiXhc814JjCv0hWJ3kME5gcDJ1czrxl7xYge9BE214gnYyrIHHqxwuTMyoxPjd',
  chico: 'https://blogger.googleusercontent.com/img/a/AVvXsEhGuah8gRxjKHRH2XeN_K7ew3dlo-4QNWudy46AsoT91CiPXkrU9JDEA1wQ1iyIcYj23qQGhITb2EJpIMP1bww_g24vx1-yYp6dYz1agR_nWX6pazjghCNOXXKGvdI0nzDG173acHzltH-fCPlxYYkVQhA47V7aFNiZmVH4HAZf8OTIqtiu0DiI7SIOd5Qe'
};

const missions = [
  {
    title: 'Alerta Volcánica',
    description: 'Aprende a protegerte de la ceniza y actuar con calma.',
    path: '/volcan',
    level: 1,
    icon: Mountain,
    gradient: 'from-orange-500 via-red-500 to-pink-500',
    sticker: '🌋'
  },
  {
    title: 'Inundaciones',
    description: 'Descubre rutas altas, lugares seguros y señales de alerta.',
    path: '/inundacion',
    level: 2,
    icon: Waves,
    gradient: 'from-sky-500 via-cyan-500 to-blue-600',
    sticker: '🌊'
  },
  {
    title: 'Evacuación',
    description: 'Practica cómo salir con orden y llegar al punto seguro.',
    path: '/evacuacion',
    level: 3,
    icon: Compass,
    gradient: 'from-emerald-500 via-green-500 to-lime-500',
    sticker: '🧭'
  }
];

const tools = [
  { title: 'Videos', text: 'Mira cápsulas cortas y entretenidas.', path: '/videos', icon: Video, accent: 'border-rose-200 bg-rose-50 text-rose-700' },
  { title: 'Mapas', text: 'Explora amenazas y zonas seguras.', path: '/mapas', icon: Map, accent: 'border-cyan-200 bg-cyan-50 text-cyan-700' },
  { title: 'Guía rápida', text: 'Recuerda los pasos más importantes.', path: '/hub', icon: BookOpen, accent: 'border-violet-200 bg-violet-50 text-violet-700' }
];

const KidHub = () => {
  const navigate = useNavigate();
  const [level, setLevel] = useState(1);
  const [name, setName] = useState('Agente');
  const [school, setSchool] = useState('Tu escuela');
  const [avatar, setAvatar] = useState<'chica' | 'chico'>('chico');

  useEffect(() => {
    const sync = () => {
      setName(localStorage.getItem('agenteNombre') || 'Agente');
      setSchool(localStorage.getItem('agenteEscuela') || 'Tu escuela');
      setAvatar(localStorage.getItem('agenteAvatar') === 'chica' ? 'chica' : 'chico');
      const storedLevel = Number(localStorage.getItem('agenteNivel') || '1');
      setLevel(Number.isFinite(storedLevel) ? Math.min(Math.max(storedLevel, 1), 4) : 1);
    };

    sync();
    window.addEventListener('focus', sync);
    window.addEventListener('agenteNivelActualizado', sync);
    return () => {
      window.removeEventListener('focus', sync);
      window.removeEventListener('agenteNivelActualizado', sync);
    };
  }, []);

  const progress = useMemo(() => Math.round(((level - 1) / 3) * 100), [level]);

  const logout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/');
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#071D4A] p-4 text-slate-950 md:p-7">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-10 h-80 w-80 rounded-full bg-cyan-400/30 blur-3xl" />
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-violet-500/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-orange-400/15 blur-3xl" />
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle,white_1.5px,transparent_1.5px)] [background-size:28px_28px]" />
      </div>

      <section className="relative z-10 mx-auto max-w-[1450px] space-y-6">
        <header className="overflow-hidden rounded-[2.5rem] border-4 border-white bg-gradient-to-r from-[#0B4BB3] via-[#176ED8] to-[#16B7D8] text-white shadow-[0_28px_80px_rgba(0,0,0,.3)]">
          <div className="grid gap-5 p-5 lg:grid-cols-[auto_1fr_auto] lg:items-center md:p-7">
            <div className="mission-logo-frame flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-[6px] shadow-xl md:h-36 md:w-36">
              <img src={LOGO_URL} alt="Logo Misión Prevención" className="mission-logo-image" />
            </div>

            <div>
              <div className="inline-flex items-center gap-2 rounded-full border-2 border-white/35 bg-white/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.2em] backdrop-blur-md"><Sparkles size={15} className="text-yellow-300" /> Centro de aventura 18D03</div>
              <h1 className="mt-3 text-4xl font-black leading-none md:text-6xl">¡Hola, {name}!</h1>
              <p className="mt-2 max-w-xl text-sm font-bold text-cyan-50 md:text-base">{school}</p>
            </div>

            <div className="flex items-center gap-3 lg:justify-end">
              <img src={AVATARS[avatar]} alt="Avatar del agente" className="h-24 w-24 rounded-[1.8rem] border-4 border-white bg-white object-cover p-1 shadow-xl" />
              <button onClick={logout} className="rounded-2xl border-2 border-white/40 bg-white/15 px-4 py-3 text-xs font-black uppercase tracking-wider text-white backdrop-blur-md hover:bg-white/25"><LogOut size={17} className="mr-2 inline" />Salir</button>
            </div>
          </div>
        </header>

        <section className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
          <article className="rounded-[2.2rem] border-4 border-white bg-white p-5 shadow-[0_22px_65px_rgba(0,0,0,.2)] md:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.2em] text-violet-600">Tu camino de héroe</p>
                <h2 className="mt-1 text-3xl font-black text-[#071D4A] md:text-4xl">Nivel {level} de 4</h2>
              </div>
              <div className="rounded-2xl bg-yellow-300 p-4 text-yellow-900 shadow-lg"><Star size={34} fill="currentColor" /></div>
            </div>
            <div className="mt-5 h-6 overflow-hidden rounded-full border-2 border-violet-100 bg-violet-50 shadow-inner">
              <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: .7 }} className="h-full rounded-full bg-gradient-to-r from-orange-500 via-pink-500 to-violet-600" />
            </div>
            <p className="mt-4 text-sm font-bold text-slate-600">Completa una misión para ganar estrellas y desbloquear la siguiente aventura.</p>
          </article>

          <article className="rounded-[2.2rem] border-4 border-white bg-gradient-to-br from-emerald-50 to-cyan-50 p-5 shadow-[0_22px_65px_rgba(0,0,0,.2)] md:p-7">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-emerald-500 p-4 text-white shadow-lg"><ShieldCheck size={32} /></div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.2em] text-emerald-700">Consejo del día</p>
                <h3 className="mt-2 text-2xl font-black text-[#071D4A]">¡Mantén la calma y sigue las señales!</h3>
                <p className="mt-2 text-sm font-bold leading-relaxed text-slate-600">Aprender antes de una emergencia te ayuda a tomar mejores decisiones.</p>
              </div>
            </div>
          </article>
        </section>

        <section>
          <div className="mb-4 flex items-end justify-between gap-4 text-white">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.2em] text-cyan-300">Misiones principales</p>
              <h2 className="text-4xl font-black">Elige tu próxima aventura</h2>
            </div>
            <Award className="hidden text-yellow-300 md:block" size={48} />
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {missions.map((mission) => {
              const unlocked = level >= mission.level;
              const Icon = mission.icon;

              return (
                <motion.article key={mission.path} whileHover={unlocked ? { y: -8, rotate: -.4 } : undefined} className="overflow-hidden rounded-[2.2rem] border-4 border-white bg-white shadow-[0_22px_65px_rgba(0,0,0,.22)]">
                  <div className={`relative min-h-48 bg-gradient-to-br ${mission.gradient} p-5 text-white`}>
                    <div className="absolute right-5 top-4 text-6xl drop-shadow-lg">{mission.sticker}</div>
                    <div className="relative z-10 flex min-h-40 flex-col justify-between">
                      <div className="w-fit rounded-2xl border-2 border-white/30 bg-white/20 p-3 backdrop-blur-sm"><Icon size={32} /></div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[.18em] text-white/85">Misión {mission.level}</p>
                        <h3 className="mt-1 text-3xl font-black leading-none">{mission.title}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="min-h-14 text-sm font-bold leading-relaxed text-slate-600">{mission.description}</p>
                    <button onClick={() => unlocked && navigate(mission.path)} disabled={!unlocked} className={`mt-4 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-4 text-xs font-black uppercase tracking-wider transition ${unlocked ? 'bg-[#121F4D] text-white hover:-translate-y-1 hover:bg-violet-700' : 'cursor-not-allowed bg-slate-100 text-slate-400'}`}>
                      {unlocked ? <><PlayCircle size={18} /> Entrar a la misión <ChevronRight size={18} /></> : <>🔒 Completa la misión anterior</>}
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </section>

        <section>
          <p className="text-[10px] font-black uppercase tracking-[.2em] text-cyan-300">Caja de herramientas</p>
          <h2 className="mt-1 text-3xl font-black text-white">Aprende de otras formas</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <button key={tool.title} onClick={() => navigate(tool.path)} className={`rounded-[2rem] border-4 p-5 text-left shadow-[0_18px_50px_rgba(0,0,0,.18)] transition hover:-translate-y-1 ${tool.accent}`}>
                  <Icon size={30} />
                  <h3 className="mt-3 text-2xl font-black">{tool.title}</h3>
                  <p className="mt-1 text-sm font-bold opacity-80">{tool.text}</p>
                </button>
              );
            })}
          </div>
        </section>
      </section>

      <GuideAssistant guideId="hub" steps={GUIDE_STEPS.hub} />
    </main>
  );
};

export default KidHub;

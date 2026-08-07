import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle2,
  ChevronRight,
  Map,
  MapPin,
  Rocket,
  School,
  ShieldCheck,
  Sparkles,
  UserRound,
  UsersRound,
  Video,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import brandLogoUrl from '../assets/logo-agentes-prevencion.png';
import GuideAssistant from './GuideAssistant';
import { supabase } from '../supabaseClient';
import { GUIDE_STEPS } from '../utils/guideSteps';

const LOGO_URL = brandLogoUrl;

const AVATARS = {
  chica: 'https://blogger.googleusercontent.com/img/a/AVvXsEh_PnIcFYcgmsvgfKqk4Mr0s40x0a5f1_pIFmBRlR0oVInL1-uaLQIez5BrYNp-ua4-mBmHqb2A8Ox4tElSIJx3LtHnBaO-cGTxzHomjYO1f2X6KQzCYn8I0LmpqNe6o1UiXhc814JjCv0hWJ3kME5gcDJ1czrxl7xYge9BE214gnYyrIHHqxwuTMyoxPjd',
  chico: 'https://blogger.googleusercontent.com/img/a/AVvXsEhGuah8gRxjKHRH2XeN_K7ew3dlo-4QNWudy46AsoT91CiPXkrU9JDEA1wQ1iyIcYj23qQGhITb2EJpIMP1bww_g24vx1-yYp6dYz1agR_nWX6pazjghCNOXXKGvdI0nzDG173acHzltH-fCPlxYYkVQhA47V7aFNiZmVH4HAZf8OTIqtiu0DiI7SIOd5Qe'
};

const ESCUELAS = [
  'Colegio De Bachillerato Pcei Agoyán',
  'Escuela Augusto N Martinez',
  'Escuela Gonzalo Pizarro',
  'Escuela Gran Ducado De Luxemburgo',
  'Escuela Jose Ignacio Vela',
  'Escuela Leonidas Garcia',
  'Escuela Manuel Andrade',
  'Escuela Nicolas Vasconez',
  'Escuela Pablo Arturo Suarez',
  'Escuela Pedro Vicente Maldonado',
  'Extensión Unidad Educativa San Pio X',
  'Gonzalo Abad Grijalva',
  'Unidad Educativa Baños',
  'Unidad Educativa Doctor Misael Acosta Solis',
  'Unidad Educativa Fray Sebastian Acosta',
  'Unidad Educativa Oscar Efren Reyes',
  'Unidad Educativa Palomino Flores',
  'Unidad Educativa Puerta Del Dorado',
  'Unidad Educativa Rio Negro'
];

const SABIAS_QUE = [
  '¡Los desastres NO son naturales! Lo natural es que llueva o tiemble; el desastre ocurre únicamente cuando no estamos preparados para ello.',
  'La "vulnerabilidad" es como salir a la lluvia sin paraguas. Mientras más conozcamos los peligros de nuestro entorno, menos vulnerables seremos.',
  '¡Tu Mochila de Emergencia es tu escudo protector! Debe contener todo lo necesario para cuidarte durante 3 días o 72 horas.',
  'Una urgencia la puede solventar la comunidad o la escuela, pero una emergencia real ¡Necesita que llamemos a los verdaderos héroes del ECU 911!',
  'Hacer llamadas de broma al 9-1-1 es muy peligroso. Podrías hacer que una ambulancia pierda tiempo y no llegue a salvar una vida real.',
  '¡Tu familia es tu mejor equipo de rescate! Tener un Plan Familiar de Emergencias les ayuda a saber exactamente qué hacer y dónde encontrarse si algo pasa.',
  'Nuestro hermoso cantón convive con ríos, montañas y el gran volcán Tungurahua. ¡Conocer las Zonas Seguras y rutas de evacuación es nuestro súper poder!',
  'Si la tierra empieza a temblar, debes actuar como un ninja. Solo recuerda los tres pasos vitales: ¡Agáchate, cúbrete debajo de una mesa y agárrate fuerte!',
  'Al escuchar la alarma de evacuación, somos como tortugas sabias y no como liebres asustadas. Caminar rápido pero sin correr evita que nos lastimemos.'
];

const KidLobby = () => {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [escuela, setEscuela] = useState('');
  const [edad, setEdad] = useState(9);
  const [avatar, setAvatar] = useState<'chica' | 'chico' | ''>('');
  const [showSchools, setShowSchools] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sabiasQueIndex, setSabiasQueIndex] = useState(0);

  const listo = useMemo(() => Boolean(nombre.trim() && escuela && avatar), [nombre, escuela, avatar]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSabiasQueIndex((current) => (current + 1) % SABIAS_QUE.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!listo || loading) return;

    setLoading(true);
    const cleanName = nombre.trim();

    localStorage.setItem('agenteNombre', cleanName);
    localStorage.setItem('agenteEscuela', escuela);
    localStorage.setItem('agenteEdad', String(edad));
    localStorage.setItem('agenteAvatar', avatar);
    localStorage.setItem('agenteNivel', '1');
    localStorage.setItem('misionVolcanCompletada', 'false');
    localStorage.setItem('misionInundacionCompletada', 'false');
    localStorage.setItem('misionSismoCompletada', 'false');
    localStorage.setItem('misionEvacuacionCompletada', 'false');
    sessionStorage.removeItem('introTerritorialVista');

    try {
      const { error } = await supabase.from('agentes').insert([{
        nombre: cleanName,
        institucion: escuela,
        edad,
        avatar,
        nivel: 1,
        mision_volcan: false,
        mision_inundacion: false,
        mision_sismo: false,
        mision_evacuacion: false,
        ultima_conexion: new Date().toISOString()
      }]);
      if (error) console.warn('Registro guardado localmente; Supabase no respondió:', error.message);
    } catch (error) {
      console.warn('Registro guardado localmente:', error);
    }

    window.dispatchEvent(new Event('agenteNivelActualizado'));
    window.setTimeout(() => navigate('/hub'), 350);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#071D4A] p-3 text-slate-950 md:p-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-cyan-400/35 blur-3xl" />
        <div className="absolute right-0 top-12 h-96 w-96 rounded-full bg-violet-500/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-orange-400/20 blur-3xl" />
        <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle,white_1.5px,transparent_1.5px)] [background-size:26px_26px]" />
      </div>

      <motion.section
        initial={{ opacity: 0, y: 18, scale: .985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: .38 }}
        className="relative z-10 mx-auto grid min-h-[calc(100vh-3rem)] max-w-[1440px] overflow-hidden rounded-[2.8rem] border-4 border-white/80 bg-white shadow-[0_35px_110px_rgba(0,0,0,.35)] lg:grid-cols-[.92fr_1.08fr]"
      >
        <aside className="relative overflow-hidden bg-gradient-to-br from-[#0B4BB3] via-[#176ED8] to-[#16B7D8] p-6 text-white md:p-9">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full border-[34px] border-yellow-300/85" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full border-[38px] border-pink-400/55" />
          <div className="absolute left-10 top-1/2 h-24 w-24 rounded-full bg-lime-300/35 blur-xl" />

          <div className="relative z-10 flex h-full flex-col gap-5">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border-2 border-white/40 bg-white/15 px-4 py-2 text-[11px] font-black uppercase tracking-[.2em] backdrop-blur-md">
              <Sparkles size={16} className="text-yellow-300" /> Distrito 18D03
            </div>

            <h1 className="text-[3.35rem] leading-[.86] tracking-tight md:text-[5rem] [-webkit-text-stroke:1.5px_white] [font-weight:900]">
              MISIÓN
              <span className="mt-2 block bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 bg-clip-text text-transparent [-webkit-text-stroke:1.5px_#f97316]">PREVENCIÓN</span>
            </h1>

            <p className="max-w-xl text-xl font-bold leading-relaxed text-cyan-50 md:text-3xl">
              Plataforma de educación en Gestión de Riesgos de Desastres para el distrito 18D03.
            </p>

            <div className="mx-auto flex w-full max-w-[500px] items-center justify-center py-1">
              <div className="mission-logo-frame relative flex h-72 w-72 items-center justify-center overflow-hidden rounded-full border-[10px] shadow-[0_22px_65px_rgba(1,21,70,.35)] md:h-80 md:w-80 lg:h-96 lg:w-96">
                <img src={LOGO_URL} alt="Logo Misión Prevención 18D03" className="mission-logo-image relative" />
              </div>
            </div>

            <p className="max-w-xl text-xl font-black leading-snug text-yellow-300 md:text-3xl">
              Conoce el riesgo, actúa con seguridad y protege tu comunidad.
            </p>
          </div>
        </aside>

        <section className="relative bg-[#F7FAFF] p-5 md:p-8 lg:p-9">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-bl-[6rem] bg-yellow-300/70" />
          <div className="relative mx-auto max-w-3xl">
            <div className="mb-5 flex items-center gap-4 rounded-[2rem] bg-[#121F4D] p-5 text-white shadow-[0_18px_45px_rgba(18,31,77,.18)]">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-pink-500 shadow-lg"><Rocket size={28} /></div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.22em] text-yellow-300">Crea tu agente</p>
                <h2 className="mt-1 text-2xl font-black md:text-4xl">¡Prepárate para la aventura!</h2>
              </div>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <label className="block rounded-[1.6rem] border-2 border-sky-200 bg-white p-4 shadow-[0_8px_24px_rgba(51,96,160,.08)]">
                <span className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[.16em] text-sky-700"><UserRound size={18} /> Tu nombre</span>
                <input value={nombre} onChange={(event) => setNombre(event.target.value)} required placeholder="Escribe tu nombre..." className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3.5 text-base font-black text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100" />
              </label>

              <div className="rounded-[1.6rem] border-2 border-violet-200 bg-white p-4 shadow-[0_8px_24px_rgba(91,51,160,.08)]">
                <p className="mb-3 flex items-center gap-2 text-[11px] font-black uppercase tracking-[.16em] text-violet-700"><UsersRound size={18} /> Tu edad: {edad} años</p>
                <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
                  {[6, 7, 8, 9, 10, 11].map((value) => (
                    <button key={value} type="button" onClick={() => setEdad(value)} className={`rounded-xl border-2 px-3 py-3 text-lg font-black transition ${edad === value ? 'border-violet-700 bg-violet-700 text-white shadow-[0_8px_18px_rgba(109,40,217,.28)]' : 'border-violet-100 bg-violet-50 text-violet-700 hover:-translate-y-1 hover:border-violet-300'}`}>{value}</button>
                  ))}
                </div>
              </div>

              <button type="button" onClick={() => setShowSchools(true)} className="flex w-full items-center justify-between rounded-[1.6rem] border-2 border-cyan-200 bg-white p-4 text-left shadow-[0_8px_24px_rgba(10,126,150,.08)] transition hover:-translate-y-1 hover:border-cyan-400">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[.16em] text-cyan-700">Tu escuela</p>
                  <p className={`mt-1 font-black ${escuela ? 'text-slate-900' : 'text-slate-400'}`}>{escuela || 'Toca aquí para seleccionar'}</p>
                </div>
                <div className="rounded-2xl bg-cyan-100 p-3 text-cyan-700"><MapPin /></div>
              </button>

              <div className="rounded-[1.6rem] border-2 border-amber-200 bg-white p-4 shadow-[0_8px_24px_rgba(180,120,20,.08)]">
                <p className="mb-3 text-[11px] font-black uppercase tracking-[.16em] text-amber-700">Elige tu personaje</p>
                <div className="grid grid-cols-2 gap-3">
                  {(['chica', 'chico'] as const).map((kind) => {
                    const selected = avatar === kind;
                    return (
                      <button key={kind} type="button" onClick={() => setAvatar(kind)} className={`relative rounded-[1.5rem] border-3 p-3 transition hover:-translate-y-1 ${selected ? (kind === 'chica' ? 'border-pink-500 bg-pink-50 shadow-lg' : 'border-blue-500 bg-blue-50 shadow-lg') : 'border-slate-200 bg-slate-50'}`}>
                        {selected && <CheckCircle2 className="absolute right-3 top-3 text-emerald-500" size={22} />}
                        <img src={AVATARS[kind]} alt={kind === 'chica' ? 'Avatar niña' : 'Avatar niño'} className="mx-auto h-24 w-24 rounded-full border-4 border-white bg-white object-cover shadow-md md:h-28 md:w-28" />
                        <p className="mt-2 text-sm font-black uppercase text-slate-800">{kind === 'chica' ? 'Niña' : 'Niño'}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button type="submit" disabled={!listo || loading} className="flex w-full items-center justify-center gap-3 rounded-[1.5rem] bg-gradient-to-r from-orange-500 via-pink-500 to-violet-600 px-5 py-4 text-sm font-black uppercase tracking-[.14em] text-white shadow-[0_14px_32px_rgba(236,72,153,.28)] transition hover:-translate-y-1 disabled:translate-y-0 disabled:cursor-not-allowed disabled:grayscale disabled:opacity-35">
                {loading ? 'Preparando tu misión...' : 'Comenzar aventura'} <ChevronRight size={21} />
              </button>
            </form>

            <div className="mt-4 overflow-hidden rounded-[1.4rem] border-2 border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
              <div className="mb-3 flex items-center gap-3">
                <ShieldCheck className="shrink-0 text-emerald-600" />
                <p className="text-[11px] font-black uppercase tracking-[.18em] text-black">¿Sabías que...?</p>
              </div>
              <AnimatePresence mode="wait">
                <motion.p
                  key={sabiasQueIndex}
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -18 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                  className="whitespace-pre-line text-sm font-bold leading-relaxed text-emerald-900"
                >
                  {SABIAS_QUE[sabiasQueIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </section>
      </motion.section>

      <AnimatePresence>
        {showSchools && (
          <motion.div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#071D4A]/75 p-4 backdrop-blur-lg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.section initial={{ y: 30, scale: .96 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: .96 }} className="max-h-[88vh] w-full max-w-5xl overflow-y-auto rounded-[2.4rem] border-4 border-white bg-[#F7FAFF] p-5 shadow-2xl md:p-7">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[.2em] text-cyan-700">Escuelas 18D03</p>
                  <h3 className="text-3xl font-black text-slate-900">Elige tu base de entrenamiento</h3>
                </div>
                <button onClick={() => setShowSchools(false)} className="rounded-full bg-rose-500 p-3 text-white shadow-lg hover:bg-rose-400" aria-label="Cerrar"><X /></button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {ESCUELAS.map((item) => (
                  <button key={item} onClick={() => { setEscuela(item); setShowSchools(false); }} className={`rounded-2xl border-2 p-4 text-left font-black transition hover:-translate-y-1 ${escuela === item ? 'border-cyan-500 bg-cyan-50 text-cyan-900 shadow-md' : 'border-slate-200 bg-white text-slate-700 hover:border-amber-300'}`}>
                    <School className="mb-2 text-orange-500" size={22} />{item}
                  </button>
                ))}
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>

      <GuideAssistant guideId="lobby" steps={GUIDE_STEPS.lobby} />
    </main>
  );
};

export default KidLobby;

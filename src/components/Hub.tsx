import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  CalendarDays,
  ChevronRight,
  CheckCircle2,
  Download,
  Image as ImageIcon,
  Lock,
  LogOut,
  Map,
  Mountain,
  Navigation,
  PartyPopper,
  PlayCircle,
  ShieldCheck,
  Trophy,
  Video,
  Waves
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type AvatarTipo = 'chico' | 'chica';

type Mision = {
  id: number;
  nivelReq: number;
  titulo: string;
  path: string;
  desc: string;
  etiqueta: string;
  icono: React.ReactNode;
  colorCard: string;
  imageUrl: string;
  imagenHint: string;
  enfoque: string;
};

type Herramienta = {
  titulo: string;
  desc: string;
  estado: string;
  icono: React.ReactNode;
  color: string;
  imageUrl: string;
  path?: string;
};

const AVATARES: Record<AvatarTipo, Record<number, string>> = {
  chico: {
    1: 'https://blogger.googleusercontent.com/img/a/AVvXsEhGuah8gRxjKHRH2XeN_K7ew3dlo-4QNWudy46AsoT91CiPXkrU9JDEA1wQ1iyIcYj23qQGhITb2EJpIMP1bww_g24vx1-yYp6dYz1agR_nWX6pazjghCNOXXKGvdI0nzDG173acHzltH-fCPlxYYkVQhA47V7aFNiZmVH4HAZf8OTIqtiu0DiI7SIOd5Qe',
    2: 'https://blogger.googleusercontent.com/img/a/AVvXsEizXHFAdZxxjxs6OyKA5mDb36jBuoKPO-Vk2GPY8g4xCtANZkapvPFu6IswUMUz0Iqwy50NccyHZi-4QXFZ_JvJiFOOAS9gTMl8ZcFKMvtNrn5ihXFhqNp4ENNgQVFXeQ2vwFCyF7TDOMsNsyW4MLTdz0QhEEZ44mkHlnsekTt6HFkZrUE7Qll34AJpjha6',
    3: 'https://blogger.googleusercontent.com/img/a/AVvXsEjsMXigzB_LoYR9gB8IGUvpI3V-KLoW02oxQeRZBWpCOu9f7Sf7oYJrwG3xgqCUyYQr_q3gdEFtUUl2XdimRlauT2Ic2NcroGfolDI__HIpw_tYZ6DTP3LEuIXgfAr2EVs4mth6sxyZIiqFMEVg22xeRRmm0vjrq8_JWvspQcVNZS7NN53SXUoD0VWU0gxy',
    4: 'https://blogger.googleusercontent.com/img/a/AVvXsEg60OHSsVV0ARSpxIUSSm4CFgRpnvmvRgC8wXrfsPZolyMMjv0XfD6FjPmrWl5St0jtk7s0nMrip8YNe3EvmYMg82ywuxuTb25CnGBXgFF1pbDX5wuxlr37jlu8iGMJnmKM8HAGhkpqmk_qOh2jsSkpRIiWtcB_7t--iRrV3CKDiwKf1xagpoPPfrPwzHfW'
  },
  chica: {
    1: 'https://blogger.googleusercontent.com/img/a/AVvXsEh_PnIcFYcgmsvgfKqk4Mr0s40x0a5f1_pIFmBRlR0oVInL1-uaLQIez5BrYNp-ua4-mBmHqb2A8Ox4tElSIJx3LtHnBaO-cGTxzHomjYO1f2X6KQzCYn8I0LmpqNe6o1UiXhc814JjCv0hWJ3kME5gcDJ1czrxl7xYge9BE214gnYyrIHHqxwuTMyoxPjd',
    2: 'https://blogger.googleusercontent.com/img/a/AVvXsEhfE1YuYhKeV-RKSJUozUqSkCcyNku3wKaWWP6sCRkawGbLiNgLNA99FmSzujPF1GzPGQ_7bILulbKvxf5hWmpKeVfJ_I3KR0UZmgi9w2HvAGcIrnN8ejwf2sRf8pZmfjcWaRbjVCyL6f9XkduD8p5HTACV7ZGUVG2jHaWWZBjdYz56ySfT1KWEekFwOywH',
    3: 'https://blogger.googleusercontent.com/img/a/AVvXsEgmmVnvklrj30hV9u-vS-4nR49K3Un01KgxyhfPa0aP-ZTnplUEkvYOEl5x4J5YjG3zuTp6tndz8OLDNrkLJV7xgpYsvxky2todbBdI18RYlz20kKDbUNoBTLK6MuH-9Nz8w73_WBSiLNQe8-v9HYqsKbtcvqGn6vWpbUgCzgH0QX6miPmMKvmxUd0d8Pvl',
    4: 'https://blogger.googleusercontent.com/img/a/AVvXsEjY414YVLYIT9NFgJb1K8r94Rh7KNy1JpGCj5GBjfzWjmfPtf2aUjn5DGMb0Iy9n1J-8CJ9OC4e_QOwx8nJDweTB_MalUg5CEDJwwiLtMvKvVrV9m2p4mgWrkVTYSrmR1jtDJ42PLmiXDZ2mrrhUHwurD-eITZ7L4CjFJCiRjtEx3Hz8hMJQu6d7pFR6clS'
  }
};

const misiones: Mision[] = [
  {
    id: 1,
    nivelReq: 1,
    titulo: 'Alerta Volcánica',
    path: '/volcan',
    desc: 'Ceniza, protección respiratoria, agua segura y respuesta ante actividad volcánica.',
    etiqueta: 'Módulo 01',
    icono: <Mountain className="h-7 w-7" />,
    colorCard: 'from-orange-600 via-red-600 to-rose-800',
    imageUrl: 'https://blogger.googleusercontent.com/img/a/AVvXsEgvMzQ-lC5eybzQ_NIvrrlKgr_qStTio-EaDyhIPkpC_gQGKCVAHVAQgKgOynQRn1s9K7t2nwED7tdPkRGWDEWCns3npzBMQBPhLolb51L2Tjtc9Aisdi7sikyL7nMz5u22HM6Ftyf-El1WY4JGHwWhDJXZjLiZyxUZAHUWP3LUGUbs9rrdAsTXG4Hm3W8',
    imagenHint: 'Imagen referencial: volcán en erupción, ceniza y señal de alerta natural.',
    enfoque: 'Volcán + ceniza'
  },
  {
    id: 2,
    nivelReq: 2,
    titulo: 'Inundaciones',
    path: '/inundacion',
    desc: 'Zonas altas, cortes de energía, corrientes de agua y rutas seguras.',
    etiqueta: 'Módulo 02',
    icono: <Waves className="h-7 w-7" />,
    colorCard: 'from-blue-600 via-cyan-600 to-sky-800',
    imageUrl: 'https://blogger.googleusercontent.com/img/a/AVvXsEgb0NIo6RWIE6iO6Y6QswUrGRGw2eUdk3a3o0dAw8YPDt5p1BjCzPsabCKcAtcRQSEBS7b9Kb64Lj6nhxKLKj1Tthakok9AD1PXXuS9SmSm3LlYgf1C46KpP83Z-RBEJPEAWh9QRDdTF8ssGqNFJF4Hp75C1eQRyattLnDpSEe-anrEdL87dd1LSc0nh9A',
    imagenHint: 'Imagen referencial: lluvia intensa, agua crecida y zona de riesgo.',
    enfoque: 'Agua + rutas altas'
  },
  {
    id: 3,
    nivelReq: 3,
    titulo: 'Evacuación',
    path: '/evacuacion',
    desc: 'Señalética verde, punto de encuentro, mochila y calma durante emergencias.',
    etiqueta: 'Módulo 03',
    icono: <Navigation className="h-7 w-7" />,
    colorCard: 'from-emerald-600 via-teal-600 to-green-800',
    imageUrl: 'https://blogger.googleusercontent.com/img/a/AVvXsEi18cK27LRuYIEiv421v6Gi1mC1lLUPp_RkADUtsLBf-P92rx9MQUz3k4BJZzzuVcAxSF-wQQQIj7LbC14NaCe4GvZA0Th91kn4LtIuaBLYIw9t9-iWruyvMJiMWvB2_FaNGMSZhp05VudB3wXSHHERKFLnt65jAU62uiXyE84qHV7DyhPX53f7xgEH2wE',
    imagenHint: 'Imagen referencial: ruta de evacuación, señalética y punto seguro.',
    enfoque: 'Ruta + punto seguro'
  }
];

const herramientas: Herramienta[] = [
  {
    titulo: 'Videos',
    desc: 'Cápsulas educativas por módulo para reforzar lo aprendido antes de cada evaluación.',
    estado: 'Abrir recurso',
    icono: <Video size={22} />,
    color: 'from-red-500 to-orange-500',
    imageUrl: 'https://blogger.googleusercontent.com/img/a/AVvXsEg3Z97xOcrRyfstwiOmmNt36hBNLqBkVHl3vDUKeSXCG0f6sYvn2UQC4J32qLK--bjnOQgE-v8vMaFnMxAahM-oH4RBVnGv585nENefIXUMRzgVZ4ZMp4YcdwWvT9g6P6Nlg8fmg30wLQbzOaUzFut7vfyIwl_g8FfSdQHDWbFFr1VAVFjgR8dwMMYdi9s',
    path: '/videos'
  },
  {
    titulo: 'Mapas',
    desc: 'Visor interactivo de amenaza por inundaciones con zoom, movimiento y leyenda de susceptibilidad.',
    estado: 'Abrir mapa',
    icono: <Map size={22} />,
    color: 'from-cyan-500 to-blue-500',
    imageUrl: 'https://blogger.googleusercontent.com/img/a/AVvXsEgoBR_tyDWvpHNWIIr4exwvwEhWkAJKojndFPjuAEU9rITfY1DmsDPkKDo6TN7q6DwlfiCUrkWt4XIa-Vmp88WdgghLYYVPJRJyt_UEIHDtrkpQ_6guba1jv5pCpwD5hs50Fyzmnk76qagF_CAXoQTzm9EfVRMIwCRBqXhp7L4_-Ez2wLhczbzcB37WWqo',
    path: '/mapas'
  },
  {
    titulo: 'Línea de tiempo',
    desc: 'Eventos históricos y antecedentes de emergencias para entender el riesgo local.',
    estado: 'Base preparada',
    icono: <CalendarDays size={22} />,
    color: 'from-purple-500 to-fuchsia-500',
    imageUrl: 'https://blogger.googleusercontent.com/img/a/AVvXsEgOwbrDz0vT51EhZUUyBL88cvDU0ydxYmm38eh-yCYQSCt2hjRA0_PsSETmzuktwuhAU0jm-tLpBcBFd5iqSGL8nZoVw7MAPPONKeIwbULHsy8cWgBZ-34ePuktlko9pZtTSHeXbxqfK_TsutCUJo5wPwI4PiHa6OFtYzmaL80tTYwvWIzJam3SV94h1Mc'
  },
  {
    titulo: 'Material descargable',
    desc: 'Guías, fichas, protocolos y recursos para docentes, estudiantes y familias.',
    estado: 'Próximamente',
    icono: <Download size={22} />,
    color: 'from-emerald-500 to-teal-500',
    imageUrl: 'https://blogger.googleusercontent.com/img/a/AVvXsEg-ZbKppsU1rnvAscXLJemXhnYClhWMBaWkXZisk7klKtfsurLZDT5yv31ILPz9EZjIvKNPMjXoMv0eJiO3_f9d6o7ZJ9z5EVydY9-oMv31eg8ykjvNyqBLPG9ga7LAUW1WDmUzAEeSUH0tXFtaoy5uCLdD-agApYiMRl2WopSVsRrgMKiLq6ToXPxLtnM'
  }
];

const Hub = () => {
  const navigate = useNavigate();
  const [nombreAgente, setNombreAgente] = useState('AGENTE');
  const [escuelaAgente, setEscuelaAgente] = useState('ACADEMIA');
  const [nivelAgente, setNivelAgente] = useState(1);
  const [avatarAgente, setAvatarAgente] = useState<AvatarTipo>('chico');
  const [showCredencial, setShowCredencial] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);

  const authId = useMemo(() => {
    const existente = localStorage.getItem('agenteAuthId');
    if (existente) return existente;

    const nuevo = Math.random().toString(36).substring(2, 11).toUpperCase();
    localStorage.setItem('agenteAuthId', nuevo);
    return nuevo;
  }, []);

  const progreso = useMemo(() => {
    if (nivelAgente <= 1) return 0;
    if (nivelAgente === 2) return 33;
    if (nivelAgente === 3) return 66;
    return 100;
  }, [nivelAgente]);

  const avatarActual = useMemo(() => {
    const nivelSeguro = Math.min(Math.max(nivelAgente, 1), 4);
    return AVATARES[avatarAgente]?.[nivelSeguro] || AVATARES.chico[1];
  }, [avatarAgente, nivelAgente]);

  const siguienteObjetivo = useMemo(() => {
    if (nivelAgente === 1) return 'Completa Alerta Volcánica para desbloquear Inundaciones.';
    if (nivelAgente === 2) return 'Completa Inundaciones para desbloquear Evacuación.';
    if (nivelAgente === 3) return 'Completa Evacuación para obtener tu credencial final.';
    return 'Misión completa. Tu credencial de agente está disponible.';
  }, [nivelAgente]);

  useEffect(() => {
    const sincronizarDatos = () => {
      const guardadoNombre = localStorage.getItem('agenteNombre');
      const guardadoEscuela = localStorage.getItem('agenteEscuela');
      const guardadoNivel = Number(localStorage.getItem('agenteNivel') || '1');
      const guardadoAvatar = localStorage.getItem('agenteAvatar');

      if (guardadoNombre) setNombreAgente(guardadoNombre.toUpperCase());
      if (guardadoEscuela) setEscuelaAgente(guardadoEscuela.toUpperCase());
      if (guardadoAvatar === 'chica' || guardadoAvatar === 'chico') setAvatarAgente(guardadoAvatar);

      const nivelSeguro = !Number.isNaN(guardadoNivel) ? Math.min(Math.max(guardadoNivel, 1), 4) : 1;
      setNivelAgente((prev) => {
        if (nivelSeguro > prev) {
          setShowLevelUp(true);
          window.setTimeout(() => setShowLevelUp(false), 2600);
        }
        return nivelSeguro;
      });
    };

    sincronizarDatos();
    window.addEventListener('focus', sincronizarDatos);
    window.addEventListener('pageshow', sincronizarDatos);
    window.addEventListener('agenteNivelActualizado', sincronizarDatos);

    return () => {
      window.removeEventListener('focus', sincronizarDatos);
      window.removeEventListener('pageshow', sincronizarDatos);
      window.removeEventListener('agenteNivelActualizado', sincronizarDatos);
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <main className="min-h-screen w-full bg-[#010413] text-white relative overflow-hidden p-4 md:p-6">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-32 h-[34rem] w-[34rem] rounded-full bg-cyan-500/20 blur-[120px]" />
        <div className="absolute -bottom-40 -left-32 h-[36rem] w-[36rem] rounded-full bg-orange-500/20 blur-[130px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.045)_1px,transparent_1px)] [background-size:34px_34px] opacity-35" />
      </div>

      <section className="relative z-10 mx-auto max-w-7xl space-y-5">
        <header className="rounded-[2rem] border border-white/10 bg-white/5 p-5 md:p-7 backdrop-blur-2xl shadow-[0_30px_100px_rgba(0,0,0,0.38)]">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div className="flex items-center gap-4">
              <img
                src={avatarActual}
                alt="Avatar del agente"
                className="h-20 w-20 rounded-[1.6rem] border border-white/10 bg-white/10 object-cover p-1 shadow-2xl"
              />
              <div>
                <p className="text-cyan-300 text-[10px] font-black uppercase tracking-[0.28em]">Centro de mando 18D03</p>
                <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-none mt-1">Hola, {nombreAgente}</h1>
                <p className="text-slate-400 text-sm md:text-base font-semibold mt-2">{escuelaAgente}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowCredencial(true)}
                className="rounded-2xl bg-cyan-400 text-slate-950 px-4 py-3 font-black uppercase text-xs tracking-widest hover:bg-cyan-300 flex items-center gap-2"
              >
                <Award size={16} /> Credencial
              </button>
              <button
                onClick={handleLogout}
                className="rounded-2xl border border-red-400/30 bg-red-500/10 text-red-100 px-4 py-3 font-black uppercase text-xs tracking-widest hover:bg-red-500/20 flex items-center gap-2"
              >
                <LogOut size={16} /> Salir
              </button>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-5">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 md:p-7 backdrop-blur-2xl overflow-hidden relative">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl" />
            <div className="relative z-10">
              <p className="text-orange-300 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Progreso del agente</p>
              <h2 className="text-2xl md:text-4xl font-black leading-tight">{siguienteObjetivo}</h2>

              <div className="mt-6 rounded-full bg-white/10 h-4 overflow-hidden border border-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progreso}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full bg-gradient-to-r from-orange-500 via-cyan-400 to-emerald-400"
                />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <MiniStat label="Nivel" value={nivelAgente} />
                <MiniStat label="Avance" value={`${progreso}%`} />
                <MiniStat label="ID" value={authId} />
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-5 md:p-7 backdrop-blur-2xl">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-emerald-400/10 border border-emerald-300/20 p-3 text-emerald-300">
                <ShieldCheck size={28} />
              </div>
              <div>
                <p className="text-emerald-300 text-[10px] font-black uppercase tracking-[0.28em] mb-2">Guía rápida</p>
                <h3 className="text-2xl font-black leading-tight">Aprende, responde y desbloquea.</h3>
                <p className="text-slate-400 text-sm font-semibold leading-relaxed mt-3">
                  Cada módulo contiene material educativo y una evaluación. Cuando completes los tres, obtendrás tu credencial digital.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
            <div>
              <p className="text-cyan-300 text-[10px] font-black uppercase tracking-[0.3em]">Ruta de aprendizaje</p>
              <h2 className="text-3xl md:text-4xl font-black mt-1">Módulos principales</h2>
            </div>
            <p className="text-slate-400 max-w-xl text-sm font-semibold">
              Módulos con imágenes referenciales para entender mejor cada riesgo antes de iniciar la misión.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {misiones.map((mision) => {
              const desbloqueada = nivelAgente >= mision.nivelReq;
              const completada = nivelAgente > mision.nivelReq;

              return (
                <article
                  key={mision.id}
                  className="rounded-[2rem] border border-white/10 bg-white/5 overflow-hidden backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] transition-transform duration-200 ease-out hover:-translate-y-1"
                >
                  <div className="relative h-44 overflow-hidden p-5">
                    <img src={mision.imageUrl} alt={mision.titulo} className="absolute inset-0 h-full w-full object-cover" />
                    <div className={`absolute inset-0 bg-gradient-to-br ${mision.colorCard} mix-blend-multiply opacity-70`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent" />
                    <div className="relative z-10 flex h-full flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="rounded-full bg-black/25 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em]">{mision.etiqueta}</span>
                        <div className="rounded-2xl bg-white/15 p-3 text-white">{mision.icono}</div>
                      </div>
                      <div>
                        <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.22em] mb-1">{mision.enfoque}</p>
                        <h3 className="text-3xl font-black leading-none">{mision.titulo}</h3>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="rounded-2xl border border-dashed border-white/15 bg-slate-950/50 p-4 flex items-start gap-3">
                      <ImageIcon className="text-cyan-300 shrink-0" size={20} />
                      <p className="text-xs text-slate-400 font-semibold leading-relaxed">{mision.imagenHint}</p>
                    </div>

                    <p className="text-sm text-slate-300 font-semibold leading-relaxed">{mision.desc}</p>

                    <button
                      onClick={() => desbloqueada && navigate(mision.path)}
                      disabled={!desbloqueada}
                      className={`w-full rounded-2xl px-4 py-3 font-black uppercase tracking-[0.16em] text-xs flex items-center justify-center gap-2 transition-all ${
                        desbloqueada
                          ? 'bg-white text-slate-950 hover:bg-cyan-100'
                          : 'bg-white/10 text-white/40 cursor-not-allowed'
                      }`}
                    >
                      {desbloqueada ? (
                        <>
                          {completada ? <CheckIcon /> : <PlayCircle size={16} />}
                          {completada ? 'Revisar módulo' : 'Iniciar módulo'}
                          <ChevronRight size={16} />
                        </>
                      ) : (
                        <>
                          <Lock size={16} /> Bloqueado
                        </>
                      )}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-5 md:p-7 backdrop-blur-2xl">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-5">
            <div>
              <p className="text-orange-300 text-[10px] font-black uppercase tracking-[0.3em]">Caja de herramientas</p>
              <h2 className="text-3xl md:text-4xl font-black mt-1">Recursos del proyecto</h2>
            </div>
            <p className="text-slate-400 max-w-xl text-sm font-semibold">
              Sección base para conectar videos, mapas, línea de tiempo y material descargable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {herramientas.map((item) => {
              const clickeable = Boolean(item.path);

              return (
                <article
                  key={item.titulo}
                  onClick={() => item.path && navigate(item.path)}
                  data-cursor={clickeable ? 'interactive' : undefined}
                  className={`rounded-[1.7rem] bg-slate-950/65 border border-white/10 overflow-hidden relative transition-all duration-200 ease-out ${
                    clickeable ? 'hover:border-cyan-300/50 hover:bg-slate-900/80 hover:-translate-y-1 cursor-pointer' : ''
                  }`}
                >
                  <div className="relative h-32 overflow-hidden">
                    <img src={item.imageUrl} alt={item.titulo} className="absolute inset-0 h-full w-full object-cover" />
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-70 mix-blend-multiply`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent" />
                    <div className="absolute bottom-4 left-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur-md shadow-lg">
                      {item.icono}
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-xl font-black">{item.titulo}</h3>
                      {clickeable && <ChevronRight className="text-cyan-300 shrink-0" size={18} />}
                    </div>
                    <p className="text-slate-400 text-sm font-semibold leading-relaxed mt-2">{item.desc}</p>
                    <div className="mt-4 rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-200 w-fit">
                      {item.estado}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </section>

      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          >
            <div className="rounded-[2rem] border border-yellow-300/30 bg-slate-950 p-8 text-center shadow-[0_0_80px_rgba(250,204,21,0.25)]">
              <PartyPopper className="mx-auto mb-4 text-yellow-300" size={54} />
              <h2 className="text-3xl font-black">¡Nivel actualizado!</h2>
              <p className="mt-2 text-slate-300 font-semibold">Nuevo avance: {progreso}%</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCredencial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              className="w-full max-w-md rounded-[2rem] border border-cyan-300/30 bg-slate-950 p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-cyan-300 text-[10px] font-black uppercase tracking-[0.28em]">Credencial digital</p>
                  <h3 className="text-2xl font-black mt-1">Agente de Prevención</h3>
                </div>
                <button onClick={() => setShowCredencial(false)} className="rounded-2xl bg-white/10 px-3 py-2 font-black hover:bg-white/15">✕</button>
              </div>

              <div className="rounded-[1.7rem] bg-gradient-to-br from-cyan-500 via-slate-900 to-orange-500 p-[1px]">
                <div className="rounded-[1.7rem] bg-slate-950 p-5 text-center">
                  <img src={avatarActual} alt="Avatar" className="mx-auto h-28 w-28 rounded-[2rem] bg-white/10 object-cover p-2" />
                  <h4 className="mt-4 text-2xl font-black">{nombreAgente}</h4>
                  <p className="text-slate-400 text-sm font-semibold">{escuelaAgente}</p>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <MiniStat label="Nivel" value={nivelAgente} />
                    <MiniStat label="ID" value={authId} />
                  </div>
                  <div className="mt-4 rounded-2xl bg-white/10 p-3 text-sm font-bold text-slate-300">
                    {nivelAgente >= 4 ? 'Credencial final desbloqueada.' : 'Completa todas las misiones para activar la credencial final.'}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

const MiniStat = ({ label, value }: { label: string; value: string | number }) => (
  <div className="rounded-2xl bg-white/10 border border-white/10 p-3">
    <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">{label}</p>
    <p className="text-xl font-black mt-1 break-all">{value}</p>
  </div>
);

const CheckIcon = () => <Trophy size={16} />;

export default Hub;

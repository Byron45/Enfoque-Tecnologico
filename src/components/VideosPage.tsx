import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpenCheck, Clock, ExternalLink, PlayCircle, ShieldCheck, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GuideAssistant from './GuideAssistant';
import { GUIDE_STEPS } from '../utils/guideSteps';

const VIDEO_ID = 'opNwG7zrIVQ';
const VIDEO_TITLE = 'Cápsula de prevención';
const VIDEO_EMBED_URL = `https://www.youtube.com/embed/${VIDEO_ID}?rel=0&controls=1&modestbranding=0&playsinline=1&cc_load_policy=0&iv_load_policy=3&fs=1`;
const VIDEO_WATCH_URL = `https://www.youtube.com/watch?v=${VIDEO_ID}`;

const VideosPage = () => {
  const navigate = useNavigate();
  const hasVideo = Boolean(VIDEO_EMBED_URL);

  return (
    <main className="min-h-screen bg-[#010413] text-white p-3 md:p-5 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-44 -right-32 h-[34rem] w-[34rem] rounded-full bg-orange-500/20 blur-[130px]" />
        <div className="absolute -bottom-44 -left-32 h-[34rem] w-[34rem] rounded-full bg-purple-500/18 blur-[130px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.045)_1px,transparent_1px)] [background-size:34px_34px] opacity-35" />
      </div>

      <section className="relative z-10 mx-auto max-w-[92rem] space-y-4">
        <header className="rounded-[2rem] border border-white/10 bg-white/5 p-4 md:p-6 backdrop-blur-2xl shadow-[0_30px_100px_rgba(0,0,0,0.35)]">
          <div className="flex flex-wrap gap-3 mb-5">
            <button
              onClick={() => navigate('/hub')}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-orange-100 hover:bg-white/15"
            >
              <ArrowLeft size={16} /> Volver al centro de mando
            </button>
            <a
              href={VIDEO_WATCH_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl border border-orange-300/20 bg-orange-400/10 px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-orange-100 hover:bg-orange-400/20"
            >
              <ExternalLink size={16} /> Ver recurso
            </a>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_0.75fr] lg:items-end">
            <div>
              <p className="text-orange-300 text-[10px] font-black uppercase tracking-[0.32em] mb-2">Caja de herramientas / Videos</p>
              <h1 className="text-3xl md:text-5xl xl:text-6xl font-black tracking-tight leading-none">Videos educativos</h1>
              <p className="mt-3 max-w-3xl text-slate-300 font-semibold leading-relaxed">
                Recurso audiovisual para reforzar el aprendizaje antes de iniciar o revisar las misiones de prevención.
              </p>
            </div>

            <div className="rounded-[1.7rem] border border-orange-300/20 bg-orange-400/10 p-4 flex items-start gap-3">
              <ShieldCheck className="text-orange-300 shrink-0" size={22} />
              <p className="text-sm text-orange-50/80 font-semibold leading-relaxed">
                Observa el contenido, comenta las ideas principales y continúa con las actividades del centro de mando.
              </p>
            </div>
          </div>
        </header>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-3 md:p-4 shadow-2xl backdrop-blur-2xl">
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-4 items-stretch">
            <div className="rounded-[1.6rem] border border-white/10 bg-slate-950/75 p-4 shadow-2xl">
              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-orange-300">Reproductor principal</p>
                  <h2 className="mt-1 text-2xl md:text-3xl font-black">{VIDEO_TITLE}</h2>
                  <p className="mt-2 text-sm font-semibold text-slate-400">
                    Revisa la cápsula y repasa las partes importantes antes de continuar.
                  </p>
                </div>
                <div className="inline-flex w-fit items-center gap-2 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-200">
                  <PlayCircle size={15} /> Recurso activo
                </div>
              </div>

              <div className="overflow-hidden rounded-[1.35rem] border border-white/10 bg-black shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
                {hasVideo ? (
                  <iframe
                    src={VIDEO_EMBED_URL}
                    title={VIDEO_TITLE}
                    className="block aspect-video h-auto w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <div className="flex aspect-video flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950 p-6 text-center">
                    <motion.div
                      initial={{ scale: 0.88, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.35 }}
                      className="mb-5 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-orange-500/15 text-orange-300 border border-orange-300/20 shadow-[0_0_50px_rgba(251,146,60,0.2)]"
                    >
                      <PlayCircle size={52} />
                    </motion.div>
                    <h3 className="text-2xl md:text-4xl font-black">Recurso pendiente</h3>
                    <p className="mt-3 max-w-xl text-slate-300 font-semibold leading-relaxed">
                      Esta sección está lista para mostrar el material audiovisual del proyecto.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <aside className="rounded-[1.6rem] border border-white/10 bg-slate-950/70 p-4 space-y-4">
              <InfoCard icon={<Video />} title="Contenido principal" text="Presenta la cápsula educativa para introducir el tema antes de las actividades." />
              <InfoCard icon={<Clock />} title="Antes del quiz" text="Permite repasar ideas clave antes de responder la evaluación." />
              <InfoCard icon={<BookOpenCheck />} title="Uso en clase" text="Puede verse en grupo para conversar y reforzar la prevención comunitaria." />
            </aside>
          </div>
        </section>
      </section>

      <GuideAssistant guideId="videos" steps={GUIDE_STEPS.videos} />
    </main>
  );
};

const InfoCard = ({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) => (
  <article className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 backdrop-blur-2xl">
    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-400/10 text-orange-300 border border-orange-300/20">
      {icon}
    </div>
    <h3 className="text-lg font-black">{title}</h3>
    <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-400">{text}</p>
  </article>
);

export default VideosPage;

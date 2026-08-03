import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, HelpCircle, X } from 'lucide-react';
import guiaNinaUrl from '../assets/guia-nina.png';
import guiaNinoUrl from '../assets/guia-nino.png';
import type { GuideStep } from '../utils/guideSteps';

type Props = {
  guideId: string;
  steps: GuideStep[];
};

const seenKey = (guideId: string) => `guia-vista:${guideId}`;

const GuideAssistant = ({ guideId, steps }: Props) => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [avatar, setAvatar] = useState<'chica' | 'chico'>('chico');

  useEffect(() => {
    setAvatar(localStorage.getItem('agenteAvatar') === 'chica' ? 'chica' : 'chico');
    const alreadySeen = localStorage.getItem(seenKey(guideId)) === 'true';
    if (!alreadySeen) {
      setStep(0);
      setOpen(true);
    }
  }, [guideId]);

  if (!steps.length) return null;

  const finish = () => {
    localStorage.setItem(seenKey(guideId), 'true');
    setOpen(false);
  };

  const reopen = () => {
    setStep(0);
    setOpen(true);
  };

  const current = steps[step];
  const isLast = step === steps.length - 1;
  const guideImage = avatar === 'chica' ? guiaNinaUrl : guiaNinoUrl;

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-4 left-4 z-[110] flex w-[min(92vw,380px)] items-end gap-2"
          >
            <img
              src={guideImage}
              alt="Guía asistente"
              className="h-28 w-auto shrink-0 drop-shadow-[0_10px_20px_rgba(0,0,0,0.45)] md:h-36"
              draggable={false}
            />

            <div className="relative flex-1 rounded-[1.6rem] rounded-bl-md border-2 border-white/15 bg-slate-950 p-4 text-white shadow-2xl">
              <button
                type="button"
                onClick={finish}
                aria-label="Cerrar guía"
                className="absolute right-3 top-3 rounded-full bg-white/10 p-1.5 text-white/70 hover:bg-white/20 hover:text-white"
              >
                <X size={14} />
              </button>

              <p className="pr-6 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">{current.title}</p>
              <p className="mt-2 text-sm font-bold leading-relaxed text-white/90">{current.text}</p>

              <div className="mt-4 flex items-center justify-between gap-3">
                <div className="flex gap-1.5">
                  {steps.map((_, index) => (
                    <span
                      key={index}
                      className={`h-1.5 rounded-full transition-all ${index === step ? 'w-5 bg-cyan-300' : 'w-1.5 bg-white/25'}`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  {step > 0 && (
                    <button
                      type="button"
                      onClick={() => setStep((current) => Math.max(0, current - 1))}
                      className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                      aria-label="Paso anterior"
                    >
                      <ChevronLeft size={16} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => (isLast ? finish() : setStep((current) => current + 1))}
                    className="flex items-center gap-1.5 rounded-full bg-cyan-400 px-3.5 py-2 text-[11px] font-black uppercase tracking-wider text-slate-950 hover:bg-cyan-300"
                  >
                    {isLast ? '¡Entendido!' : 'Siguiente'}
                    {!isLast && <ChevronRight size={14} />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!open && (
        <button
          type="button"
          onClick={reopen}
          aria-label="Abrir guía de ayuda"
          className="fixed bottom-4 left-4 z-[100] flex items-center gap-2 rounded-full border-2 border-white/20 bg-slate-950/90 px-4 py-3 text-white shadow-2xl backdrop-blur-xl transition hover:-translate-y-1 hover:border-cyan-300/50"
        >
          <HelpCircle size={20} className="text-cyan-300" />
          <span className="hidden text-xs font-black uppercase tracking-widest sm:inline">Ayuda</span>
        </button>
      )}
    </>
  );
};

export default GuideAssistant;

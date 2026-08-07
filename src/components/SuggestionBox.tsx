import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, MessageCircleHeart, Send, X } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';

type Props = {
  open: boolean;
  onClose: () => void;
};

const ESCALA = [
  { valor: 1, emoji: '😞', texto: 'Nada' },
  { valor: 2, emoji: '🙁', texto: 'Poco' },
  { valor: 3, emoji: '😐', texto: 'Normal' },
  { valor: 4, emoji: '🙂', texto: 'Bien' },
  { valor: 5, emoji: '😄', texto: 'Genial' }
];

const SuggestionBox = ({ open, onClose }: Props) => {
  const [calificacion, setCalificacion] = useState<number | null>(null);
  const [comentario, setComentario] = useState('');
  const [status, setStatus] = useState<'idle' | 'enviando' | 'enviado'>('idle');

  const cerrar = () => {
    onClose();
    window.setTimeout(() => {
      setCalificacion(null);
      setComentario('');
      setStatus('idle');
    }, 300);
  };

  const enviar = async () => {
    if (!calificacion || status === 'enviando') return;
    setStatus('enviando');

    const nombre = localStorage.getItem('agenteNombre');
    const institucion = localStorage.getItem('agenteEscuela');

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('sugerencias').insert([{
          nombre,
          institucion,
          calificacion,
          comentario: comentario.trim() || null
        }]);
        if (error) console.warn('No se pudo enviar la sugerencia:', error.message);
      } catch (error) {
        console.warn('No se pudo enviar la sugerencia:', error);
      }
    }

    setStatus('enviado');
    window.setTimeout(cerrar, 1800);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#071D4A]/80 p-4 backdrop-blur-lg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.section initial={{ y: 24, scale: .96 }} animate={{ y: 0, scale: 1 }} exit={{ y: 16, scale: .96 }} className="relative w-full max-w-lg rounded-[2.2rem] border-4 border-white bg-[#F7FAFF] p-6 shadow-2xl md:p-7">
            <button onClick={cerrar} className="absolute right-4 top-4 rounded-full bg-rose-500 p-2.5 text-white shadow-lg hover:bg-rose-400" aria-label="Cerrar"><X size={18} /></button>

            {status === 'enviado' ? (
              <div className="flex flex-col items-center py-6 text-center">
                <CheckCircle2 className="mb-4 text-emerald-500" size={56} />
                <h3 className="text-2xl font-black text-slate-900">¡Gracias por tu opinión!</h3>
                <p className="mt-2 text-sm font-bold text-slate-600">Nos ayuda a mejorar la aventura.</p>
              </div>
            ) : (
              <>
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700"><MessageCircleHeart size={26} /></div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[.2em] text-violet-600">Buzón de sugerencias</p>
                    <h3 className="text-xl font-black text-slate-900 md:text-2xl">¿Qué tan divertida fue tu misión?</h3>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {ESCALA.map((item) => (
                    <button
                      key={item.valor}
                      type="button"
                      onClick={() => setCalificacion(item.valor)}
                      className={`flex flex-col items-center gap-1 rounded-2xl border-2 p-3 transition hover:-translate-y-1 ${calificacion === item.valor ? 'border-violet-600 bg-violet-100 shadow-md' : 'border-slate-200 bg-white'}`}
                    >
                      <span className="text-3xl leading-none">{item.emoji}</span>
                      <span className="text-[10px] font-black uppercase text-slate-600">{item.texto}</span>
                    </button>
                  ))}
                </div>

                <label className="mt-5 block">
                  <span className="mb-2 block text-[11px] font-black uppercase tracking-[.16em] text-slate-600">¿Algo que quieras contarnos? (opcional)</span>
                  <textarea
                    value={comentario}
                    onChange={(event) => setComentario(event.target.value)}
                    rows={3}
                    placeholder="Escribe aquí tu idea o sugerencia..."
                    className="w-full resize-none rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  />
                </label>

                <button
                  type="button"
                  onClick={enviar}
                  disabled={!calificacion || status === 'enviando'}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-4 text-sm font-black uppercase tracking-wider text-white shadow-lg transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                >
                  {status === 'enviando' ? 'Enviando...' : 'Enviar sugerencia'} <Send size={17} />
                </button>
              </>
            )}
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SuggestionBox;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Star, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface Question {
  pregunta: string;
  opciones: string[];
  correcta: number;
}

interface QuizProps {
  tipo: 'volcan' | 'inundacion' | 'sismo' | 'evacuacion';
  onWin: () => void;
  onClose: () => void;
}

const Quiz: React.FC<QuizProps> = ({ tipo, onWin, onClose }) => {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [score, setScore] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const preguntas: Record<string, Question[]> = {
    volcan: [
      { pregunta: '¿Qué debes usar para proteger tus pulmones de la ceniza?', opciones: ['Mascarilla N95', 'Una bufanda delgada', 'Nada, no hace daño'], correcta: 0 },
      { pregunta: '¿Qué debes hacer con los depósitos de agua en casa?', opciones: ['Dejarlos abiertos', 'Cubrirlos muy bien', 'Vaciarlos todos'], correcta: 1 },
      { pregunta: 'Si usas lentes de contacto, ¿qué es mejor usar hoy?', opciones: ['Mis lentes de contacto', 'No usar nada', 'Gafas o lentes de armazón'], correcta: 2 }
    ],
    inundacion: [
      { pregunta: 'Si el agua entra en casa, ¿qué desconectas primero?', opciones: ['La radio', 'La energía eléctrica', 'La televisión'], correcta: 1 },
      { pregunta: '¿Hacia dónde debes dirigirte en una inundación?', opciones: ['A la calle', 'A zonas altas', 'Al sótano'], correcta: 1 },
      { pregunta: '¿Qué debe tener tu mochila de emergencia?', opciones: ['Juguetes', 'Botiquín y linterna', 'Libros'], correcta: 1 }
    ],
    sismo: [
      { pregunta: '¿Qué debes hacer apenas sientes un sismo fuerte?', opciones: ['Correr afuera de inmediato', 'Agacharte, cubrirte y sujetarte', 'Quedarte de pie junto a la ventana'], correcta: 1 },
      { pregunta: '¿Dónde es más seguro protegerte durante el movimiento?', opciones: ['Bajo una mesa resistente', 'Cerca de un espejo grande', 'Dentro del ascensor'], correcta: 0 },
      { pregunta: 'Cuando termina el sismo, ¿qué debes revisar primero?', opciones: ['Si hay heridos o daños visibles', 'Tus redes sociales', 'Si tus amigos lo sintieron'], correcta: 0 }
    ],
    evacuacion: [
      { pregunta: '¿Qué herramienta es vital para mantener la calma?', opciones: ['Seguir la señalética', 'Correr rápido', 'Gritar fuerte'], correcta: 0 },
      { pregunta: '¿Dónde debes reunirte con tu familia?', opciones: ['Dentro de casa', 'Punto de encuentro seguro', 'En el auto'], correcta: 1 },
      { pregunta: '¿Qué debes evitar durante la evacuación?', opciones: ['Usar escaleras', 'Ayudar a otros', 'Usar ascensores'], correcta: 2 }
    ]
  };

  const actualQuestions = preguntas[tipo] || preguntas.volcan;

  const handleLevelUp = async () => {
    setIsSyncing(true);

    const niveles = { volcan: 2, inundacion: 3, sismo: 4, evacuacion: 5 };
    const camposMision = {
      volcan: 'mision_volcan',
      inundacion: 'mision_inundacion',
      sismo: 'mision_sismo',
      evacuacion: 'mision_evacuacion'
    } as const;

    const nuevoNivel = niveles[tipo];
    const campoMision = camposMision[tipo];
    const nombreGuardado = localStorage.getItem('agenteNombre');

    localStorage.setItem('agenteNivel', nuevoNivel.toString());
    localStorage.setItem(`mision${tipo.charAt(0).toUpperCase()}${tipo.slice(1)}Completada`, 'true');

    try {
      if (nombreGuardado) {
        const { error } = await supabase
          .from('agentes')
          .update({
            nivel: nuevoNivel,
            [campoMision]: true,
            ultima_conexion: new Date().toISOString()
          })
          .eq('nombre', nombreGuardado);

        if (error) {
          console.warn('Supabase no sincronizó el quiz, pero el progreso local fue guardado:', error.message);
        }
      }
    } catch (err) {
      console.warn('Fallo de conexión con Supabase. Progreso local guardado:', err);
    }

    window.setTimeout(() => {
      setIsSyncing(false);
      onWin();
    }, 900);
  };

  const handleSelect = (index: number) => {
    if (status !== 'idle' || isSyncing) return;

    setSelected(index);

    if (index === actualQuestions[step].correcta) {
      setStatus('correct');
      setScore((prev) => prev + 100);

      window.setTimeout(() => {
        if (step + 1 < actualQuestions.length) {
          setStep((prev) => prev + 1);
          setSelected(null);
          setStatus('idle');
        } else {
          handleLevelUp();
        }
      }, 1200);
    } else {
      setStatus('wrong');
      window.setTimeout(() => {
        setSelected(null);
        setStatus('idle');
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 28 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        className="relative bg-gradient-to-b from-[#1a0505] to-[#010413] border-4 border-red-500/50 p-7 md:p-10 rounded-[2.5rem] max-w-2xl w-full shadow-[0_0_60px_rgba(239,68,68,0.25)]"
      >
        <div className="absolute -top-7 right-8 flex space-x-2 bg-black/45 p-3 rounded-full border-2 border-red-500/30 backdrop-blur-md shadow-xl">
          <span className="text-3xl">💡</span>
          <span className="text-3xl">🧠</span>
        </div>

        {isSyncing ? (
          <div className="py-18 flex flex-col items-center justify-center space-y-6">
            <Loader2 className="text-cyan-400 animate-spin" size={64} />
            <h2 className="text-xl font-black text-white uppercase tracking-[0.2em] text-center">
              Guardando progreso...
            </h2>
          </div>
        ) : (
          <>
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-3 bg-red-500/20 px-4 py-2 rounded-2xl border border-red-500/30 w-fit">
                <BrainCircuit size={20} className="text-red-400" />
                <span className="text-[12px] font-black uppercase tracking-[0.2em] text-red-200">
                  Misión: {tipo.toUpperCase()}
                </span>
              </div>

              <motion.div
                key={score}
                initial={{ scale: 1.18 }}
                animate={{ scale: 1 }}
                className="flex items-center space-x-2 bg-yellow-500/20 px-4 py-2 rounded-2xl border border-yellow-500/50"
              >
                <Star className="text-yellow-400 fill-yellow-400" size={18} />
                <span className="font-black text-yellow-400">{score} XP</span>
              </motion.div>
            </header>

            <h2 className="text-2xl md:text-3xl font-black text-white leading-tight mb-8 text-center">
              {actualQuestions[step].pregunta}
            </h2>

            <div className="space-y-4 mb-8">
              {actualQuestions[step].opciones.map((opcion, index) => {
                const isSelected = selected === index;
                const isCorrect = isSelected && status === 'correct';

                return (
                  <button
                    key={opcion}
                    onClick={() => handleSelect(index)}
                    disabled={status !== 'idle'}
                    className={`w-full p-5 rounded-2xl border-2 font-black text-left md:text-lg transition-all flex items-center justify-between ${
                      isSelected
                        ? isCorrect
                          ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.35)]'
                          : 'bg-red-600 border-red-400 text-white'
                        : 'bg-black/40 border-white/10 text-slate-200 hover:border-white/30'
                    }`}
                  >
                    <span>{opcion}</span>
                    {isSelected && (isCorrect ? <CheckCircle2 size={24} /> : <XCircle size={24} />)}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={onClose}
                className="text-red-300/70 font-bold uppercase text-[10px] tracking-widest hover:text-white transition-colors"
              >
                Cancelar Misión
              </button>

              <AnimatePresence mode="wait">
                {status === 'correct' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-emerald-400 font-bold text-xs uppercase tracking-widest flex items-center"
                  >
                    <Star size={14} className="mr-2 fill-emerald-400" /> ¡Excelente Agente!
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Quiz;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Star, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import DragDropQuestion, { type DragOption } from './DragDropQuestion';
import volcanQ1Base from '../assets/quiz/volcan-q1-base.webp';
import volcanQ1Correcta from '../assets/quiz/volcan-q1-correcta.webp';
import volcanQ1Mascarilla from '../assets/quiz/volcan-q1-opt-mascarilla.webp';
import volcanQ1Bufanda from '../assets/quiz/volcan-q1-opt-bufanda.webp';
import volcanQ1Gorra from '../assets/quiz/volcan-q1-opt-gorra.webp';
import volcanQ2OptAbierto from '../assets/quiz/volcan-q2-opt-abierto.png';
import volcanQ2OptCubierto from '../assets/quiz/volcan-q2-opt-cubierto.png';
import volcanQ2OptDesbordado from '../assets/quiz/volcan-q2-opt-desbordado.png';
import volcanQ3Base from '../assets/quiz/volcan-q3-base.png';
import volcanQ3Correcta from '../assets/quiz/volcan-q3-correcta.png';
import volcanQ3OptGafasProteccion from '../assets/quiz/volcan-q3-opt-gafas-proteccion.png';
import volcanQ3OptLentesContacto from '../assets/quiz/volcan-q3-opt-lentes-contacto.png';
import volcanQ3OptGafasSol from '../assets/quiz/volcan-q3-opt-gafas-sol.png';

interface Question {
  pregunta: string;
  opciones: string[];
  correcta: number;
  arrastrar?: {
    imagenBase: string;
    imagenCorrecta: string;
    opciones: DragOption[];
  };
}

interface QuizProps {
  tipo: 'diagnostico' | 'volcan' | 'inundacion' | 'sismo' | 'evacuacion';
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
    diagnostico: [
      { pregunta: 'En Gestión de Riesgos, ¿qué significa la palabra "Amenaza"?', opciones: ['El miedo que sentimos cuando empieza a temblar la tierra o llueve fuerte.', 'Un fenómeno o peligro en nuestro entorno (como un volcán activo o lluvias fuertes) que podría causarnos daño.', 'Un castigo de la naturaleza porque no cuidamos el planeta.'], correcta: 1 },
      { pregunta: '¿Qué significa ser "Vulnerables" ante un desastre?', opciones: ['Ser personas muy fuertes y saber exactamente qué hacer en una emergencia.', 'Vivir muy lejos de los volcanes o los ríos, donde nunca pasa nada.', 'Estar expuestos a un peligro y no estar preparados o protegidos para enfrentarlo.'], correcta: 2 },
      { pregunta: 'Si sumamos una "Amenaza" (como el volcán Tungurahua) y nuestra "Vulnerabilidad" (no estar preparados), ¿qué obtenemos?', opciones: ['Un "Riesgo" muy alto de sufrir daños o salir lastimados.', 'Una zona completamente segura.', 'Un evento divertido al que no debemos prestarle atención.'], correcta: 0 },
      { pregunta: '¿A qué llamamos verdaderamente un "Desastre"?', opciones: ['A cualquier lluvia fuerte o viento que ocurre en la naturaleza.', 'Cuando un fenómeno natural causa muchos daños, pérdidas o heridos porque las personas no estaban preparadas.', 'Cuando se va la luz en la escuela por un ratito.'], correcta: 1 },
      { pregunta: '¿Qué es la "Prevención" de riesgos?', opciones: ['Correr muy rápido sin mirar atrás cuando suena una alarma.', 'Esperar a que pase el desastre para recién pedir ayuda a los bomberos.', 'Aprender, prepararnos y tomar acciones antes de que ocurra una emergencia para evitar daños.'], correcta: 2 },
      { pregunta: '¿Qué significa que tu escuela o tu comunidad sea "Resiliente"?', opciones: ['Que tiene la capacidad de resistir, adaptarse y recuperarse rápido después de una emergencia.', 'Que nunca le va a pasar nada malo porque tiene mucha suerte.', 'Que tiene paredes de metal muy gruesas que no se rompen con nada.'], correcta: 0 },
      { pregunta: '¿Para qué sirve un "Sistema de Alerta Temprana" (SAT)?', opciones: ['Para que la escuela nos despierte temprano todos los días.', 'Para avisarnos a tiempo que un peligro se acerca y darnos la oportunidad de protegernos.', 'Para escuchar música muy fuerte en los parques de la ciudad.'], correcta: 1 },
      { pregunta: '¿Cuál es la diferencia más importante entre una "Urgencia" y una "Emergencia"?', opciones: ['En la emergencia la vida de alguien está en peligro y hay que actuar ya, en la urgencia hay tiempo para ir al médico sin riesgo de morir.', 'Son exactamente lo mismo, solo son palabras diferentes para llamar al ECU 911.', 'La urgencia es cuando te duele un poquito la cabeza y la emergencia es cuando tienes hambre.'], correcta: 0 },
      { pregunta: '¿Cómo se define una "Zona Segura"?', opciones: ['Un lugar cerrado donde hay muchos juguetes y fundas de comida.', 'Cualquier lugar de la calle donde esté parado un policía.', 'Un lugar evaluado previamente donde no hay peligro de que nos caigan objetos, nos alcance el agua o los deslaves.'], correcta: 2 },
      { pregunta: 'Tener una buena "Percepción del Riesgo" significa:', opciones: ['Pensar que nunca va a pasar nada malo en Baños porque tenemos suerte.', 'Darnos cuenta de los peligros reales que nos rodean todos los días para poder cuidarnos mejor de forma inteligente.', 'Tenerle muchísimo miedo a la naturaleza y no querer salir de casa nunca.'], correcta: 1 }
    ],

    volcan: [
      {
        pregunta: '¿Qué debes usar para proteger tus pulmones de la ceniza?',
        opciones: ['Mascarilla N95', 'Bufanda', 'Gorra'],
        correcta: 0,
        arrastrar: {
          imagenBase: volcanQ1Base,
          imagenCorrecta: volcanQ1Correcta,
          opciones: [
            { label: 'Mascarilla N95', image: volcanQ1Mascarilla },
            { label: 'Bufanda', image: volcanQ1Bufanda },
            { label: 'Gorra', image: volcanQ1Gorra }
          ]
        }
      },
      {
        pregunta: '¿Qué debes hacer con los depósitos de agua en casa?',
        opciones: ['Dejarlos abiertos', 'Cubrirlos muy bien', 'Vaciarlos todos'],
        correcta: 1,
        arrastrar: {
          imagenBase: '',
          imagenCorrecta: volcanQ2OptCubierto,
          opciones: [
            { label: 'Depósito abierto', image: volcanQ2OptAbierto },
            { label: 'Cubierto', image: volcanQ2OptCubierto },
            { label: 'Desbordado', image: volcanQ2OptDesbordado }
          ]
        }
      },
      {
        pregunta: 'Si usas lentes de contacto, ¿qué es mejor usar hoy?',
        opciones: ['Lentes de contacto', 'Gafas de sol', 'Gafas de protección'],
        correcta: 2,
        arrastrar: {
          imagenBase: volcanQ3Base,
          imagenCorrecta: volcanQ3Correcta,
          opciones: [
            { label: 'Lentes de contacto', image: volcanQ3OptLentesContacto },
            { label: 'Gafas de sol', image: volcanQ3OptGafasSol },
            { label: 'Gafas de protección', image: volcanQ3OptGafasProteccion }
          ]
        }
      }
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

    const niveles = { diagnostico: 2, volcan: 3, inundacion: 4, sismo: 5, evacuacion: 6 };
    const camposMision = {
      diagnostico: 'mision_diagnostico',
      volcan: 'mision_volcan',
      inundacion: 'mision_inundacion',
      sismo: 'mision_sismo',
      evacuacion: 'mision_evacuacion'
    } as const;

    const nuevoNivel = niveles[tipo];
    const campoMision = camposMision[tipo];
    const nombreGuardado = localStorage.getItem('agenteNombre');
    const registroId = localStorage.getItem('agenteRegistroId');

    localStorage.setItem('agenteNivel', nuevoNivel.toString());
    localStorage.setItem(`mision${tipo.charAt(0).toUpperCase()}${tipo.slice(1)}Completada`, 'true');

    try {
      if (registroId || nombreGuardado) {
        const query = supabase
          .from('agentes')
          .update({
            nivel: nuevoNivel,
            [campoMision]: true,
            ultima_conexion: new Date().toISOString()
          });

        const { error } = registroId
          ? await query.eq('id', registroId)
          : await query.eq('nombre', nombreGuardado as string);

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

            {actualQuestions[step].arrastrar ? (
              <div className="mb-8">
                <DragDropQuestion
                  imagenBase={actualQuestions[step].arrastrar!.imagenBase}
                  imagenCorrecta={actualQuestions[step].arrastrar!.imagenCorrecta}
                  opciones={actualQuestions[step].arrastrar!.opciones}
                  status={status}
                  selected={selected}
                  disabled={status !== 'idle' || isSyncing}
                  onDrop={handleSelect}
                />
              </div>
            ) : (
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
            )}

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

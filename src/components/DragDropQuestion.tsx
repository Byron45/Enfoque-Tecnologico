import { useRef } from 'react';
import { motion, type PanInfo } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';

export type DragOption = { label: string; image: string };

type Props = {
  imagenBase: string;
  imagenCorrecta: string;
  opciones: DragOption[];
  status: 'idle' | 'correct' | 'wrong';
  selected: number | null;
  disabled: boolean;
  onDrop: (index: number) => void;
};

const DragDropQuestion = ({ imagenBase, imagenCorrecta, opciones, status, selected, disabled, onDrop }: Props) => {
  const dropZoneRef = useRef<HTMLDivElement | null>(null);
  const escenaImagen = status === 'correct' ? imagenCorrecta : imagenBase;

  const handleDragEnd = (index: number) => (_event: unknown, info: PanInfo) => {
    if (disabled) return;
    const zone = dropZoneRef.current?.getBoundingClientRect();
    if (!zone) return;

    const { x, y } = info.point;
    const dentroDeLaZona = x >= zone.left && x <= zone.right && y >= zone.top && y <= zone.bottom;
    if (dentroDeLaZona) onDrop(index);
  };

  return (
    <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-[1fr_auto]">
      <div
        ref={dropZoneRef}
        className={`relative mx-auto flex h-52 w-52 items-center justify-center rounded-[2rem] border-4 border-dashed transition-colors md:h-60 md:w-60 ${
          status === 'correct'
            ? 'border-emerald-400 bg-emerald-500/10'
            : status === 'wrong'
              ? 'border-red-400 bg-red-500/10'
              : 'border-white/25 bg-white/5'
        }`}
      >
        <motion.img
          key={escenaImagen}
          src={escenaImagen}
          alt="Escenario de la pregunta"
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.32 }}
          className="pointer-events-none h-full w-full select-none object-contain p-3"
          draggable={false}
        />
        {status === 'correct' && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute -right-3 -top-3 rounded-full bg-emerald-500 p-2 text-white shadow-lg"
          >
            <CheckCircle2 size={24} />
          </motion.div>
        )}
        <p className="absolute -bottom-8 left-0 right-0 text-center text-[10px] font-black uppercase tracking-widest text-white/50">
          Arrastra aquí
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-4 md:flex-col md:items-center">
        {opciones.map((option, index) => {
          const esSeleccionIncorrecta = status === 'wrong' && selected === index;

          return (
            <motion.div
              key={option.label}
              drag={!disabled}
              dragSnapToOrigin
              dragElastic={0.2}
              dragMomentum={false}
              whileDrag={{ scale: 1.1, zIndex: 20 }}
              onDragEnd={handleDragEnd(index)}
              animate={esSeleccionIncorrecta ? { x: [0, -10, 10, -10, 10, 0] } : { x: 0 }}
              transition={esSeleccionIncorrecta ? { duration: 0.4 } : undefined}
              className={`relative flex h-24 w-24 touch-none flex-col items-center justify-center gap-1 rounded-2xl border-2 bg-white p-2 shadow-lg md:h-28 md:w-28 ${
                esSeleccionIncorrecta ? 'border-red-400' : 'border-white/40'
              } ${disabled ? 'pointer-events-none opacity-60' : 'cursor-grab active:cursor-grabbing'}`}
            >
              {esSeleccionIncorrecta && <XCircle className="absolute -right-2 -top-2 rounded-full bg-white text-red-500" size={20} />}
              <img src={option.image} alt={option.label} className="h-16 w-16 flex-1 select-none object-contain" draggable={false} />
              <span className="text-[8px] font-black uppercase leading-none text-slate-500">{option.label}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default DragDropQuestion;

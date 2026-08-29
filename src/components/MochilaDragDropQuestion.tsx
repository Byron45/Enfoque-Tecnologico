import { useRef, useState } from 'react';
import { motion, type PanInfo, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Sparkles } from 'lucide-react';

export type MochilaItem = {
  id: string;
  label: string;
  image: string;
  isCorrect: boolean;
};

type Props = {
  imagenMochila: string;
  itemsIzquierda: MochilaItem[];
  itemsDerecha: MochilaItem[];
  disabled: boolean;
  onComplete: () => void;
  onError?: () => void;
};

const MochilaDragDropQuestion = ({
  imagenMochila,
  itemsIzquierda,
  itemsDerecha,
  disabled,
  onComplete,
  onError
}: Props) => {
  const dropZoneRef = useRef<HTMLDivElement | null>(null);
  const [collectedIds, setCollectedIds] = useState<string[]>([]);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const totalCorrect = [...itemsIzquierda, ...itemsDerecha].filter((i) => i.isCorrect).length;

  const tryAddItem = (item: MochilaItem) => {
    if (disabled || isCompleted) return;
    if (collectedIds.includes(item.id)) return;

    if (item.isCorrect) {
      const next = [...collectedIds, item.id];
      setCollectedIds(next);

      if (next.length === totalCorrect) {
        setIsCompleted(true);
        setTimeout(() => {
          onComplete();
        }, 1200);
      }
    } else {
      setWrongId(item.id);
      onError?.();
      setTimeout(() => {
        setWrongId(null);
      }, 700);
    }
  };

  const handleDragEnd = (item: MochilaItem) => (_event: unknown, info: PanInfo) => {
    if (disabled || isCompleted) return;
    const zone = dropZoneRef.current?.getBoundingClientRect();
    if (!zone) return;

    const { x, y } = info.point;
    const dentroDeLaZona = x >= zone.left && x <= zone.right && y >= zone.top && y <= zone.bottom;
    if (dentroDeLaZona) {
      tryAddItem(item);
    }
  };

  const renderItemCard = (item: MochilaItem) => {
    const isCollected = collectedIds.includes(item.id);
    const isWrong = wrongId === item.id;

    if (isCollected) {
      return (
        <motion.div
          key={item.id}
          initial={{ scale: 1, opacity: 1 }}
          animate={{ scale: 0.85, opacity: 0.35 }}
          className="relative flex h-20 w-20 md:h-24 md:w-24 flex-col items-center justify-center rounded-2xl border-2 border-emerald-400/40 bg-emerald-500/10 p-1.5 opacity-40 select-none"
        >
          <img src={item.image} alt={item.label} className="h-12 w-12 object-contain grayscale" draggable={false} />
          <span className="text-[7px] md:text-[8px] font-black uppercase text-emerald-300">Guardado ✓</span>
        </motion.div>
      );
    }

    return (
      <motion.div
        key={item.id}
        drag={!disabled && !isCompleted}
        dragSnapToOrigin
        dragElastic={0.2}
        dragMomentum={false}
        whileDrag={{ scale: 1.15, zIndex: 50 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onDragEnd={handleDragEnd(item)}
        onClick={() => tryAddItem(item)}
        animate={isWrong ? { x: [0, -10, 10, -10, 10, 0] } : { x: 0 }}
        transition={isWrong ? { duration: 0.4 } : undefined}
        className={`relative flex h-20 w-20 md:h-24 md:w-24 touch-none cursor-grab active:cursor-grabbing flex-col items-center justify-center gap-1 rounded-2xl border-2 p-1.5 shadow-lg transition-colors select-none ${
          isWrong
            ? 'border-red-500 bg-red-500/20'
            : 'border-white/20 bg-white/10 hover:border-cyan-400 hover:bg-white/15'
        }`}
      >
        {isWrong && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow-lg">
            <XCircle size={16} />
          </motion.div>
        )}
        <img src={item.image} alt={item.label} className="h-11 w-11 md:h-13 md:w-13 flex-1 object-contain pointer-events-none" draggable={false} />
        <span className="text-[7px] md:text-[8px] font-black uppercase leading-tight text-center text-slate-200">
          {item.label}
        </span>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-cyan-300">
        <Sparkles size={14} className="text-yellow-400" />
        <span>Arrastra los 4 elementos indispensables a la mochila</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4 md:gap-6 w-full max-w-3xl">
        {/* Columna Izquierda: 4 Elementos (2x2) */}
        <div className="grid grid-cols-4 md:grid-cols-2 gap-2.5 justify-items-center order-2 md:order-1">
          {itemsIzquierda.map(renderItemCard)}
        </div>

        {/* Centro: Mochila de Emergencia (Zona de Soltar) */}
        <div className="flex flex-col items-center order-1 md:order-2">
          <div
            ref={dropZoneRef}
            className={`relative flex h-52 w-52 md:h-64 md:w-64 flex-col items-center justify-center rounded-[2.5rem] border-4 border-dashed p-4 transition-all ${
              isCompleted
                ? 'border-emerald-400 bg-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.4)]'
                : wrongId
                  ? 'border-red-400 bg-red-500/15'
                  : collectedIds.length > 0
                    ? 'border-cyan-400 bg-cyan-500/15 shadow-[0_0_30px_rgba(6,182,212,0.25)]'
                    : 'border-cyan-400/40 bg-slate-900/60'
            }`}
          >
            <motion.img
              src={imagenMochila}
              alt="Mochila de emergencia"
              animate={
                isCompleted
                  ? { scale: [1, 1.08, 1], rotate: [0, -3, 3, 0] }
                  : collectedIds.length > 0
                    ? { scale: [1, 1.05, 1] }
                    : {}
              }
              transition={{ duration: 0.4 }}
              className="h-36 w-36 md:h-44 md:w-44 object-contain pointer-events-none drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
              draggable={false}
            />

            {/* Contador / Indicador de progreso */}
            <div className="mt-1 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/60 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-yellow-300">
              <span>Guardados:</span>
              <span className="text-white font-bold">{collectedIds.length} / {totalCorrect}</span>
            </div>

            {/* Celebración de completado */}
            <AnimatePresence>
              {isCompleted && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute inset-0 flex flex-col items-center justify-center rounded-[2.5rem] bg-emerald-950/85 backdrop-blur-sm p-4 text-center border-4 border-emerald-400"
                >
                  <CheckCircle2 size={48} className="text-emerald-400 mb-1 animate-bounce" />
                  <h4 className="text-lg font-black uppercase tracking-wider text-white">¡Mochila Lista!</h4>
                  <p className="text-xs font-bold text-emerald-200 mt-1">Guardaste los 4 elementos indispensables</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Columna Derecha: 4 Elementos (2x2) */}
        <div className="grid grid-cols-4 md:grid-cols-2 gap-2.5 justify-items-center order-3">
          {itemsDerecha.map(renderItemCard)}
        </div>
      </div>
    </div>
  );
};

export default MochilaDragDropQuestion;

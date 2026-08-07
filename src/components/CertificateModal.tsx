import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Award, Download, X } from 'lucide-react';
import brandLogoUrl from '../assets/logo-agentes-prevencion.png';

type Props = {
  open: boolean;
  onClose: () => void;
  nombre: string;
  institucion: string;
};

const DEDICATORIA = 'Por completar con valentía y responsabilidad todas las misiones de prevención, aprendiendo a proteger su vida, su familia y su comunidad ante cualquier emergencia.';

const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = reject;
  img.src = src;
});

const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

const wrapText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
  const words = text.split(' ');
  let line = '';
  let cursorY = y;

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, cursorY);
      line = word;
      cursorY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) ctx.fillText(line, x, cursorY);
};

const CertificateModal = ({ open, onClose, nombre, institucion }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!open) return;
    setReady(false);
    let cancelled = false;

    const draw = async () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      const W = canvas.width;
      const H = canvas.height;
      const margin = 40;

      const gradient = ctx.createLinearGradient(0, 0, W, H);
      gradient.addColorStop(0, '#0B4BB3');
      gradient.addColorStop(1, '#071D4A');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = '#F7FAFF';
      roundRect(ctx, margin, margin, W - margin * 2, H - margin * 2, 28);
      ctx.fill();

      ctx.strokeStyle = '#FACC15';
      ctx.lineWidth = 6;
      roundRect(ctx, margin + 16, margin + 16, W - margin * 2 - 32, H - margin * 2 - 32, 20);
      ctx.stroke();

      try {
        const logo = await loadImage(brandLogoUrl);
        if (cancelled) return;
        const logoSize = 130;
        const logoY = margin + 96;
        ctx.save();
        ctx.beginPath();
        ctx.arc(W / 2, logoY, logoSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(logo, W / 2 - logoSize / 2, logoY - logoSize / 2, logoSize, logoSize);
        ctx.restore();
        ctx.strokeStyle = '#0B4BB3';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(W / 2, logoY, logoSize / 2, 0, Math.PI * 2);
        ctx.stroke();
      } catch {
        // el logo es decorativo; si falla la carga, seguimos sin él
      }

      ctx.textAlign = 'center';
      ctx.fillStyle = '#071D4A';
      ctx.font = '900 44px "Segoe UI", system-ui, sans-serif';
      ctx.fillText('CERTIFICADO', W / 2, margin + 250);

      ctx.fillStyle = '#EA580C';
      ctx.font = '900 26px "Segoe UI", system-ui, sans-serif';
      ctx.fillText('AGENTE DE PREVENCIÓN', W / 2, margin + 288);

      ctx.fillStyle = '#475569';
      ctx.font = '700 20px "Segoe UI", system-ui, sans-serif';
      ctx.fillText('Se otorga el presente reconocimiento a:', W / 2, margin + 336);

      ctx.fillStyle = '#0B4BB3';
      ctx.font = '900 52px "Segoe UI", system-ui, sans-serif';
      ctx.fillText((nombre || 'Agente').toUpperCase(), W / 2, margin + 402);

      ctx.fillStyle = '#64748B';
      ctx.font = '700 20px "Segoe UI", system-ui, sans-serif';
      ctx.fillText(institucion || 'Distrito 18D03', W / 2, margin + 436);

      ctx.fillStyle = '#334155';
      ctx.font = 'italic 500 19px "Segoe UI", system-ui, sans-serif';
      wrapText(ctx, DEDICATORIA, W / 2, margin + 494, W - margin * 2 - 200, 28);

      const fecha = new Date().toLocaleDateString('es-EC', { day: 'numeric', month: 'long', year: 'numeric' });
      ctx.fillStyle = '#94A3B8';
      ctx.font = '700 15px "Segoe UI", system-ui, sans-serif';
      ctx.fillText(`Distrito 18D03 · ${fecha}`, W / 2, H - margin - 36);

      if (!cancelled) setReady(true);
    };

    draw();
    return () => { cancelled = true; };
  }, [open, nombre, institucion]);

  const descargar = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `certificado-${(nombre || 'agente').toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[130] flex items-center justify-center bg-[#071D4A]/85 p-4 backdrop-blur-lg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.section initial={{ y: 24, scale: .96 }} animate={{ y: 0, scale: 1 }} exit={{ y: 16, scale: .96 }} className="relative w-full max-w-2xl rounded-[2.2rem] border-4 border-white bg-white p-5 shadow-2xl md:p-6">
            <button onClick={onClose} className="absolute right-4 top-4 z-10 rounded-full bg-rose-500 p-2.5 text-white shadow-lg hover:bg-rose-400" aria-label="Cerrar"><X size={18} /></button>

            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-100 text-yellow-700"><Award size={26} /></div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.2em] text-yellow-600">¡Felicidades, agente!</p>
                <h3 className="text-xl font-black text-slate-900 md:text-2xl">Tu certificado está listo</h3>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              <canvas ref={canvasRef} width={1600} height={1100} className="h-auto w-full" />
            </div>

            <button
              type="button"
              onClick={descargar}
              disabled={!ready}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-500 px-5 py-4 text-sm font-black uppercase tracking-wider text-white shadow-lg transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {ready ? 'Descargar certificado' : 'Preparando certificado...'} <Download size={18} />
            </button>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CertificateModal;

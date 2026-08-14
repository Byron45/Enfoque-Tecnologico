import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Award, Download, X } from 'lucide-react';
import logoUrl from '../assets/logo-agentes-prevencion.png';
import heroiNinaUrl from '../assets/guia-nina.png';
import heroiNinoUrl from '../assets/guia-nino.png';

type Props = {
  open: boolean;
  onClose: () => void;
  nombre: string;
  institucion: string;
};

/* Canvas and PDF dimensions */
const W = 2400;
const H = 1680;
const PDF_W = 850.5;
const PDF_H = 595.5;

/* Horizontal center for text */
const FULL_CX = W / 2;

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

const fitFont = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxW: number,
  start: number,
  min: number,
  style: string
) => {
  let s = start;
  while (s > min) {
    ctx.font = `${style} ${s}px Arial, Helvetica, sans-serif`;
    if (ctx.measureText(text).width <= maxW) return s;
    s -= 2;
  }
  return min;
};

const binaryToBytes = (v: string) => {
  const b = new Uint8Array(v.length);
  for (let i = 0; i < v.length; i++) b[i] = v.charCodeAt(i) & 0xff;
  return b;
};

const canvasToPdf = (canvas: HTMLCanvasElement) => {
  const url = canvas.toDataURL('image/jpeg', 0.92);
  const bin = atob(url.split(',')[1] || '');
  const objs: string[] = [];
  const offs: number[] = [];
  let body = '%PDF-1.4\n%\xFF\xFF\xFF\xFF\n';

  const add = (c: string) => {
    offs.push(body.length);
    body += `${objs.length + 1} 0 obj\n${c}\nendobj\n`;
    objs.push(c);
  };

  add('<< /Type /Catalog /Pages 2 0 R >>');
  add('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PDF_W} ${PDF_H}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`);
  add(`<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${bin.length} >>\nstream\n${bin}\nendstream`);

  const cs = `q\n${PDF_W} 0 0 ${PDF_H} 0 0 cm\n/Im0 Do\nQ`;
  add(`<< /Length ${cs.length} >>\nstream\n${cs}\nendstream`);

  const xref = body.length;
  body += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  offs.forEach((o) => (body += `${String(o).padStart(10, '0')} 00000 n \n`));
  body += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;

  return new Blob([binaryToBytes(body)], { type: 'application/pdf' });
};

const stripeGradient = (ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number) => {
  const lg = ctx.createLinearGradient(x0, y0, x1, y1);
  lg.addColorStop(0, '#1a4fc4');
  lg.addColorStop(0.35, '#6a3bb5');
  lg.addColorStop(0.6, '#d946a8');
  lg.addColorStop(1, '#e84870');
  return lg;
};

const drawBackground = (ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.fillStyle = stripeGradient(ctx, 0, 0, W, 0);
  ctx.fillRect(0, 0, W, 40);
  ctx.restore();

  ctx.save();
  ctx.fillStyle = stripeGradient(ctx, 0, H, W, H);
  ctx.fillRect(0, H - 40, W, 40);
  ctx.restore();

  ctx.save();
  ctx.fillStyle = stripeGradient(ctx, 0, 0, 0, H);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(280, 0);
  ctx.lineTo(100, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.fillStyle = stripeGradient(ctx, W, 0, W, H);
  ctx.beginPath();
  ctx.moveTo(W - 100, 0);
  ctx.lineTo(W, 0);
  ctx.lineTo(W, H);
  ctx.lineTo(W - 280, H);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};

const drawSeparator = (ctx: CanvasRenderingContext2D, y: number, width: number) => {
  const lg = ctx.createLinearGradient(FULL_CX - width / 2, y, FULL_CX + width / 2, y);
  lg.addColorStop(0, 'rgba(106,59,181,0)');
  lg.addColorStop(0.2, 'rgba(106,59,181,0.6)');
  lg.addColorStop(0.5, 'rgba(217,70,168,0.9)');
  lg.addColorStop(0.8, 'rgba(106,59,181,0.6)');
  lg.addColorStop(1, 'rgba(106,59,181,0)');
  ctx.fillStyle = lg;
  ctx.fillRect(FULL_CX - width / 2, y, width, 5);
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

      const [logo, heroina, heroe] = await Promise.all([
        loadImage(logoUrl),
        loadImage(heroiNinaUrl),
        loadImage(heroiNinoUrl),
      ]);
      if (cancelled) return;

      ctx.clearRect(0, 0, W, H);
      drawBackground(ctx);

      const logoS = 450;
      ctx.drawImage(logo, 275, 250, logoS, logoS);

      const heroH = 440;
      const ninAR = heroina.width / heroina.height;
      const ninOAR = heroe.width / heroe.height;
      const heroesYOffset = 180; 
      const heroesXPadding = 275;
      ctx.drawImage(heroina, heroesXPadding, H - heroH - heroesYOffset, ninAR * heroH, heroH);
      ctx.drawImage(heroe, W - ninOAR * heroH - heroesXPadding, H - heroH - heroesYOffset, ninOAR * heroH, heroH);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const displayName = (nombre || 'Agente de Prevención').trim();
      const displayInst = (institucion || '').trim();
      const date = new Date().toLocaleDateString('es-EC', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      let y = 160;

      const titleSize = fitFont(ctx, 'Certificado de aprobación', 1900, 130, 80, 'bold italic');
      ctx.font = `bold italic ${titleSize}px Arial, Helvetica, sans-serif`;
      ctx.fillStyle = '#111111';
      ctx.fillText('Certificado de aprobación', FULL_CX, y);
      y += 180;

      ctx.font = '68px Arial, Helvetica, sans-serif';
      ctx.fillStyle = '#222222';
      ctx.fillText('Los héroes Prevención y', FULL_CX, y);
      y += 95;

      ctx.fillText('Resiliencia del Distrito 18D03', FULL_CX, y);
      y += 95;

      ctx.font = 'italic 60px Arial, Helvetica, sans-serif';
      ctx.fillStyle = '#444444';
      ctx.fillText('certifican que:', FULL_CX, y);
      y += 130;

      const nameSize = fitFont(ctx, displayName, 1900, 150, 70, 'bold italic');
      const adjustedNameSize = Math.max(nameSize - 10, 60);
      ctx.font = `bold italic ${adjustedNameSize}px Arial, Helvetica, sans-serif`;
      ctx.fillStyle = '#050505';
      ctx.fillText(displayName, FULL_CX, y);
      y += adjustedNameSize * 0.55 + 50;

      drawSeparator(ctx, y, 1000);
      y += 90;

      ctx.fillStyle = '#333333';

      if (displayInst) {
        const fullLine = `estudiante de ${displayInst} ha participado y`;
        ctx.font = '54px Arial, Helvetica, sans-serif';
        const fullLineW = ctx.measureText(fullLine).width;

        if (fullLineW <= 1900) {
          const partBefore = 'estudiante de ';
          const partAfter = ' ha participado y';

          ctx.font = '54px Arial, Helvetica, sans-serif';
          const wB = ctx.measureText(partBefore).width;
          ctx.font = 'italic 54px Arial, Helvetica, sans-serif';
          const wI = ctx.measureText(displayInst).width;
          ctx.font = '54px Arial, Helvetica, sans-serif';
          const wA = ctx.measureText(partAfter).width;
          const totalW = wB + wI + wA;
          const sx = FULL_CX - totalW / 2;

          ctx.textAlign = 'left';
          ctx.font = '54px Arial, Helvetica, sans-serif';
          ctx.fillStyle = '#333333';
          ctx.fillText(partBefore, sx, y);

          ctx.font = 'italic 54px Arial, Helvetica, sans-serif';
          ctx.fillStyle = '#111111';
          ctx.fillText(displayInst, sx + wB, y);

          ctx.font = '54px Arial, Helvetica, sans-serif';
          ctx.fillStyle = '#333333';
          ctx.fillText(partAfter, sx + wB + wI, y);

          ctx.textAlign = 'center';
          y += 80;
        } else {
          ctx.textAlign = 'center';
          const instFontSize = fitFont(ctx, `estudiante de ${displayInst}`, 1900, 54, 32, '');

          const partBefore = 'estudiante de ';
          ctx.font = `${instFontSize}px Arial, Helvetica, sans-serif`;
          const wB = ctx.measureText(partBefore).width;
          ctx.font = `italic ${instFontSize}px Arial, Helvetica, sans-serif`;
          const wI = ctx.measureText(displayInst).width;
          const totalW = wB + wI;
          const sx = FULL_CX - totalW / 2;

          ctx.textAlign = 'left';
          ctx.font = `${instFontSize}px Arial, Helvetica, sans-serif`;
          ctx.fillStyle = '#333333';
          ctx.fillText(partBefore, sx, y);

          ctx.font = `italic ${instFontSize}px Arial, Helvetica, sans-serif`;
          ctx.fillStyle = '#111111';
          ctx.fillText(displayInst, sx + wB, y);

          ctx.textAlign = 'center';
          y += instFontSize + 30;

          ctx.font = `${instFontSize}px Arial, Helvetica, sans-serif`;
          ctx.fillStyle = '#333333';
          ctx.fillText('ha participado y', FULL_CX, y);
          y += 80;
        }
      } else {
        ctx.font = '54px Arial, Helvetica, sans-serif';
        ctx.fillText('ha participado y', FULL_CX, y);
        y += 80;
      }

      ctx.font = '54px Arial, Helvetica, sans-serif';
      ctx.fillStyle = '#333333';
      ctx.fillText('aprobado todos los módulos de', FULL_CX, y);
      y += 100;

      ctx.font = 'bold 78px Arial, Helvetica, sans-serif';
      ctx.fillStyle = '#111111';
      ctx.fillText('MISIÓN PREVENCIÓN', FULL_CX, y);
      y += 140;

      ctx.font = '42px Arial, Helvetica, sans-serif';
      ctx.fillStyle = '#555555';
      ctx.fillText('Ofrecido a través de la Plataforma de educación en', FULL_CX, y);
      y += 70;

      ctx.fillText('Gestión de Riesgos de Desastres para el distrito 18D03.', FULL_CX, y);
      y += 80;

      ctx.font = 'bold 50px Arial, Helvetica, sans-serif';
      ctx.fillStyle = '#222222';
      ctx.fillText(date, FULL_CX, y);

      if (!cancelled) setReady(true);
    };

    draw();
    return () => {
      cancelled = true;
    };
  }, [open, nombre, institucion]);

  const descargar = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pdf = canvasToPdf(canvas);
    const url = URL.createObjectURL(pdf);
    const link = document.createElement('a');
    link.download = `certificado-${(nombre || 'agente').toLowerCase().replace(/\s+/g, '-')}.pdf`;
    link.href = url;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[130] flex items-center justify-center bg-[#071D4A]/85 p-4 backdrop-blur-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.section
            initial={{ y: 24, scale: 0.96 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 16, scale: 0.96 }}
            className="relative w-full max-w-3xl rounded-[2.2rem] border-4 border-white bg-white p-5 shadow-2xl md:p-6"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 rounded-full bg-rose-500 p-2.5 text-white shadow-lg hover:bg-rose-400"
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>

            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-100 text-yellow-700">
                <Award size={26} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.2em] text-yellow-600">
                  Felicidades, agente
                </p>
                <h3 className="text-xl font-black text-slate-900 md:text-2xl">
                  Tu certificado PDF está listo
                </h3>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              <canvas ref={canvasRef} width={W} height={H} className="h-auto w-full" />
            </div>

            <button
              type="button"
              onClick={descargar}
              disabled={!ready}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-500 px-5 py-4 text-sm font-black uppercase tracking-wider text-white shadow-lg transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {ready ? 'Descargar certificado PDF' : 'Preparando certificado...'}{' '}
              <Download size={18} />
            </button>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CertificateModal;
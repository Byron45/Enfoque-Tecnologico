import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Award, Download, X } from 'lucide-react';
import certificadoTemplateUrl from '../assets/certificado-aprobacion-template.jpg';

type Props = {
  open: boolean;
  onClose: () => void;
  nombre: string;
  institucion: string;
};

const CANVAS_WIDTH = 1772;
const CANVAS_HEIGHT = 1241;
const PDF_WIDTH = 850.5;
const PDF_HEIGHT = 595.5;

const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = reject;
  img.src = src;
});

const fitFontSize = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  startSize: number,
  minSize: number
) => {
  let size = startSize;
  while (size > minSize) {
    ctx.font = `italic 800 ${size}px "Segoe UI", Arial, sans-serif`;
    if (ctx.measureText(text).width <= maxWidth) return size;
    size -= 2;
  }
  return minSize;
};

const binaryStringToUint8Array = (value: string) => {
  const bytes = new Uint8Array(value.length);
  for (let index = 0; index < value.length; index += 1) {
    bytes[index] = value.charCodeAt(index) & 0xff;
  }
  return bytes;
};

const canvasToPdfBlob = (canvas: HTMLCanvasElement) => {
  const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
  const imageBinary = atob(dataUrl.split(',')[1] || '');
  const objects: string[] = [];
  const offsets: number[] = [];
  let body = '%PDF-1.4\n%\xFF\xFF\xFF\xFF\n';

  const addObject = (content: string) => {
    offsets.push(body.length);
    body += `${objects.length + 1} 0 obj\n${content}\nendobj\n`;
    objects.push(content);
  };

  addObject('<< /Type /Catalog /Pages 2 0 R >>');
  addObject('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  addObject(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PDF_WIDTH} ${PDF_HEIGHT}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`);
  addObject(`<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imageBinary.length} >>\nstream\n${imageBinary}\nendstream`);

  const contentStream = `q\n${PDF_WIDTH} 0 0 ${PDF_HEIGHT} 0 0 cm\n/Im0 Do\nQ`;
  addObject(`<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream`);

  const xrefStart = body.length;
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((offset) => {
    body += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return new Blob([binaryStringToUint8Array(body)], { type: 'application/pdf' });
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

      const template = await loadImage(certificadoTemplateUrl);
      if (cancelled) return;

      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.drawImage(template, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      const displayName = (nombre || 'Agente de Prevencion').trim();
      const date = new Date().toLocaleDateString('es-EC', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(505, 545, 770, 98);
      const nameFontSize = fitFontSize(ctx, displayName, 720, 70, 38);
      ctx.font = `italic 800 ${nameFontSize}px "Segoe UI", Arial, sans-serif`;
      ctx.fillStyle = '#050505';
      ctx.fillText(displayName, CANVAS_WIDTH / 2, 603);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(650, 955, 470, 70);
      ctx.font = '400 40px "Segoe UI", Arial, sans-serif';
      ctx.fillStyle = '#050505';
      ctx.fillText(date, CANVAS_WIDTH / 2, 995);

      if (institucion) {
        ctx.font = '600 26px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#334155';
        ctx.fillText(institucion, CANVAS_WIDTH / 2, 673);
      }

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

    const pdfBlob = canvasToPdfBlob(canvas);
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.download = `certificado-${(nombre || 'agente').toLowerCase().replace(/\s+/g, '-')}.pdf`;
    link.href = url;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[130] flex items-center justify-center bg-[#071D4A]/85 p-4 backdrop-blur-lg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.section initial={{ y: 24, scale: .96 }} animate={{ y: 0, scale: 1 }} exit={{ y: 16, scale: .96 }} className="relative w-full max-w-3xl rounded-[2.2rem] border-4 border-white bg-white p-5 shadow-2xl md:p-6">
            <button onClick={onClose} className="absolute right-4 top-4 z-10 rounded-full bg-rose-500 p-2.5 text-white shadow-lg hover:bg-rose-400" aria-label="Cerrar"><X size={18} /></button>

            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-100 text-yellow-700"><Award size={26} /></div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.2em] text-yellow-600">Felicidades, agente</p>
                <h3 className="text-xl font-black text-slate-900 md:text-2xl">Tu certificado PDF esta listo</h3>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="h-auto w-full" />
            </div>

            <button
              type="button"
              onClick={descargar}
              disabled={!ready}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-500 px-5 py-4 text-sm font-black uppercase tracking-wider text-white shadow-lg transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {ready ? 'Descargar certificado PDF' : 'Preparando certificado...'} <Download size={18} />
            </button>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CertificateModal;

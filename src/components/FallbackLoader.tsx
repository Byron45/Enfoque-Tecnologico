import { Loader2 } from 'lucide-react';
import brandLogoUrl from '../assets/logo-agentes-prevencion.png';

const FallbackLoader = () => {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#071D4A] p-4 text-center">
      <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-[6px] border-white/20 bg-gradient-to-b from-[#0B4BB3] to-[#16B7D8] shadow-2xl">
        <img 
          src={brandLogoUrl} 
          alt="Cargando Misión Prevención" 
          className="h-24 w-24 object-contain opacity-90"
        />
      </div>
      <div className="mt-8 flex items-center gap-3 text-cyan-300">
        <Loader2 size={28} className="animate-spin" />
        <p className="text-lg font-black uppercase tracking-[.15em]">
          Preparando tu aventura...
        </p>
      </div>
    </div>
  );
};

export default FallbackLoader;

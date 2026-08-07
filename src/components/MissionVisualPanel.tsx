import React from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon } from 'lucide-react';

type MissionVisualPanelProps = {
  imageUrl?: string;
  missionLabel: string;
  title: string;
  description: string;
  accentTextClass: string;
  accentBgClass: string;
  icon: React.ReactNode;
};

const DEFAULT_MISSION_IMAGES: Record<string, string> = {
  'Misión 03': 'https://blogger.googleusercontent.com/img/a/AVvXsEj30af-Q4RWDQcuKy1ZdmamG3XprMhQw-Yj5nFzod_cdDnNFCRlud3UjNhu0Nd4KTvxQ-EB2dhJ3YQUY--NgcAnrBpuc0HGSnqd8Yuq1OvfjLg-pRlqx0RDBbz29ZhMgPeoI8zZsEYr0SPgqiaVcQacItbmnv07ZDJ4Mncgoh6myxWCz7bYomnO8URAjJg',
  'Misión 05': 'https://blogger.googleusercontent.com/img/a/AVvXsEieVDFfz8rePd1-thfyVOMQLuKbF2LiF2jZeKAsCz-TD3fbHMx2EpKbScRB9_9IyjZ667m7D_PTnWM3SeMRDYU5V1NKKL0mgfFzciPl0Cd9agL4FqF_3GOj8KFPPCmLoKgAdDB_vcrtoVJzISH3E_nTPUB21Zw6hEiU2E4hNnbeCHNICNNWeBc_yizLgXA'
};

const MissionVisualPanel = ({
  imageUrl,
  missionLabel,
  title,
  description,
  accentTextClass,
  accentBgClass,
  icon
}: MissionVisualPanelProps) => {
  const resolvedImageUrl = imageUrl || DEFAULT_MISSION_IMAGES[missionLabel] || '';
  const hasImage = Boolean(resolvedImageUrl);

  return (
    <div className="relative min-h-0 overflow-hidden bg-slate-950">
      {hasImage ? (
        <img
          src={resolvedImageUrl}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${accentBgClass}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:32px_32px] opacity-25" />
          <motion.div
            animate={{ scale: [1, 1.08, 1], opacity: [0.45, 0.75, 0.45] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/15 blur-[90px]"
          />
          <motion.div
            animate={{ x: ['-35%', '25%', '-35%'] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-0 h-32 w-1/2 rotate-12 bg-white/10 blur-[50px]"
          />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-black/20" />

      <div className="relative z-10 flex h-full min-h-[360px] flex-col justify-between p-5 md:p-6">
        <div className="flex w-fit items-center gap-2 rounded-2xl border border-white/10 bg-black/45 px-4 py-3 backdrop-blur-xl">
          <span className={accentTextClass}>{icon}</span>
          <span className={`text-[9px] font-black uppercase tracking-[0.24em] ${accentTextClass}`}>{missionLabel}</span>
        </div>

        <div className="max-w-xl">
          <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-black/35 ${accentTextClass} backdrop-blur-xl`}>
            <ImageIcon size={26} />
          </div>
          <h2 className="text-3xl md:text-5xl font-black uppercase leading-none tracking-tight text-white drop-shadow-2xl">
            {title}
          </h2>
          <p className="mt-3 max-w-lg text-sm md:text-base font-semibold leading-relaxed text-white/75">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MissionVisualPanel;

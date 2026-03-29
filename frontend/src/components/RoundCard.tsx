'use client';

interface RoundCardProps {
  round: {
    id: number;
    name: string;
    status: 'active' | 'locked' | 'hidden';
    description: string;
  };
  onEnter: () => void;
}

export default function RoundCard({ round, onEnter }: RoundCardProps) {
  const isActive = round.status === 'active';
  const statusLabel = isActive ? 'ACTIVE' : round.status === 'hidden' ? 'COMING SOON' : 'LOCKED';
  const statusClass = isActive
    ? 'text-green-400 bg-green-500/10 border-green-500/40'
    : round.status === 'hidden'
      ? 'text-star-wars-yellow bg-star-wars-yellow/10 border-star-wars-yellow/40'
      : 'text-red-400 bg-red-500/10 border-red-500/40';

  return (
    <div className={`relative p-12 bg-white/5 border border-white/10 backdrop-blur-sm flex flex-col items-center text-center transition-all ${!isActive ? 'opacity-40 pointer-events-none' : 'hover:bg-white/10 hover:border-white/30'}`}>
      <div className="mb-6">
        <span className="text-[10px] uppercase tracking-[0.6em] font-black text-slate-500">
          Target Round 0{round.id}
        </span>
      </div>
      <span className={`mb-4 border px-3 py-1 text-[9px] tracking-[0.2em] font-bold uppercase ${statusClass}`}>
        {statusLabel}
      </span>

      <h3 className="text-4xl font-black uppercase mb-4 text-white tracking-tighter font-sf-distant">
        {round.name}
      </h3>

      <p className="text-xs text-slate-400 leading-relaxed mb-10 tracking-widest uppercase">
        {round.description}
      </p>

      {isActive && (
        <button 
          onClick={onEnter}
          className="px-12 py-3 bg-white text-black font-black uppercase text-[10px] tracking-[0.4em] hover:bg-star-wars-yellow transition-all"
        >
          Initialize
        </button>
      )}

      {/* Tactical Accents */}
      <div className="absolute top-4 left-4 w-4 h-[1px] bg-white/20" />
      <div className="absolute top-4 left-4 w-[1px] h-4 bg-white/20" />
      <div className="absolute bottom-4 right-4 w-4 h-[1px] bg-white/20" />
      <div className="absolute bottom-4 right-4 w-[1px] h-4 bg-white/20" />
    </div>
  );
}

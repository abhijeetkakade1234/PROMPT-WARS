'use client';

interface RoundCardProps {
  round: {
    id: number;
    name: string;
    status: string;
    description: string;
  };
  onEnter: () => void;
}

export default function RoundCard({ round, onEnter }: RoundCardProps) {
  const isActive = round.status === 'active';
  const isLocked = round.status === 'locked';
  const isHidden = round.status === 'hidden';

  return (
    <div className={`relative p-8 glow-border bg-black/40 flex flex-col items-center text-center transition-all ${!isActive ? 'opacity-60 grayscale' : 'hover:scale-105 hover:bg-black/60'}`}>
      <div className="mb-6">
        <span className={`text-[10px] uppercase tracking-[0.4em] font-bold ${isActive ? 'text-neon-blue' : 'text-slate-500'}`}>
          Round 0{round.id}
        </span>
      </div>

      <h3 className={`text-2xl font-black uppercase mb-3 ${isActive ? 'text-white' : 'text-slate-400'}`}>
        {isHidden ? '???????' : round.name}
      </h3>

      <p className="text-sm text-slate-400 leading-relaxed mb-8 flex-grow">
        {isHidden ? 'This challenge is currently classified.' : round.description}
      </p>

      {isActive ? (
        <button 
          onClick={onEnter}
          className="w-full py-3 bg-neon-blue text-black font-bold uppercase text-xs tracking-widest hover:brightness-110 transition-all"
        >
          Begin Mission
        </button>
      ) : (
        <div className="w-full py-3 bg-white/5 border border-white/10 text-slate-500 font-bold uppercase text-xs tracking-widest cursor-not-allowed">
          {isLocked ? 'Mission Locked' : 'Coming Soon'}
        </div>
      )}

      {/* Decorative Corner Accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-neon-blue/40" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-neon-blue/40" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-neon-blue/40" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-neon-blue/40" />
    </div>
  );
}

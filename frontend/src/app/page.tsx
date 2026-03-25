import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen text-center p-6 sm:p-24 overflow-hidden">
      <div className="starfield" />
      
      {/* Cinematic Heading */}
      <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase mb-6 text-star-wars-yellow drop-shadow-[0_0_15px_rgba(255,232,31,0.5)]">
        Prompt Wars
      </h1>
      
      <p className="text-xl md:text-2xl font-light text-slate-400 max-w-2xl mb-12 animate-pulse">
        The ultimate AI competition. Test your prompting skills across Image, Text, and Code.
      </p>

      <div className="flex gap-6">
        <Link 
          href="/dashboard"
          className="px-12 py-4 bg-neon-blue text-black font-bold uppercase tracking-widest rounded-sm hover:scale-105 transition-transform shadow-[0_0_20px_rgba(0,210,255,0.6)]"
        >
          Enter the Arena
        </Link>
      </div>

      <div className="absolute bottom-12 w-full max-w-4xl grid grid-cols-3 gap-8 px-4 opacity-50">
        <div className="text-center">
          <span className="block text-neon-blue text-xs uppercase tracking-[0.3em] mb-1">Round 01</span>
          <span className="text-sm font-bold">Image Prompting</span>
        </div>
        <div className="text-center border-x border-white/10">
          <span className="block text-neon-purple text-xs uppercase tracking-[0.3em] mb-1">Round 02</span>
          <span className="text-sm font-bold">Creative Text</span>
        </div>
        <div className="text-center">
          <span className="block text-slate-500 text-xs uppercase tracking-[0.3em] mb-1">Round 03</span>
          <span className="text-sm font-bold">The Secret Round</span>
        </div>
      </div>
    </div>
  );
}

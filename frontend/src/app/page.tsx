import Starfield from '@/components/Starfield';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden">
      <Starfield />
      
      {/* Cinematic Logo Only */}
      <div className="relative z-10 flex flex-col items-center">
        <h1 className="text-8xl md:text-[200px] font-black uppercase tracking-normal text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] text-center font-star-jedi leading-[0.8] mb-8">
          PROMPT<br/>WARS
        </h1>
        
        <div className="mt-12">
          <Link 
            href="/dashboard"
            className="px-20 py-4 border border-white/20 hover:border-white text-white font-bold uppercase tracking-[1em] text-[10px] transition-all hover:bg-white/5 backdrop-blur-md"
          >
            Submit
          </Link>
        </div>
      </div>
    </div>
  );
}

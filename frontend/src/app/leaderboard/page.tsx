'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Starfield from '@/components/Starfield';

const API_BASE = 'http://localhost:5000/api';

export default function LeaderboardPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await axios.get(`${API_BASE}/leaderboard`);
      setData(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch leaderboard", error);
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-neon-blue uppercase tracking-widest">Scanning Galactic Records...</div>;

  return (
    <div className="min-h-screen p-8 md:p-12 lg:p-24 relative overflow-hidden text-white font-mono">
      <Starfield />
      
      <header className="fixed top-0 left-0 w-full p-6 border-b border-white/10 bg-black/50 backdrop-blur-md z-50 flex justify-between items-center">
        <h2 className="text-2xl font-black text-star-wars-yellow uppercase tracking-tighter italic">PW // Rankings</h2>
        <Link href="/dashboard" className="text-[10px] text-slate-500 hover:text-white uppercase tracking-widest border border-white/10 px-4 py-2 hover:bg-white/5 transition-all">
          Return to Arena
        </Link>
      </header>

      <main className="max-w-4xl mx-auto pt-20 relative z-10">
        <div className="text-center mb-16 font-orbitron">
          <h1 className="text-5xl md:text-8xl font-black mb-4 uppercase tracking-tighter italic text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500">
            Galactic Hall
          </h1>
          <p className="text-slate-500 uppercase tracking-[0.5em] text-[10px]">The top 1% of prompt engineers</p>
        </div>

        <div className="bg-slate-900/30 border border-white/5 backdrop-blur-xl">
          {data.length === 0 ? (
            <div className="p-20 text-center text-slate-600 uppercase tracking-widest">No transmissions recorded yet.</div>
          ) : (
            <div className="divide-y divide-white/5">
              {data.map((entry: any, index: number) => (
                <div key={entry.id} className="flex items-center justify-between p-8 hover:bg-white/[0.02] transition-colors group">
                  <div className="flex items-center gap-8">
                    <span className={`text-3xl font-black italic ${index === 0 ? 'text-star-wars-yellow glow-text' : 'text-slate-700'}`}>
                      {index + 1 < 10 ? `0${index + 1}` : index + 1}
                    </span>
                    <div>
                      <h3 className="text-xl font-bold uppercase tracking-tight group-hover:text-neon-blue transition-colors">
                        {entry.user_name || `Contender #${entry.user_id}`}
                      </h3>
                      <span className="text-[10px] text-slate-600 uppercase tracking-widest mt-1 block">Level {Math.floor(entry.total_score / 10) + 1} Prompt Engineer</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-white">{entry.total_score}</span>
                    <span className="text-[10px] text-slate-600 uppercase block tracking-widest mt-1">Total Points</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

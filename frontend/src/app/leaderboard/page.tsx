'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Starfield from '@/components/Starfield';
import { API_BASE } from '@/lib/api';

export default function LeaderboardPage() {
  const [data, setData] = useState([]);
  const [round1, setRound1] = useState([]);
  const [round2, setRound2] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const [overallRes, r1Res, r2Res] = await Promise.all([
        axios.get(`${API_BASE}/leaderboard`),
        axios.get(`${API_BASE}/leaderboard/round/1`),
        axios.get(`${API_BASE}/leaderboard/round/2`)
      ]);
      setData(overallRes.data);
      setRound1(r1Res.data);
      setRound2(r2Res.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch leaderboard", error);
      setLoading(false);
    }
  };

  const openUserDetails = async (userId: number) => {
    setDetailLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/leaderboard/user/${userId}/details`);
      setSelectedUser(res.data);
    } catch (error) {
      console.error("Failed to fetch user details", error);
    } finally {
      setDetailLoading(false);
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
                <button
                  key={entry.user_id}
                  onClick={() => void openUserDetails(entry.user_id)}
                  className="w-full text-left flex items-center justify-between p-8 hover:bg-white/[0.02] transition-colors group"
                >
                  <div className="flex items-center gap-8">
                    <span className={`text-3xl font-black italic ${index === 0 ? 'text-star-wars-yellow glow-text' : 'text-slate-700'}`}>
                      {index + 1 < 10 ? `0${index + 1}` : index + 1}
                    </span>
                    <div>
                      <h3 className="text-xl font-bold uppercase tracking-tight group-hover:text-neon-blue transition-colors">
                        {entry.user?.name || `Contender #${entry.user_id}`}
                      </h3>
                      <span className="text-[10px] text-slate-600 uppercase tracking-widest mt-1 block">Level {Math.floor(entry.total_score / 10) + 1} Prompt Engineer</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-white">{entry.total_score}</span>
                    <span className="text-[10px] text-slate-600 uppercase block tracking-widest mt-1">Total Points</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-10 grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-slate-900/30 border border-white/5 p-6">
            <h3 className="text-sm uppercase tracking-widest text-neon-blue mb-4">Round 1 // Image Prompting</h3>
            {round1.length === 0 ? (
              <p className="text-[11px] uppercase tracking-widest text-slate-500">No evaluated round 1 entries.</p>
            ) : (
              <div className="space-y-3">
                {round1.map((item: any, idx: number) => (
                  <button
                    key={item.submission_id}
                    onClick={() => void openUserDetails(item.user_id)}
                    className="w-full text-left border border-white/10 bg-black/40 p-3 hover:bg-white/[0.03]"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase tracking-widest text-slate-400">#{idx + 1} {item.user_name}</span>
                      <span className="text-neon-blue text-sm font-bold">{Number(item.total_score).toFixed(2)}</span>
                    </div>
                    {item.image_url && (
                      <img src={item.image_url} alt="round1-entry" className="w-full h-44 object-cover border border-white/10 mb-2" />
                    )}
                    <p className="text-[11px] text-slate-300 line-clamp-3">{item.prompt_text}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-900/30 border border-white/5 p-6">
            <h3 className="text-sm uppercase tracking-widest text-neon-blue mb-4">Round 2 // Creative Text</h3>
            {round2.length === 0 ? (
              <p className="text-[11px] uppercase tracking-widest text-slate-500">No evaluated round 2 entries.</p>
            ) : (
              <div className="space-y-3">
                {round2.map((item: any, idx: number) => (
                  <button
                    key={item.submission_id}
                    onClick={() => void openUserDetails(item.user_id)}
                    className="w-full text-left border border-white/10 bg-black/40 p-3 hover:bg-white/[0.03]"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase tracking-widest text-slate-400">#{idx + 1} {item.user_name}</span>
                      <span className="text-neon-blue text-sm font-bold">{Number(item.total_score).toFixed(2)}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 line-clamp-2 mb-1">
                      <span className="text-slate-500">Prompt: </span>{item.prompt_text}
                    </p>
                    <p className="text-[11px] text-slate-400 line-clamp-3">{item.text_output}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {(detailLoading || selectedUser) && (
          <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm p-4 flex items-center justify-center">
            <div className="w-full max-w-4xl max-h-[85vh] overflow-y-auto border border-neon-blue/50 bg-slate-950 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg uppercase tracking-widest text-neon-blue">
                  {detailLoading ? 'Loading User Details...' : `${selectedUser?.user?.name || 'Participant'} // Details`}
                </h3>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-[10px] uppercase tracking-widest border border-white/20 px-3 py-2 hover:bg-white/5"
                >
                  Close
                </button>
              </div>

              {!detailLoading && selectedUser?.rounds?.length === 0 && (
                <p className="text-[11px] uppercase tracking-widest text-slate-500">No round 1/2 submissions found.</p>
              )}

              {!detailLoading && selectedUser?.rounds?.map((r: any) => (
                <div key={r.submission_id} className="mb-4 border border-white/10 bg-black/40 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] uppercase tracking-widest text-slate-400">Round {r.round_id} // {r.round_name}</span>
                    <span className="text-neon-blue font-bold">{r.total_score !== null ? Number(r.total_score).toFixed(2) : 'Pending'}</span>
                  </div>
                  {r.image_url && (
                    <img src={r.image_url} alt="user-round-artifact" className="w-full h-56 object-cover border border-white/10 mb-3" />
                  )}
                  <p className="text-[11px] text-slate-300 mb-2">
                    <span className="text-slate-500">Prompt: </span>{r.prompt_text || '-'}
                  </p>
                  {r.text_output && (
                    <p className="text-[11px] text-slate-400 whitespace-pre-wrap">{r.text_output}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

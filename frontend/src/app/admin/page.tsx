'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

interface Round {
  id: number;
  name: string;
  is_active: boolean;
  is_locked: boolean;
}

interface Submission {
  id: number;
  user_id: string;
  round_id: number;
  is_evaluated: boolean;
  created_at: string;
  round1_data?: any;
  round2_data?: any;
}

export default function AdminPage() {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'rounds' | 'submissions'>('rounds');
  const [evaluating, setEvaluating] = useState(false);
  const [adminKey, setAdminKey] = useState('');

  const axiosConfig = {
    headers: { 'X-Admin-Token': adminKey }
  };

  useEffect(() => {
    if (adminKey) fetchInitialData();
    else setLoading(false);
  }, [adminKey]);

  const fetchInitialData = async () => {
    try {
      const [roundsRes, subsRes] = await Promise.all([
        axios.get(`${API_BASE}/rounds`),
        axios.get(`${API_BASE}/admin/submissions`, axiosConfig)
      ]);
      setRounds(roundsRes.data);
      setSubmissions(subsRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch initial data", error);
      setLoading(false);
    }
  };

  const activateRound = async (id: number) => {
    try {
      await axios.patch(`${API_BASE}/admin/round/${id}/activate`, {}, axiosConfig);
      fetchInitialData();
    } catch (error) {
      alert("Failed to activate round or Invalid Credentials");
    }
  };

  const evaluateAll = async (roundId: number) => {
    setEvaluating(true);
    try {
      await axios.post(`${API_BASE}/admin/evaluate-round/${roundId}`, {}, axiosConfig);
      alert("Evaluation cycle complete!");
      fetchInitialData();
    } catch (error) {
      alert("Bulk evaluation failed or Invalid Credentials");
    } finally {
      setEvaluating(false);
    }
  };

  const seedRounds = async () => {
    try {
      await axios.post(`${API_BASE}/admin/seed-rounds`, {}, axiosConfig);
      fetchInitialData();
    } catch (error) {
      alert("Seed failed or Invalid Credentials");
    }
  };

  if (!adminKey) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black p-6">
        <div className="starfield" />
        <div className="w-full max-w-md bg-slate-900/50 border border-neon-blue/30 p-12 text-center relative z-10 backdrop-blur-xl">
          <h2 className="text-star-wars-yellow text-2xl font-black uppercase tracking-tighter mb-8 italic">Authorization Required</h2>
          <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] mb-12">Enter Galactic Admin Key to proceed</p>
          <input 
            type="password"
            placeholder="ACCESS_KEY_SECRET"
            className="w-full bg-black border border-white/10 p-4 text-center text-neon-blue outline-none focus:border-neon-blue/50 mb-8 font-mono"
            onKeyDown={(e) => {
              if (e.key === 'Enter') setAdminKey((e.target as HTMLInputElement).value);
            }}
          />
          <button 
            className="w-full py-4 bg-neon-blue text-black font-black uppercase text-xs tracking-widest hover:brightness-110"
            onClick={(e) => {
              const input = (e.currentTarget.previousSibling as HTMLInputElement);
              setAdminKey(input.value);
            }}
          >
            Authenticate Mission
          </button>
        </div>
      </div>
    );
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-star-wars-yellow uppercase tracking-widest bg-black">Initializing Galactic Command...</div>;

  return (
    <div className="min-h-screen p-12 bg-black text-white font-mono overflow-x-hidden relative">
      <div className="starfield" />
      
      <header className="mb-12 border-b border-white/10 pb-6">
        <h1 className="text-4xl font-black text-neon-blue uppercase tracking-tighter">Admin // Command Center</h1>
        <div className="mt-6 flex gap-8">
          <button 
            onClick={() => setActiveTab('rounds')}
            className={`text-xs uppercase tracking-widest border-b-2 py-2 transition-all ${activeTab === 'rounds' ? 'border-neon-blue text-white' : 'border-transparent text-slate-500'}`}
          >
            01. Rounds
          </button>
          <button 
            onClick={() => setActiveTab('submissions')}
            className={`text-xs uppercase tracking-widest border-b-2 py-2 transition-all ${activeTab === 'submissions' ? 'border-neon-blue text-white' : 'border-transparent text-slate-500'}`}
          >
            02. Submissions
          </button>
        </div>
      </header>

      <section className="max-w-6xl mx-auto relative z-10">
        {activeTab === 'rounds' ? (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-slate-900/50 border border-white/10 p-8">
              <h2 className="text-xl font-bold mb-6 flex justify-between items-center">
                <span>Contest Lifecycle</span>
                <button onClick={seedRounds} className="text-[10px] bg-white/5 border border-white/10 px-3 py-1 hover:bg-white/10 uppercase tracking-widest">
                  Reset System
                </button>
              </h2>
              <div className="grid gap-4">
                {rounds.map((round) => (
                  <div key={round.id} className="flex items-center justify-between p-6 bg-black/60 border border-white/5 glow-border">
                    <div className="flex items-center gap-6">
                      <span className="text-2xl font-black text-slate-700">0{round.id}</span>
                      <div>
                        <span className="font-bold uppercase tracking-tight text-white">{round.name}</span>
                        <div className="flex gap-2 mt-1">
                          {round.is_active && <span className="text-[9px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded border border-green-500/30 uppercase tracking-widest">Active</span>}
                          {round.is_locked && <span className="text-[9px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded border border-red-500/30 uppercase tracking-widest">Locked</span>}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => activateRound(round.id)}
                      disabled={round.is_active}
                      className={`px-8 py-3 font-bold uppercase text-[11px] tracking-widest ${round.is_active ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-neon-blue text-black hover:scale-105 active:scale-95 transition-all'}`}
                    >
                      {round.is_active ? 'Currently Live' : 'Go Live'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in slide-in-from-right-10 duration-500">
            <div className="bg-slate-900/50 border border-white/10 p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold uppercase tracking-tighter text-white">Transmission History</h2>
                <div className="flex gap-4">
                  {[1, 2].map(rid => (
                    <button 
                      key={rid}
                      onClick={() => evaluateAll(rid)}
                      disabled={evaluating}
                      className="px-4 py-2 border border-neon-blue/40 text-neon-blue text-[10px] uppercase font-bold tracking-widest hover:bg-neon-blue/10 disabled:opacity-50"
                    >
                      {evaluating ? 'Proccessing...' : `Evaluate Round 0${rid}`}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="min-w-[800px] px-4 sm:px-0">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-[10px] text-slate-500 uppercase tracking-widest">
                        <th className="py-4 px-4 font-normal">ID</th>
                        <th className="py-4 px-4 font-normal">Round</th>
                        <th className="py-4 px-4 font-normal">Content Snippet</th>
                        <th className="py-4 px-4 font-normal">Status</th>
                        <th className="py-4 px-4 font-normal">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs text-white">
                      {submissions.map((sub) => (
                        <tr key={sub.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                          <td className="py-4 px-4 font-mono text-slate-400">#{sub.id}</td>
                          <td className="py-4 px-4 font-bold uppercase tracking-tight">Round {sub.round_id}</td>
                          <td className="py-4 px-4 text-slate-400">
                            {sub.round_id === 1 ? 'Media Asset Linked' : sub.round2_data?.text_output?.substring(0, 30) + '...'}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-1 rounded-[2px] font-black uppercase tracking-tighter text-[10px] ${sub.is_evaluated ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                              {sub.is_evaluated ? '1 / 1 Evaluated' : '0 / 1 Pending'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-slate-500 text-[10px]">
                            {new Date(sub.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="p-6 bg-slate-900/50 border border-white/10">
            <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-4 tracking-[0.2em]">Total Traffic</h3>
            <span className="text-4xl font-black">{submissions.length}</span>
          </div>
          <div className="p-6 bg-slate-900/50 border border-white/10">
            <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-4 tracking-[0.2em]">Evaluated</h3>
            <span className="text-4xl font-black text-green-400">
              {submissions.filter(s => s.is_evaluated).length}
            </span>
          </div>
          <div className="p-6 bg-slate-900/50 border border-white/10 hidden lg:block">
            <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-4 tracking-[0.2em]">API Status</h3>
            <span className="text-4xl font-black text-neon-blue">Active</span>
          </div>
        </div>
      </section>
    </div>
  );
}

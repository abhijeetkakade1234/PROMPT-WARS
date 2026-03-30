'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Starfield from '@/components/Starfield';
import { API_BASE } from '@/lib/api';
import { useSnackbar } from '@/components/SnackbarProvider';

interface Round {
  id: number;
  name: string;
  is_active: boolean;
  is_locked: boolean;
}

interface Submission {
  id: number;
  user_id: string;
  user?: {
    name: string;
  };
  round_id: number;
  is_evaluated: boolean;
  created_at: string;
  round1_data?: any;
  round2_data?: any;
  round3_data?: any;
  scores?: Array<{ total_score: number }>;
}

export default function AdminPage() {
  const { showSnackbar } = useSnackbar();
  const [rounds, setRounds] = useState<Round[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'rounds' | 'submissions'>('rounds');
  const [evaluating, setEvaluating] = useState(false);
  const [adminInput, setAdminInput] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [roundsError, setRoundsError] = useState<string | null>(null);
  const [submissionFilter, setSubmissionFilter] = useState<'all' | '1' | '2' | '3'>('all');

  const axiosConfig = {
    headers: { 'X-Admin-Token': adminKey }
  };
  const filteredSubmissions = submissions.filter((s) => {
    if (submissionFilter === 'all') return true;
    return String(s.round_id) === submissionFilter;
  });

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    fetchInitialData();
  }, [isAuthenticated]);

  const logout = (message?: string) => {
    setIsAuthenticated(false);
    setAdminKey('');
    setAdminInput('');
    setSubmissions([]);
    setRounds([]);
    setLoading(false);
    if (message) {
      setAuthError(message);
      showSnackbar({ message, variant: 'error' });
    }
  };

  const authenticateAdmin = async () => {
    const token = adminInput.trim();
    if (!token) {
      setAuthError('Admin key is required.');
      showSnackbar({ message: 'Admin key is required.', variant: 'error' });
      return;
    }

    setLoading(true);
    setAuthError(null);
    try {
      await axios.get(`${API_BASE}/admin/submissions`, {
        headers: { 'X-Admin-Token': token }
      });
      setAdminKey(token);
      setIsAuthenticated(true);
      showSnackbar({ message: 'Admin authenticated.', variant: 'success' });
    } catch (error: any) {
      setLoading(false);
      if (error?.response?.status === 401) {
        setAuthError('Invalid admin key.');
        showSnackbar({ message: 'Invalid admin key.', variant: 'error' });
        return;
      }
      setAuthError('Authentication failed. Backend may be offline.');
      showSnackbar({ message: 'Authentication failed. Backend may be offline.', variant: 'error' });
    }
  };

  const fetchInitialData = async () => {
    try {
      setAuthError(null);
      setRoundsError(null);
      const roundsRes = await axios.get(`${API_BASE}/rounds`);
      setRounds(roundsRes.data);

      const subsRes = await axios.get(`${API_BASE}/admin/submissions`, axiosConfig);
      setSubmissions(subsRes.data);
      setLoading(false);
    } catch (error: any) {
      console.error("Failed to fetch initial data", error);
      if (error?.response?.status === 401) {
        logout('Session expired. Please re-authenticate.');
        return;
      }
      setLoading(false);
    }
  };

  const activateRound = async (id: number) => {
    try {
      await axios.patch(`${API_BASE}/admin/round/${id}/activate`, {}, axiosConfig);
      showSnackbar({ message: `Round ${id} activated.`, variant: 'success' });
      fetchInitialData();
    } catch (error) {
      showSnackbar({ message: "Failed to activate round or invalid credentials.", variant: 'error' });
    }
  };

  const unlockRound = async (id: number) => {
    try {
      await axios.patch(`${API_BASE}/admin/round/${id}/unlock`, {}, axiosConfig);
      showSnackbar({ message: `Round ${id} unlocked. Other rounds locked.`, variant: 'success' });
      fetchInitialData();
    } catch (error) {
      showSnackbar({ message: "Failed to unlock round or invalid credentials.", variant: 'error' });
    }
  };

  const deactivateRound = async (id: number) => {
    try {
      await axios.patch(`${API_BASE}/admin/round/${id}/deactivate`, {}, axiosConfig);
      showSnackbar({ message: `Round ${id} deactivated.`, variant: 'info' });
      fetchInitialData();
    } catch (error) {
      showSnackbar({ message: "Failed to deactivate round or invalid credentials.", variant: 'error' });
    }
  };

  const evaluateAll = async (roundId: number) => {
    setEvaluating(true);
    try {
      const res = await axios.post(`${API_BASE}/admin/evaluate-round/${roundId}`, {}, axiosConfig);
      const processed = res?.data?.processed_count ?? 0;
      const failed = res?.data?.failed_count ?? 0;
      const firstFailure = res?.data?.failed?.[0]?.reason;
      const suffix = failed && firstFailure ? ` First error: ${firstFailure}` : '';
      showSnackbar({ message: `Round ${roundId} done: ${processed} processed, ${failed} failed.${suffix}`, variant: failed ? 'info' : 'success' });
      fetchInitialData();
    } catch (error) {
      showSnackbar({ message: "Bulk evaluation failed or invalid credentials.", variant: 'error' });
    } finally {
      setEvaluating(false);
    }
  };

  const seedRounds = async () => {
    try {
      setRoundsError(null);
      await axios.post(`${API_BASE}/admin/seed-rounds`, {}, axiosConfig);
      showSnackbar({ message: "Rounds seeded successfully.", variant: 'success' });
      fetchInitialData();
    } catch (error) {
      setRoundsError("Could not seed rounds. Check admin key and backend status.");
      showSnackbar({ message: "Seed failed or invalid credentials.", variant: 'error' });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-transparent p-6 relative overflow-hidden">
        <Starfield />
        <div className="w-full max-w-md bg-slate-900/50 border border-neon-blue/30 p-12 text-center relative z-10 backdrop-blur-xl">
          <h2 className="text-star-wars-yellow text-2xl font-black uppercase tracking-tighter mb-8 italic">Authorization Required</h2>
          <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] mb-12">Enter Galactic Admin Key to proceed</p>
          {authError && (
            <p className="mb-4 border border-red-500/40 bg-red-500/10 px-3 py-2 text-[10px] uppercase tracking-widest text-red-300">
              {authError}
            </p>
          )}
          <input 
            type="password"
            placeholder="ACCESS_KEY_SECRET"
            value={adminInput}
            onChange={(e) => setAdminInput(e.target.value)}
            className="w-full bg-black border border-white/10 p-4 text-center text-neon-blue outline-none focus:border-neon-blue/50 mb-8 font-mono"
            onKeyDown={(e) => {
              if (e.key === 'Enter') void authenticateAdmin();
            }}
          />
          <button 
            className="w-full py-4 bg-neon-blue text-black font-black uppercase text-xs tracking-widest hover:brightness-110"
            onClick={() => void authenticateAdmin()}
          >
            Authenticate Mission
          </button>
        </div>
      </div>
    );
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-star-wars-yellow uppercase tracking-widest bg-black">Initializing Galactic Command...</div>;

  return (
    <div className="min-h-screen p-12 text-white font-mono overflow-x-hidden relative">
      <Starfield />
      
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
        {authError && (
          <div className="mb-6 border border-red-500/40 bg-red-500/10 px-4 py-3 text-[11px] uppercase tracking-widest text-red-300">
            {authError}
          </div>
        )}
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
                {rounds.length === 0 && (
                  <div className="border border-yellow-500/40 bg-yellow-500/10 px-4 py-3 text-[11px] uppercase tracking-widest text-yellow-200">
                    No rounds found. Click <span className="font-bold">Reset System</span> to seed default rounds (R1 active/unlocked).
                  </div>
                )}
                {roundsError && (
                  <div className="border border-red-500/40 bg-red-500/10 px-4 py-3 text-[11px] uppercase tracking-widest text-red-300">
                    {roundsError}
                  </div>
                )}
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
                    <div className="flex gap-2">
                      <button
                        onClick={() => unlockRound(round.id)}
                        disabled={!round.is_locked}
                        className={`px-3 py-2 font-bold uppercase text-[10px] tracking-widest border ${round.is_locked ? 'border-yellow-400/50 text-yellow-300 hover:bg-yellow-400/10' : 'border-slate-700 text-slate-500 cursor-not-allowed'}`}
                      >
                        {round.is_locked ? 'Unlock' : 'Unlocked'}
                      </button>
                      <button 
                        onClick={() => activateRound(round.id)}
                        disabled={round.is_active}
                        className={`px-4 py-2 font-bold uppercase text-[10px] tracking-widest ${round.is_active ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-neon-blue text-black hover:scale-105 active:scale-95 transition-all'}`}
                      >
                        {round.is_active ? 'Live' : 'Activate'}
                      </button>
                      <button
                        onClick={() => deactivateRound(round.id)}
                        disabled={!round.is_active && round.is_locked}
                        className={`px-3 py-2 font-bold uppercase text-[10px] tracking-widest border ${(!round.is_active && round.is_locked) ? 'border-slate-700 text-slate-500 cursor-not-allowed' : 'border-red-500/50 text-red-300 hover:bg-red-500/10'}`}
                      >
                        Deactivate
                      </button>
                    </div>
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
                  {[1, 2, 3].map(rid => (
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
              <div className="mb-6 flex gap-2">
                {[
                  { key: 'all', label: 'All' },
                  { key: '1', label: 'Round 1' },
                  { key: '2', label: 'Round 2' },
                  { key: '3', label: 'Round 3' }
                ].map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setSubmissionFilter(opt.key as 'all' | '1' | '2' | '3')}
                    className={`px-3 py-1 text-[10px] uppercase tracking-widest border ${submissionFilter === opt.key ? 'border-neon-blue text-neon-blue bg-neon-blue/10' : 'border-white/20 text-slate-400 hover:bg-white/5'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="min-w-[800px] px-4 sm:px-0">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-[10px] text-slate-500 uppercase tracking-widest">
                        <th className="py-4 px-4 font-normal">Submission ID</th>
                        <th className="py-4 px-4 font-normal">Participant ID</th>
                        <th className="py-4 px-4 font-normal">Round</th>
                        <th className="py-4 px-4 font-normal">Prompt + Artifact</th>
                        <th className="py-4 px-4 font-normal">Status</th>
                        <th className="py-4 px-4 font-normal">Score</th>
                        <th className="py-4 px-4 font-normal">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs text-white">
                      {filteredSubmissions.map((sub) => (
                        <tr key={sub.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                          <td className="py-4 px-4 font-mono text-slate-400">#{sub.id}</td>
                          <td className="py-4 px-4 font-mono text-star-wars-yellow">{sub.user?.name || '-'}</td>
                          <td className="py-4 px-4 font-bold uppercase tracking-tight">Round {sub.round_id}</td>
                          <td className="py-4 px-4 text-slate-300">
                            {sub.round_id === 1 ? (
                              <div className="flex items-center gap-3">
                                {sub.round1_data?.image_url ? (
                                  <img src={sub.round1_data.image_url} alt="round1" className="h-10 w-10 rounded border border-white/10 object-cover" />
                                ) : (
                                  <div className="h-10 w-10 rounded border border-white/10 bg-black/50" />
                                )}
                                <div className="max-w-[260px]">
                                  <p className="text-[11px] text-slate-200 line-clamp-2">{sub.round1_data?.prompt_text || '-'}</p>
                                </div>
                              </div>
                            ) : sub.round_id === 2 ? (
                              <div className="max-w-[280px]">
                                <p className="text-[11px] text-slate-200 line-clamp-2">{sub.round2_data?.prompt_text || '-'}</p>
                                <p className="text-[10px] text-slate-500 line-clamp-1 mt-1">{sub.round2_data?.text_output || '-'}</p>
                              </div>
                            ) : (
                              <div className="max-w-[280px]">
                                <p className="text-[11px] text-slate-200 line-clamp-2">{sub.round3_data?.prompt_1 || '-'}</p>
                                <p className="text-[10px] text-slate-500 line-clamp-1 mt-1">{sub.round3_data?.prompt_2 || '-'}</p>
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-1 rounded-[2px] font-black uppercase tracking-tighter text-[10px] ${sub.is_evaluated ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                              {sub.is_evaluated ? '1 / 1 Evaluated' : '0 / 1 Pending'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-neon-blue font-bold">
                            {sub.scores?.[0]?.total_score?.toFixed ? sub.scores[0].total_score.toFixed(2) : '-'}
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

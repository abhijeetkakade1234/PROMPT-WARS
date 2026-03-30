'use client';
// Force reload for Arena

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RoundCard from '@/components/RoundCard';
import SubmissionModal from '@/components/SubmissionModal';
import Starfield from '@/components/Starfield';
import { API_BASE } from '@/lib/api';
import { isRoundBlockedForBrowser, markRoundSubmittedForBrowser } from '@/lib/browserRoundGate';
import { useSnackbar } from '@/components/SnackbarProvider';

interface UiRound {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'locked';
}

interface ParticipantResult {
  submission_id: number;
  round_id: number;
  round_name: string;
  is_evaluated: boolean;
  total_score: number | null;
}

export default function DashboardPage() {
  const { showSnackbar } = useSnackbar();
  const [rounds, setRounds] = useState<UiRound[]>([]);
  const [selectedRound, setSelectedRound] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [participantId, setParticipantId] = useState('');
  const [results, setResults] = useState<ParticipantResult[]>([]);
  const [resultsLoading, setResultsLoading] = useState(false);

  useEffect(() => {
    fetchRounds();
    const cachedId = typeof window !== 'undefined' ? window.localStorage.getItem('promptWarsParticipantId') : null;
    if (cachedId) {
      setParticipantId(cachedId);
      void fetchResults(cachedId);
    }
  }, []);

  const fetchRounds = async () => {
    try {
      setErrorMessage(null);
      const res = await axios.get(`${API_BASE}/rounds`);
      const mappedRounds = res.data
        // Keep round 3 hidden while locked; reveal once admin unlocks/activates it.
        .filter((r: any) => r.id !== 3 || !r.is_locked)
        .map((r: any) => ({
          id: r.id,
          name: r.name,
          description: r.description,
          status: r.is_active ? 'active' : 'locked'
        }));
      setRounds(mappedRounds);
      setLoading(false);
    } catch (error: any) {
      console.error("Failed to fetch rounds", error);
      const apiError = error?.response?.data?.error;
      setErrorMessage(apiError || 'Unable to load rounds right now. Please try again shortly.');
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    if (!selectedRound) return;
    if (isRoundBlockedForBrowser(selectedRound)) {
      showSnackbar({ message: "This browser already submitted for this round.", variant: 'error' });
      setSelectedRound(null);
      return;
    }

    try {
      const endpoint = `${API_BASE}/submit/round${selectedRound}`;

      if (selectedRound === 1) {
        if (!data.file) {
          showSnackbar({ message: "Image file is required for Round 1.", variant: 'error' });
          return;
        }
        if (!data.userId?.trim()) {
          showSnackbar({ message: "Participant ID is required.", variant: 'error' });
          return;
        }
        const formData = new FormData();
        formData.append('user_id', data.userId);
        formData.append('prompt_text', data.prompt);
        formData.append('image', data.file);
        await axios.post(endpoint, formData);
      } else if (selectedRound === 2) {
        if (!data.userId?.trim()) {
          showSnackbar({ message: "Participant ID is required.", variant: 'error' });
          return;
        }
        await axios.post(endpoint, {
          user_id: data.userId,
          prompt_text: data.prompt,
          text_output: data.content
        });
      } else {
        if (!data.userId?.trim()) {
          showSnackbar({ message: "Participant ID is required.", variant: 'error' });
          return;
        }
        await axios.post(endpoint, {
          user_id: data.userId,
          prompt_1: data.prompt1,
          prompt_2: data.prompt2
        });
      }

      showSnackbar({ message: "Submission transmitted successfully.", variant: 'success' });
      markRoundSubmittedForBrowser(selectedRound);
      setParticipantId(data.userId);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('promptWarsParticipantId', data.userId);
      }
      void fetchResults(data.userId);
      setSelectedRound(null);
    } catch (error: any) {
      const apiError = error?.response?.data?.error;
      const message = typeof apiError === 'string' ? apiError : "Transmission Error. Check console.";
      showSnackbar({ message, variant: 'error' });
      console.error(error);
    }
  };

  const fetchResults = async (id: string) => {
    const trimmed = id.trim();
    if (!trimmed) return;
    setResultsLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/results/${encodeURIComponent(trimmed)}`);
      setResults(res.data?.submissions || []);
    } catch (error) {
      setResults([]);
      showSnackbar({ message: "Failed to fetch participant results.", variant: 'error' });
    } finally {
      setResultsLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-neon-blue uppercase tracking-widest animate-pulse">Initializing Arena...</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <Starfield />
      
      <main className="w-full max-w-6xl mx-auto py-12 relative z-10">
        {errorMessage ? (
          <div className="mx-auto max-w-2xl border border-red-500/40 bg-red-500/10 px-6 py-5 text-center">
            <p className="text-sm uppercase tracking-widest text-red-300">{errorMessage}</p>
          </div>
        ) : rounds.length === 0 ? (
          <div className="mx-auto max-w-2xl border border-white/20 bg-white/5 px-6 py-5 text-center">
            <p className="text-sm uppercase tracking-widest text-slate-300">No active rounds yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center justify-center">
            {rounds.map((round) => (
              <RoundCard 
                key={round.id} 
                round={round} 
                onEnter={() => {
                  if (round.status !== 'active') return;
                  if (isRoundBlockedForBrowser(round.id)) {
                    showSnackbar({ message: "This browser already submitted for this round.", variant: 'error' });
                    return;
                  }
                  setSelectedRound(round.id);
                }}
              />
            ))}
          </div>
        )}
      </main>

      <section className="w-full max-w-6xl mx-auto mt-6 relative z-10">
        <div className="border border-white/10 bg-white/5 p-6">
          <h3 className="text-sm uppercase tracking-widest text-neon-blue mb-4">Result Tracker</h3>
          <div className="flex flex-col md:flex-row gap-3">
            <input
              value={participantId}
              onChange={(e) => setParticipantId(e.target.value)}
              placeholder="Enter participant ID (e.g. TG-194)"
              className="flex-1 p-3 bg-black border border-white/10 text-sm text-white outline-none focus:border-neon-blue/50"
            />
            <button
              onClick={() => void fetchResults(participantId)}
              className="px-6 py-3 bg-neon-blue text-black text-xs font-bold uppercase tracking-widest hover:brightness-110"
            >
              {resultsLoading ? 'Checking...' : 'Check Results'}
            </button>
          </div>
          <div className="mt-4 space-y-2">
            {results.length === 0 ? (
              <p className="text-[11px] uppercase tracking-widest text-slate-400">No evaluated submissions found yet.</p>
            ) : (
              results.map((item) => (
                <div key={item.submission_id} className="flex items-center justify-between border border-white/10 bg-black/40 px-4 py-3 text-xs">
                  <span className="uppercase tracking-widest text-slate-300">
                    Round {item.round_id} // {item.round_name}
                  </span>
                  <span className={item.is_evaluated ? 'text-green-300 font-bold' : 'text-yellow-300 font-bold'}>
                    {item.is_evaluated ? `Evaluated (${item.total_score ?? '-'} pts)` : 'Pending'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {selectedRound && (
        <SubmissionModal 
          roundId={selectedRound} 
          onClose={() => setSelectedRound(null)} 
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

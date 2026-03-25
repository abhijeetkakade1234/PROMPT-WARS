'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RoundCard from '@/components/RoundCard';
import SubmissionModal from '@/components/SubmissionModal';
import Link from 'next/link';

const API_BASE = 'http://localhost:5000/api';

export default function DashboardPage() {
  const [rounds, setRounds] = useState([]);
  const [selectedRound, setSelectedRound] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRounds();
  }, []);

  const fetchRounds = async () => {
    try {
      const res = await axios.get(`${API_BASE}/rounds`);
      // Map database status to UI status
      const mappedRounds = res.data.map((r: any) => ({
        ...r,
        status: r.is_active ? 'active' : (r.is_locked ? 'locked' : 'hidden')
      }));
      setRounds(mappedRounds);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch rounds", error);
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      const endpoint = `${API_BASE}/submit/round${selectedRound}`;
      const payload = { ...data, user_id: 1 }; // Mock user ID

      if (selectedRound === 1) {
        const formData = new FormData();
        formData.append('user_id', '1');
        formData.append('prompt_text', data.prompt);
        formData.append('image', data.file);
        await axios.post(endpoint, formData);
      } else {
        await axios.post(endpoint, payload);
      }

      alert("Submission Transmitted Successfully!");
      setSelectedRound(null);
    } catch (error) {
      alert("Transmission Error. Check console.");
      console.error(error);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-neon-blue uppercase tracking-widest animate-pulse">Initializing Arena...</div>;

  return (
    <div className="min-h-screen p-8 pt-24 bg-[#020617]">
      <div className="starfield" />
      
      <header className="fixed top-0 left-0 w-full p-6 border-b border-white/10 bg-black/50 backdrop-blur-md z-50 flex justify-between items-center">
        <h2 className="text-2xl font-black text-star-wars-yellow uppercase tracking-tighter">PW // Arena</h2>
        <div className="px-4 py-1 border border-neon-blue text-neon-blue text-xs uppercase font-bold tracking-widest">
          Live Competition
        </div>
      </header>

      <main className="max-w-6xl mx-auto py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {rounds.map((round: any) => (
            <RoundCard 
              key={round.id} 
              round={round} 
              onEnter={() => setSelectedRound(round.id)}
            />
          ))}
        </div>
      </main>

      {selectedRound && (
        <SubmissionModal 
          roundId={selectedRound} 
          onClose={() => setSelectedRound(null)} 
          onSubmit={handleSubmit}
        />
      )}

      {/* Leaderboard Trigger */}
      <div className="fixed bottom-8 right-8 z-50">
        <Link href="/leaderboard" className="px-6 py-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors flex items-center gap-3 backdrop-blur-md">
          <span className="w-2 h-2 bg-neon-purple rounded-full animate-ping" />
          <span className="text-xs font-bold uppercase tracking-widest">Hall of Rankings</span>
        </Link>
      </div>
    </div>
  );
}

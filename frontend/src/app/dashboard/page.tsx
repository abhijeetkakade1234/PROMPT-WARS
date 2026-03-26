'use client';
// Force reload for Arena

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RoundCard from '@/components/RoundCard';
import SubmissionModal from '@/components/SubmissionModal';
import Starfield from '@/components/Starfield';

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
      // Filter only active rounds for the user view
      const mappedRounds = res.data
        .filter((r: any) => r.is_active)
        .map((r: any) => ({
          ...r,
          status: 'active'
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
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <Starfield />
      
      <main className="w-full max-w-6xl mx-auto py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center justify-center">
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
    </div>
  );
}

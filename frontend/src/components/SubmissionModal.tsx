'use client';

import React, { useState } from 'react';

interface SubmissionModalProps {
  roundId: number;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function SubmissionModal({ roundId, onClose, onSubmit }: SubmissionModalProps) {
  const MAX_TEXT_CHARS = 1000;
  const MIN_PROMPT_WORDS = 3;
  const MIN_STORY_WORDS = 20;

  const [userId, setUserId] = useState('');
  const [prompt, setPrompt] = useState('');
  const [prompt2, setPrompt2] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const wordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;
  const isUserIdValid = /^[A-Za-z0-9-]{2,64}$/.test(userId.trim());
  const isPromptValid = wordCount(prompt) >= MIN_PROMPT_WORDS && prompt.length <= MAX_TEXT_CHARS;
  const isPrompt2Valid = wordCount(prompt2) >= MIN_PROMPT_WORDS && prompt2.length <= MAX_TEXT_CHARS;
  const isStoryValid = wordCount(content) >= MIN_STORY_WORDS && content.length <= MAX_TEXT_CHARS;

  const canSubmitRound1 = isUserIdValid && !!file && isPromptValid;
  const canSubmitRound2 = isUserIdValid && isPromptValid && isStoryValid;
  const canSubmitRound3 = isUserIdValid && isPromptValid && isPrompt2Valid;
  const canSubmit = roundId === 1 ? canSubmitRound1 : roundId === 2 ? canSubmitRound2 : canSubmitRound3;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    if (roundId === 1) onSubmit({ userId, prompt, file });
    if (roundId === 2) onSubmit({ userId, prompt, content });
    if (roundId === 3) onSubmit({ userId, prompt1: prompt, prompt2: prompt2 });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-neon-blue/50 p-6 md:p-8 relative my-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white uppercase text-[10px] tracking-widest">
          [ Close ]
        </button>

        <header className="mb-8 font-sf-distant">
          <span className="text-[10px] text-neon-blue uppercase tracking-[0.4em] font-black">Submission Protocol</span>
          <h2 className="text-3xl font-black text-white uppercase mt-2 tracking-tighter">Round 0{roundId}</h2>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-2">Participant ID</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full p-4 bg-black text-xs border border-white/10 text-white outline-none focus:border-neon-blue/50"
              placeholder="Enter your participant ID (e.g. TG-194)"
            />
            <p className="mt-2 text-[10px] uppercase tracking-widest text-slate-500">
              Format: letters, numbers, hyphen (2-64 chars)
            </p>
          </div>

          {/* Round 1: Image + Prompt */}
          {roundId === 1 && (
            <>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-2">Upload Generated Image</label>
                <input 
                  type="file" 
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full p-4 bg-black text-xs border border-white/10 text-slate-400 file:bg-neon-blue file:border-none file:text-[10px] file:uppercase file:font-bold file:px-4 file:py-2 file:mr-4"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-2">Primary Prompt</label>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  maxLength={MAX_TEXT_CHARS}
                  className="w-full p-4 bg-black text-xs border border-white/10 text-white min-h-[100px] outline-none focus:border-neon-blue/50"
                  placeholder="Enter the prompt used to generate this image..."
                />
                <p className="mt-2 text-[10px] uppercase tracking-widest text-slate-500">
                  {wordCount(prompt)} words • {prompt.length}/{MAX_TEXT_CHARS} chars (min {MIN_PROMPT_WORDS} words)
                </p>
              </div>
            </>
          )}

          {/* Round 2: Story + Prompt */}
          {roundId === 2 && (
            <>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-2">Core Prompt</label>
                <input 
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  maxLength={MAX_TEXT_CHARS}
                  className="w-full p-4 bg-black text-xs border border-white/10 text-white outline-none focus:border-neon-purple/50"
                  placeholder="The spark for your creation..."
                />
                <p className="mt-2 text-[10px] uppercase tracking-widest text-slate-500">
                  {wordCount(prompt)} words • {prompt.length}/{MAX_TEXT_CHARS} chars (min {MIN_PROMPT_WORDS} words)
                </p>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-2">Generated Story</label>
                <textarea 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  maxLength={MAX_TEXT_CHARS}
                  className="w-full p-4 bg-black text-xs border border-white/10 text-white min-h-[150px] outline-none focus:border-neon-purple/50"
                  placeholder="The AI's masterpiece..."
                />
                <p className="mt-2 text-[10px] uppercase tracking-widest text-slate-500">
                  {wordCount(content)} words • {content.length}/{MAX_TEXT_CHARS} chars (min {MIN_STORY_WORDS} words)
                </p>
              </div>
            </>
          )}

          {/* Round 3: Two Prompts */}
          {roundId === 3 && (
            <>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-2">Technical Prompt 01</label>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  maxLength={MAX_TEXT_CHARS}
                  className="w-full p-4 bg-black text-xs border border-white/10 text-white min-h-[80px] outline-none"
                  placeholder="Explain your approach..."
                />
                <p className="mt-2 text-[10px] uppercase tracking-widest text-slate-500">
                  {wordCount(prompt)} words • {prompt.length}/{MAX_TEXT_CHARS} chars (min {MIN_PROMPT_WORDS} words)
                </p>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-2">Technical Prompt 02</label>
                <textarea 
                  value={prompt2}
                  onChange={(e) => setPrompt2(e.target.value)}
                  maxLength={MAX_TEXT_CHARS}
                  className="w-full p-4 bg-black text-xs border border-white/10 text-white min-h-[80px] outline-none"
                  placeholder="The refinement..."
                />
                <p className="mt-2 text-[10px] uppercase tracking-widest text-slate-500">
                  {wordCount(prompt2)} words • {prompt2.length}/{MAX_TEXT_CHARS} chars (min {MIN_PROMPT_WORDS} words)
                </p>
              </div>
              <p className="text-[10px] text-star-wars-yellow/60 uppercase tracking-widest bg-yellow-400/5 p-3 leading-relaxed">
                Notice: Round 3 requires a live demonstration. These prompts will be used for architectural evaluation.
              </p>
            </>
          )}

          <button 
            type="submit"
            disabled={!canSubmit}
            className={`w-full py-4 font-black uppercase text-xs tracking-[0.2em] transition-colors ${canSubmit ? 'bg-white text-black hover:bg-neon-blue' : 'bg-slate-700 text-slate-400 cursor-not-allowed'}`}
          >
            Transmit Submission
          </button>
        </form>
      </div>
    </div>
  );
}

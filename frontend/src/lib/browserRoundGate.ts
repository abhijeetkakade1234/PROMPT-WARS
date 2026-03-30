'use client';

type BitFlag = '0' | '1';
type GateState = Record<string, BitFlag>;

const STORAGE_KEY = '__pw_cfg';
const ROUND_SLOT: Record<number, string> = {
  1: 'a7',
  2: 'c2',
  3: 'f9',
};

const getSlot = (roundId: number) => ROUND_SLOT[roundId] ?? `x${roundId.toString(36)}`;

const readState = (): GateState => {
  if (typeof window === 'undefined') return {};
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as GateState;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed;
  } catch {
    return {};
  }
};

const writeState = (state: GateState) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const isRoundBlockedForBrowser = (roundId: number): boolean => {
  const slot = getSlot(roundId);
  const state = readState();
  if (!(slot in state)) {
    state[slot] = '0';
    writeState(state);
  }
  return state[slot] === '1';
};

export const markRoundSubmittedForBrowser = (roundId: number) => {
  const slot = getSlot(roundId);
  const state = readState();
  state[slot] = '1';
  writeState(state);
};


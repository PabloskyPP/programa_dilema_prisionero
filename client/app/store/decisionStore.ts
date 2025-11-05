import { create } from "zustand";

type DecisionStore = {
  totalVotes: number;
  hasVoted: boolean;
  setHasVoted: (hasVoted: boolean) => void;
  setVotes: (votes: number) => void;
};

export const useDecisionStore = create<DecisionStore>((set) => ({
  totalVotes: 0,
  hasVoted: false,
  setHasVoted: (hasVoted) => set({ hasVoted }),
  setVotes: (votes) => set({ totalVotes: votes }),
}));

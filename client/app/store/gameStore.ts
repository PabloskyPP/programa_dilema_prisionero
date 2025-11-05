import { create } from "zustand";

type Status = "waiting" | "active" | "completed" | "instructions";
type PlayerIncome = {
  playerId: number;
  income: number;
  total: number;
};
type RoundDetails = {
  id: number;
  gameId: string;
  isVotingFinished: boolean;
  roundNumber: number;
  startedAt: string;
};

type GameStore = {
  status: Status;
  income: number;
  allIncomes: PlayerIncome[];
  showResult: boolean;
  showChat: boolean;
  roundDetails: RoundDetails | null;

  setRoundDetails: (round: RoundDetails) => void;
  setStatus: (status: Status) => void;
  setIncome: (income: number) => void;
  setAllIncomes: (summary: PlayerIncome[]) => void;
  setShowResult: (show: boolean) => void;
  setShowChat: (show: boolean) => void;
};

export const useGameStore = create<GameStore>((set) => ({
  status: "waiting",
  income: 0,
  allIncomes: [],
  showResult: false,
  showChat: true,
  roundDetails: null,
  setRoundDetails: (roundDetails) => set({ roundDetails }),
  setStatus: (status) => set({ status }),
  setIncome: (income) => set({ income }),
  setAllIncomes: (summary) => set({ allIncomes: summary }),
  setShowResult: (show) => set({ showResult: show }),
  setShowChat: (show: boolean) => set({ showChat: show }),
}));

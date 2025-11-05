import { create } from "zustand";
import { socket } from "@/lib/socket";

interface AdminStore {
  isAdmin: boolean;
  setIsAdmin: (value: boolean) => void;
  updateGameStatus: ({
    gameId,
    status,
  }: {
    gameId: string;
    status: string;
  }) => void;
  startNextRound: (gameId: string) => void;
}

export const useAdminStore = create<AdminStore>((set) => ({
  isAdmin: false,
  setIsAdmin: (value) => set({ isAdmin: value }),

  updateGameStatus: ({
    gameId,
    status,
  }: {
    gameId: string;
    status: string;
  }) => {
    socket.emit("admin_update_game_status", { gameId, status });
  },

  startNextRound: (gameId) => {
    socket.emit("admin_start_next_round", { gameId });
  },
}));

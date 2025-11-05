import { create } from "zustand";
type Player = {
  id: number; // or string if your IDs are strings
  name: string;
};

type PlayersStore = {
  players: Player[];
  hasLoadedPlayers: boolean;
  hasJoinedGame: boolean;

  hasLoaded: boolean;
  setHasJoinedGame: (value: boolean) => void;
  setHasLoaded: (value: boolean) => void;
  setPlayers: (players: Player[]) => void;
  addPlayer: (player: Player) => void;
};

export const usePlayersStore = create<PlayersStore>((set) => ({
  players: [],
  hasLoaded: false,
  hasLoadedPlayers: false,
  hasJoinedGame: false,
  setHasLoaded: (value) =>
    set({
      hasLoaded: value,
    }),
  setHasJoinedGame: (value) =>
    set({
      hasJoinedGame: value,
    }),
  setPlayers: (players) => set({ players, hasLoadedPlayers: true }),
  addPlayer: (player) =>
    set((state) => ({
      players: [...state.players, player],
      hasLoadedPlayers: true,
    })),
}));

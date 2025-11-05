"use client";
import { usePlayersStore } from "@/app/store/playerStore";
import { useState } from "react";
import { Button } from "./ui/button";
import { socket } from "@/lib/socket";

const PlayerWaitingPage = ({ gameId }: { gameId: string }) => {
  const [nameInput, setNameInput] = useState("");

  const players = usePlayersStore((state) => state.players);
  const playersLoaded = usePlayersStore((state) => state.hasLoadedPlayers);
  const joined = usePlayersStore((state) => state.hasJoinedGame);

  const handleJoin = () => {
    const name = nameInput.trim();
    if (!name) {
      alert("Please enter a valid name");
      return;
    }
    localStorage.setItem("playerName", name);

    socket.emit("join_game", { playerName: name, gameId });
  };

  if (!joined) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <h1>Join Game {gameId}</h1>
        <input
          type="text"
          placeholder="Enter your name"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          className="border p-2"
        />
        <Button onClick={handleJoin} className="btn btn-primary">
          Join Game
        </Button>
      </div>
    );
  }
  if (playersLoaded)
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <h1>Waiting Room - Game {gameId}</h1>
        <h2>Players waiting: {players.length}</h2>
        <ul>
          {players.map((p, i) => (
            <li key={i}>{p.name}</li>
          ))}
        </ul>
        <p>Waiting for the game to start...</p>
      </div>
    );
};
export default PlayerWaitingPage;

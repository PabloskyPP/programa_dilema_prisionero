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
      alert("Por favor ingresa un nombre válido");
      return;
    }
    localStorage.setItem("playerName", name);

    socket.emit("join_game", { playerName: name, gameId });
  };

  if (!joined) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <h1>Unirse al Juego {gameId}</h1>
        <input
          type="text"
          placeholder="Ingresa tu nombre"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          className="border p-2"
        />
        <Button onClick={handleJoin} className="btn btn-primary">
          Unirse al Juego
        </Button>
      </div>
    );
  }
  if (playersLoaded)
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <h1>Sala de Espera - Juego {gameId}</h1>
        <h2>Jugadores esperando: {players.length}</h2>
        <ul>
          {players.map((p, i) => (
            <li key={i}>{p.name}</li>
          ))}
        </ul>
        <p>Esperando a que comience el juego...</p>
      </div>
    );
};
export default PlayerWaitingPage;

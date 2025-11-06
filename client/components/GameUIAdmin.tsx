import { useEffect } from "react";
import { ChatBox } from "./Chatbox";
import { Button } from "./ui/button";
import { RoundTimer } from "./RoundTimer";
import { VoteProgress } from "./VotesProgress";
import { usePlayersStore } from "@/app/store/playerStore";
import { useDecisionSocket } from "@/hooks/useDecisionSocket";
import { useGameStore } from "@/app/store/gameStore";
import { ResultsTable } from "./ResultsTable";
import { socket } from "@/lib/socket";
import { useGameSocket } from "@/hooks/useGameSocket";
import { AdminRemovePlayer } from "./AdminRemovePlayerDialog";

export default function GameUIAdmin({ gameId }: { gameId: string }) {
  const { roundDetails, setRoundDetails } = useGameStore();
  const { players } = usePlayersStore();
  useDecisionSocket({ gameId });
  useGameSocket({ gameId });
  useEffect(() => {
    async function fetchCurrentRound() {
      if (!gameId) return;

      const res = await fetch(
        process.env.NEXT_PUBLIC_SERVER_URL + `/api/game/${gameId}/current-round`
      );
      if (res.ok) {
        const roundData = await res.json();

        if (roundData) {
          setRoundDetails(roundData);
        }
      }
    }

    fetchCurrentRound();
    // Also keep socket listener for new rounds
  }, [gameId, setRoundDetails]);

  if (roundDetails) {
    if (roundDetails.isVotingFinished) {
      return (
        <div className="flex flex-col gap-4">
          <ResultsTable />
          <div className="flex justify-end mr-4">
            {roundDetails.roundNumber <= 9 && (
              <Button
                onClick={() => {
                  socket.emit("admin_create_new_round", { gameId });
                }}
              >
                Siguiente Ronda
              </Button>
            )}
            {roundDetails.roundNumber == 10 && (
              <Button
                onClick={() => {
                  socket.emit("admin_end_game", { gameId });
                }}
              >
                Terminar Juego
              </Button>
            )}
          </div>
        </div>
      );
    }
    // if (showChat)
    return (
      <div className="h-screen">
        <AdminRemovePlayer gameId={gameId} />
        <div className="flex items-center justify-center h-[calc(100vh-55px)] overflow-y-auto ">
          <div className="bg-gray-50 rounded-lg min-w-[70%] min-h-[70%] max-w-[800px]">
            <h2 className="font-bold text-xl text-center py-4 border-b-2 border-gray-300 mx-8 mb-4">
              Ronda {roundDetails.roundNumber} - Tiempo de discusión - Tiempo
              restante: &nbsp;
              {roundDetails?.startedAt && (
                <RoundTimer
                  startedAt={roundDetails.startedAt}

                  // handleVotingEnd={() => {
                  //   handleVotingEnd();
                  // }}
                />
              )}
            </h2>

            {/* Removed min-h-full and grow, added flex-1 to the chat and button containers */}
            <div className="flex flex-col lg:flex-row gap-y-8 w-full ">
              <div className="lg:w-3/4">
                {roundDetails.id && (
                  <ChatBox roundId={roundDetails.id} isAdmin={true} />
                )}
              </div>
              <div className="lg:w-1/4 flex flex-col items-center justify-center gap-4">
                <Button className="cursor-not-allowed hover:bg-yellow-500 px-8 py-5 text-black bg-yellow-500">
                  Ir ahora a votar
                </Button>
                <div>
                  <VoteProgress totalPlayers={players.length} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
    // else if (!showChat) {
    //   return (
    //     <VotingScreen
    //       gameId={gameId}
    //       roundId={roundDetails.id}
    //       roundNumber={roundDetails?.roundNumber}
    //       totalPlayers={players.length}
    //     />
    //   );
    // }
  }
}

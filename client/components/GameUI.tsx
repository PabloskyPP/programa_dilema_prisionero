import { useEffect } from "react";
import { ChatBox } from "./Chatbox";
import { Button } from "./ui/button";
import { RoundTimer } from "./RoundTimer";
// import VotingScreen from "./VotingScreen";
import { VoteProgress } from "./VotesProgress";
import { usePlayersStore } from "@/app/store/playerStore";
import { useDecisionSocket } from "@/hooks/useDecisionSocket";
import { useGameStore } from "@/app/store/gameStore";
import VotingScreen from "./VotingScreen";
import { ResultsTable } from "./ResultsTable";
import { useGameSocket } from "@/hooks/useGameSocket";
// import { useDecisionStore } from "@/app/store/decisionStore";

export default function GameUI({ gameId }: { gameId: string }) {
  const { roundDetails, setRoundDetails, showChat, setShowChat } =
    useGameStore();
  // const {setVotes} = useDecisionStore();
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
          const roundNumber = roundData.roundNumber;
          if (roundNumber == 5 || roundNumber == 6 || roundNumber == 9) {
            console.log("Sin chat esta ronda.");
            setShowChat(false);
          } else {
            setShowChat(true);
          }
        }
      }
    }

    fetchCurrentRound();
    // Also keep socket listener for new rounds
  }, [gameId, setRoundDetails, setShowChat]);

  if (roundDetails) {
    if (roundDetails.isVotingFinished) {
      return (
        <div className="flex flex-col gap-4">
          <ResultsTable />
        </div>
      );
    }
    if (showChat)
      return (
        <>
          <div className="flex items-center justify-center h-screen">
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
              <div className="flex w-full flex-col lg:flex-row gap-8">
                <div className="w-full lg:w-3/4">
                  {roundDetails.id && <ChatBox roundId={roundDetails.id} />}
                </div>
                <div className="mt-4 md:mt-0 w-full lg:w-1/4 flex flex-col items-center justify-center gap-4">
                  <Button
                    className="cursor-pointer hover:bg-yellow-600 px-8 py-5 text-black bg-yellow-500"
                    onClick={() => {
                      setShowChat(false);
                    }}
                  >
                    Ir ahora a votar
                  </Button>
                  <div>
                    <VoteProgress totalPlayers={players.length} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      );
    else if (!showChat) {
      return (
        <VotingScreen
          gameId={gameId}
          roundId={roundDetails.id}
          roundNumber={roundDetails?.roundNumber}
          totalPlayers={players.length}
        />
      );
    }
  }
}

import React from "react";
import { Button } from "./ui/button";
import { socket } from "@/lib/socket";
import { VoteProgress } from "./VotesProgress";
import { useDecisionStore } from "@/app/store/decisionStore";

const VotingScreen = ({
  roundNumber,
  roundId,
  gameId,
  totalPlayers,
}: {
  roundNumber: number;
  roundId: number;
  gameId: string;
  totalPlayers: number;
}) => {
  const hasVoted = useDecisionStore((s) => s.hasVoted);
  const handleSubmit = (decision: string) => {
    const playerId = localStorage.getItem("playerId");
    socket.emit("submit_decision", { roundId, gameId, decision, playerId });
  };
  return (
    <div className="h-screen w-full flex justify-center items-center bg-gray-100 ">
      <div className="flex justify-center items-center bg-white shadow-xl w-[60%] min-w-[300px] max-w-[700px] flex-col gap-6 px-8 py-12 rounded-md">
        <h3 className="font-bold text-black text-2xl">Round {roundNumber}</h3>
        <p className="text-gray-700 text-lg">
          In this round your team decides...? Choose wisely!
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button
            disabled={hasVoted}
            onClick={() => {
              handleSubmit("collaborate");
            }}
            size={"lg"}
            className="bg-green-500 text-lg p-6 text-white hover:bg-green-600"
          >
            Collaborate
          </Button>
          <Button
            disabled={hasVoted}
            onClick={() => {
              handleSubmit("defect");
            }}
            variant={"destructive"}
            size={"lg"}
            className="hover:brightness-90 text-lg p-6"
          >
            Do not collaborate
          </Button>
        </div>

        <p className="text-sm text-gray-500">
          Waiting for all teams to vote...
        </p>

        <div className="text-gray-800 font-bold">
          <VoteProgress totalPlayers={totalPlayers} />
        </div>
      </div>
    </div>
  );
};

export default VotingScreen;

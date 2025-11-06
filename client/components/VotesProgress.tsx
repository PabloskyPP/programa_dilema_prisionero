import { useDecisionStore } from "@/app/store/decisionStore";

export const VoteProgress = ({ totalPlayers }: { totalPlayers: number }) => {
  const totalVotes = useDecisionStore((s) => s.totalVotes);
  return (
    <p className="text-center font-semibold">
      Votos {totalVotes}/{totalPlayers}
    </p>
  );
};

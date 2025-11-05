"use client";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import React, { use } from "react";

const Leaderboard = ({ params }: { params: Promise<{ gameId: string }> }) => {
  const { gameId } = use(params);
  return (
    <div>
      <LeaderboardTable gameId={gameId} />
    </div>
  );
};

export default Leaderboard;

export const newRound = async ({ gameId }: { gameId: string }) => {
  const res = await fetch(
    process.env.NEXT_PUBLIC_SERVER_URL + "/api/game/next-round",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ gameId }), // serialize object to JSON string
    }
  );
  if (!res.ok) throw new Error("Failed to create round");
  return await res.json();
};

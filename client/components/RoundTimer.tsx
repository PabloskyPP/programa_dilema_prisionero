import { useGameStore } from "@/app/store/gameStore";
import { useEffect, useState } from "react";

const ROUND_DURATION_MS = 5 * 60 * 1000; // 5 minutes in ms

export function RoundTimer({ startedAt }: { startedAt: string }) {
  const { setShowChat } = useGameStore();
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (!startedAt) return;

    const start = new Date(startedAt).getTime();
    const end = start + ROUND_DURATION_MS;

    const update = () => {
      const now = Date.now();
      const diff = Math.max(0, end - now);
      setTimeLeft(diff);
      if (diff <= 0) {
        setShowChat(false);
      }
    };

    update(); // initialize immediately
    const interval = setInterval(update, 1000); // update every second

    return () => {
      clearInterval(interval);
    }; // cleanup
  }, [startedAt, setShowChat]);

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);
  const displayTime = `${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;

  return <span className=" text-red-500">{displayTime}</span>;
}

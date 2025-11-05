import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2Icon } from "lucide-react";
import React, { useEffect, useState } from "react";

export function ResultsTable() {
  // const allIncomes = useGameStore((s) => s.allIncomes);

  const [results, setResults] = useState([]);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await fetch(
          process.env.NEXT_PUBLIC_SERVER_URL + "/api/game/game-summary",
          {
            headers: {
              "ngrok-skip-browser-warning": "true",
            },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch game");
        const { data, players: playersData } = await res.json();
        // Convert object { round1: {...}, round2: {...} } into array
        const roundsArray = Object.entries(data).map(([roundName, data]) => ({
          roundName,
          //@ts-expect-error ignore the error
          ...data,
        }));
        //@ts-expect-error ignore the error
        setResults(roundsArray);
        setPlayers(playersData);
      } catch (err: unknown) {
        console.log("ERROR:", err);
        // setError(err.message || "Unknown error");
      }
    };
    getData();
  }, []);

  if (results.length)
    return (
      <div>
        <Table className="text-center border-4" border={8}>
          <TableCaption>Leaderboard</TableCaption>
          <TableHeader className="text-center">
            <TableRow className="text-center">
              <TableHead rowSpan={3} className="text-center bg-gray-50">
                Round
              </TableHead>
              <TableHead
                className="text-center bg-blue-500"
                colSpan={players.length * 3}
              >
                Results
              </TableHead>
            </TableRow>
            <TableRow>
              {players.map((player, index) => (
                <TableHead
                  className="text-center border"
                  colSpan={3}
                  key={index}
                >
                  {/* @ts-expect-errordasdas */}
                  {player.name} {/* Assuming 'player' has a 'name' property */}
                </TableHead>
              ))}
            </TableRow>
            <TableRow>
              {players.map((_, index) => (
                <React.Fragment key={index}>
                  <TableHead className="text-center bg-gray-50">
                    Decision
                  </TableHead>
                  <TableHead className="text-center bg-gray-50">
                    Income
                  </TableHead>
                  <TableHead className="text-center bg-gray-50">
                    Total Balance
                  </TableHead>
                </React.Fragment>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((roundData, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{`${i + 1}`}</TableCell>

                {/* 
    // @ts-expect-error ignore*/}
                {roundData.playerIncomes.map((data, j) => (
                  <React.Fragment key={j}>
                    <TableCell className="capitalize">
                      {data.decision}
                    </TableCell>
                    <TableCell
                      className={`${
                        data.income > 0 ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {data.income}
                    </TableCell>
                    <TableCell
                      className={`${
                        data.totalBalance > 0
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {data.totalBalance}
                    </TableCell>
                  </React.Fragment>
                ))}
              </TableRow>
            ))}
          </TableBody>

          {/* <TableFooter>
        <TableRow>
        <TableCell colSpan={3}>Total</TableCell>
        <TableCell className="text-right">$2,500.00</TableCell>
        </TableRow>
        </TableFooter> */}
        </Table>
      </div>
    );
  if (!results || !results.length) {
    return (
      <div className="flex h-screen justify-center items-center">
        <Loader2Icon className="animate-spin" />
      </div>
    );
  }
}

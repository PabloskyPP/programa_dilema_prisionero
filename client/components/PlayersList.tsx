import { usePlayersStore } from "@/app/store/playerStore";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { socket } from "@/lib/socket";
import { XIcon } from "lucide-react";

const PlayersList = ({ gameId }: { gameId: string }) => {
  const players = usePlayersStore((s) => s.players);

  const handleRemovePlayer = (playerId: number) => {
    socket.emit("admin_remove_player_from_game", {
      gameId,
      playerId,
    });
  };

  return (
    <div>
      <Table>
        <TableCaption>Total de Jugadores : {players.length}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px] text-center">No.</TableHead>
            <TableHead className="w-[100px] text-center">Id</TableHead>
            <TableHead className="text-center">Nombre del Jugador</TableHead>
            <TableHead className="text-center"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map((player, i) => (
            <TableRow key={i}>
              <TableCell className="font-medium text-center">{i + 1}</TableCell>
              <TableCell className="text-center  ">{player.id}</TableCell>
              <TableCell className="text-center flex gap-1 items-center justify-center ">
                {player.name}
              </TableCell>
              <TableCell className="text-center">
                <XIcon
                  onClick={() => {
                    handleRemovePlayer(player.id);
                  }}
                  className="size-4 text-red-400 font-bold hover:text-red-500 cursor-pointer"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PlayersList;

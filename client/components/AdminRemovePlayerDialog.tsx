import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import PlayersList from "./PlayersList";
import { List } from "lucide-react";

export function AdminRemovePlayer({ gameId }: { gameId: string }) {
  return (
    <div className="flex  w-full h-[50px]  text-black font-bold justify-center items-center">
      <div>Pantalla de Administrador </div>
      <div className="flex absolute w-full z-10 mr-4 justify-end">
        <Dialog>
          <DialogTrigger
            className="bg-blue-400 flex gap-1 p-2 rounded-lg justify-self-end text-sm text-white items-center cursor-pointer hover:bg-blue-500"
            type="button"
          >
            <List className="size-4" />
            Jugadores
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>ID del Juego: {gameId}</DialogTitle>
              {/* <DialogDescription>Players List</DialogDescription> */}
            </DialogHeader>
            <PlayersList gameId={gameId} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

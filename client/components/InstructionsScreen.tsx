import React from "react";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

const InstructionsScreen = ({
  handleUpdateStatus,
  isAdmin = false,
}: {
  handleUpdateStatus?: (status: string) => void;
  isAdmin?: boolean;
}) => {
  return (
    <div className="bg-black min-h-screen w-full text-white text-xl flex justify-center items-center flex-col gap-6 py-8">
      <div className="flex flex-col gap-4 justify-center items-center mx-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-4">Instrucciones del Juego</h1>
        <p className="block">
          En este juego tendrás que elegir si colaborar o no con otros
          jugadores. Antes de tomar tu decisión de votación tendrás algo de
          tiempo para discutir con los otros jugadores. Hay 10 rondas para
          votar, pero no en todas habrá tiempo para discutir. En las rondas 5, 6
          y 9 irás directamente a votar sin haber podido hablar con otros
          jugadores previamente. Tu objetivo durante el juego es ganar tanto
          dinero como sea posible.
        </p>

        <h2 className="text-2xl font-bold mt-6 mb-2">
          Reglas de Puntuación
        </h2>
        <p className="mb-4">
          Los ingresos de cada jugador por ronda se calculan según las siguientes
          reglas:
        </p>

        <div className="w-full overflow-x-auto">
          <Table className="border-2 border-white text-white">
            <TableHeader>
              <TableRow className="border-b-2 border-white hover:bg-gray-800">
                <TableHead className="text-white border-r-2 border-white text-center font-bold">
                  Condición
                </TableHead>
                <TableHead className="text-white border-r-2 border-white text-center font-bold">
                  Colaboradores
                </TableHead>
                <TableHead className="text-white text-center font-bold">
                  Traidores
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="border-b border-white hover:bg-gray-800">
                <TableCell className="border-r-2 border-white text-center">
                  Ningún traidor
                </TableCell>
                <TableCell className="border-r-2 border-white text-center">
                  +1
                </TableCell>
                <TableCell className="text-center">+1</TableCell>
              </TableRow>
              <TableRow className="border-b border-white hover:bg-gray-800">
                <TableCell className="border-r-2 border-white text-center">
                  1 solo traidor
                </TableCell>
                <TableCell className="border-r-2 border-white text-center">
                  n_colab / total
                </TableCell>
                <TableCell className="text-center">+2</TableCell>
              </TableRow>
              <TableRow className="border-b border-white hover:bg-gray-800">
                <TableCell className="border-r-2 border-white text-center">
                  Mayoría colaboradores
                </TableCell>
                <TableCell className="border-r-2 border-white text-center">
                  n_colab / total
                </TableCell>
                <TableCell className="text-center">+1</TableCell>
              </TableRow>
              <TableRow className="border-b border-white hover:bg-gray-800">
                <TableCell className="border-r-2 border-white text-center">
                  Igual número
                </TableCell>
                <TableCell className="border-r-2 border-white text-center">
                  0
                </TableCell>
                <TableCell className="text-center">0</TableCell>
              </TableRow>
              <TableRow className="border-b border-white hover:bg-gray-800">
                <TableCell className="border-r-2 border-white text-center">
                  Mayoría traidores
                </TableCell>
                <TableCell className="border-r-2 border-white text-center">
                  −(n_traidores / total)
                </TableCell>
                <TableCell className="text-center">
                  −(n_traidores / total)
                </TableCell>
              </TableRow>
              <TableRow className="hover:bg-gray-800">
                <TableCell className="border-r-2 border-white text-center">
                  Todos traidores
                </TableCell>
                <TableCell className="border-r-2 border-white text-center">
                  −n_total
                </TableCell>
                <TableCell className="text-center">−n_total</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <p className="text-sm mt-4 text-gray-300">
          Los ingresos pueden ser positivos, negativos o cero, y pueden ser
          fraccionarios.
        </p>
      </div>
      {isAdmin && handleUpdateStatus && (
        <Button
          onClick={() => handleUpdateStatus("active")}
          className="cursor-pointer bg-blue-500 text-white hover:bg-blue-700 text-lg py-6"
          size={"lg"}
        >
          Entendido, Continuar
        </Button>
      )}
    </div>
  );
};

export default InstructionsScreen;

import React from "react";
import { Button } from "./ui/button";

const InstructionsScreen = ({
  handleUpdateStatus,
  isAdmin = false,
}: {
  handleUpdateStatus?: (status: string) => void;
  isAdmin?: boolean;
}) => {
  return (
    <div className="bg-black min-h-screen w-full  text-white text-xl flex justify-center items-center flex-col gap-6">
      <div className="flex flex-col gap-4 justify-center items-center mx-8">
        <p className="block">
          In this game you will have to choose whether or not to collaborate
          with other players. Before you make your voting decision you will have
          some time to discuss with the other players. There are 10 rounds to
          vote but not in all of them there will be time to discuss. In rounds
          5, 6 and 9 you will go directly to vote without having been able to
          talk to other players beforehand. Your goal during the game is to earn
          as much money as possible. A player`&apos;`s round income is
          calculated based on the following formula:
        </p>
        <p>
          If your decision is **Collaborate**: Your income is **1 - (Total
          number of Defectors in this round)**.
        </p>
        <p>If your decision is **Defect**:</p>
        <div>
          <li>
            If (Total Collaborators) `{">"}` (Total Defectors): Your income is
            **(Total Collaborators) / (Total Defectors)**.
          </li>
          <li>
            {" "}
            Else if (Total Collaborators) === 0: Your income is **(Total
            Players) * -1**. (This happens if everyone defects).
          </li>
          <li>
            {" "}
            Else ((Total Collaborators) `{"<"}`= (Total Defectors) AND (Total
            Collaborators) `{">"}` 0): Your income is **((Total Defectors) /
            (Total Collaborators)) * -1**.
          </li>
        </div>
        Income can be positive, negative, or zero, and can be fractional.
      </div>
      {isAdmin && handleUpdateStatus && (
        <Button
          onClick={() => handleUpdateStatus("active")}
          className="cursor-pointer bg-blue-500 text-white hover:bg-blue-700 text-lg py-6"
          size={"lg"}
        >
          Got it, Continue
        </Button>
      )}
    </div>
  );
};

export default InstructionsScreen;

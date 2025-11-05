import { Router, Request, Response } from "express";
import { getChat } from "../db/queries/chat.query";

const router = Router(); // ✅ Define router here

router.get(
  "/:roundId/history",
  async (req: Request, res: Response): Promise<any> => {
    const { roundId } = req.params;
    const round = parseInt(roundId);
    try {
      const chat = await getChat({ roundId: round });
      if (chat.length > 0) {
        return res.json(chat);
      }
      return res.json([]);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);
export default router; // ✅ Export the Router — not a function!

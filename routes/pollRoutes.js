import express from "express";
import { createPoll, deletePoll, getAllPolls, getPollById, voteOnPoll } from "../controllers/pollController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createPoll);
router.get("/", getAllPolls); // Public or Protected? Let's make it public to see. Or protected? Usually polls are public. I'll make it public for now.
router.get("/:id", getPollById);
router.post("/:id/vote", protect, voteOnPoll); // Voting should usually be protected if we want some accountability, though schema doesn't track. I'll protect it.
router.delete("/:id", protect, deletePoll);

export default router;

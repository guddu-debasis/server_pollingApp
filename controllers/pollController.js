import Poll from "../models/Poll.js";
import Vote from "../models/Vote.js";

/**
 * CREATE POLL (creator sets timer)
 */
export const createPoll = async (req, res) => {
  const { question, options, durationInMinutes } = req.body;

  if (!question || options.length < 2 || durationInMinutes <= 0) {
    return res.status(400).json({ message: "Invalid input" });
  }

  const expiresAt = new Date(
    Date.now() + durationInMinutes * 60 * 1000
  );

  const poll = await Poll.create({
    question,
    options: options.map(o => ({ text: o })),
    createdBy: req.user.id,
    expiresAt
  });

  res.status(201).json(poll);
};

/**
 * DELETE POLL (creator only)
 */
export const deletePoll = async (req, res) => {
  const poll = await Poll.findById(req.params.id);

  if (!poll) {
    return res.status(404).json({ message: "Poll not found" });
  }

  if (poll.createdBy.toString() !== req.user.id) {
    return res.status(403).json({ message: "Not authorized" });
  }

  await poll.deleteOne();
  res.json({ message: "Poll deleted successfully" });
};

/**
 * GET ALL POLLS
 */
export const getAllPolls = async (req, res) => {
  try {
    const polls = await Poll.find().sort({ createdAt: -1 }).populate("createdBy", "name");
    res.json(polls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET POLL BY ID
 */
export const getPollById = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id).populate("createdBy", "name");
    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }
    res.json(poll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * VOTE ON POLL
 */
export const voteOnPoll = async (req, res) => {
  const { optionIndex } = req.body;
  const { id } = req.params;
  const userId = req.user.id; // from protect middleware

  try {
    const poll = await Poll.findById(id);

    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    if (new Date() > new Date(poll.expiresAt)) {
      return res.status(400).json({ message: "Poll has expired" });
    }

    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return res.status(400).json({ message: "Invalid option index" });
    }

    const existingVote = await Vote.findOne({ userId, pollId: id });

    if (existingVote) {
      if (existingVote.optionIndex === optionIndex) {
        return res.json(poll); // No change
      }

      // Decrement previous vote
      await Poll.updateOne(
        { _id: id },
        { $inc: { [`options.${existingVote.optionIndex}.votes`]: -1 } }
      );

      // Update vote entry
      existingVote.optionIndex = optionIndex;
      await existingVote.save();
    } else {
      // New vote
      await Vote.create({ userId, pollId: id, optionIndex });
    }

    // Increment new vote
    await Poll.updateOne(
      { _id: id },
      { $inc: { [`options.${optionIndex}.votes`]: 1 } }
    );

    const updatedPoll = await Poll.findById(id);
    res.json(updatedPoll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

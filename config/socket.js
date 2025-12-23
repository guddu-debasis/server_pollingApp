import jwt from "jsonwebtoken";
import Poll from "../models/Poll.js";
import Vote from "../models/Vote.js";



const socketHandler = (io) => {
  io.on("connection", (socket) => {

    socket.on("join_poll", (pollId) => {
      socket.join(pollId);
    });

    socket.on("vote", async ({ pollId, optionIndex, token }) => {
      try {
        const { id: userId } = jwt.verify(token, process.env.JWT_SECRET);

        const poll = await Poll.findById(pollId);
        if (!poll) throw new Error("Poll expired");

        console.log(`Vote attempt - User: ${userId}, Poll: ${pollId}, Option: ${optionIndex}`);

        if (optionIndex < 0 || optionIndex >= poll.options.length) {
          throw new Error("Invalid option index");
        }



        const existingVote = await Vote.findOne({ userId, pollId });

        if (existingVote) {
          // If the user voted for the same option, do nothing
          if (existingVote.optionIndex === optionIndex) {
            return;
          }

          // Decrement previous vote
          await Poll.updateOne(
            { _id: pollId },
            { $inc: { [`options.${existingVote.optionIndex}.votes`]: -1 } }
          );

          // Update vote entry
          existingVote.optionIndex = optionIndex;
          await existingVote.save();
        } else {
          // New vote
          await Vote.create({ userId, pollId, optionIndex });
        }

        // Increment new vote count
        await Poll.updateOne(
          { _id: pollId },
          { $inc: { [`options.${optionIndex}.votes`]: 1 } }
        );

        const updatedPoll = await Poll.findById(pollId);
        io.to(pollId).emit("poll_update", updatedPoll);

      } catch (err) {
        socket.emit("vote_error", { message: err.message });
      }
    });
  });
};

export default socketHandler;

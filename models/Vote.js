import mongoose from "mongoose";

const voteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    pollId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Poll",
      required: true
    },

    optionIndex: {
      type: Number,
      required: true
    },

    votedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

voteSchema.index({ userId: 1, pollId: 1 }, { unique: true });

export default mongoose.model("Vote", voteSchema);

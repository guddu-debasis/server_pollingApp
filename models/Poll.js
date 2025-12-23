import mongoose from "mongoose";

const optionSchema = new mongoose.Schema({
  text: String,
  votes: { type: Number, default: 0 }
});

const pollSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true
    },

    options: {
      type: [optionSchema],
      validate: [v => v.length >= 2, "Minimum 2 options required"]
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    expiresAt: {
      type: Date,
      required: true
    }
  },
  { timestamps: true }
);

/**
 * 🔥 Auto delete poll after expiry
 */
pollSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("Poll", pollSchema);

import { model, Schema } from "mongoose";

const optSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },
    otp: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true },
);

// Create an index on the expiresAt field to automatically delete expired OTPs
optSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 480 });

export const OTP = model("OTP", optSchema);
import mongoose from "mongoose";
import { hashFn } from "../../utils/hasing/hash.js";

export const roles = {
  superAdmin: "superAdmin",
  admin: "admin",
  moderator: "moderator",
  user: "user",
  guest: "guest",
};

export const providers = {
  system: "system",
  google: "google",
};

export const defaultProfilePicture = "uploads//default-profile-picture.png";

export const defaultPublicId = "default-profile-picture";
export const defaultSecureUrl =
  "https://res.cloudinary.com/uixfeg7g/image/upload/v1794424470/default-profile-picture.png";

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function () {
        return this.provider === providers.system;
      },
    },
    provider: {
      type: String,
      enum: Object.values(providers),
      default: providers.system,
    },
    // profilePicture: {
    //   type: String,
    //   default: defaultProfilePicture,
    // },
    profilePicture: {
      public_id: { type: String, default: defaultPublicId },
      secure_url: {
        type: String,
        default: defaultSecureUrl,
      },
    },

    coverPictures: {
      type: [String],
      default: [],
    },
    isActivated: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: Object.values(roles),
      default: roles.user,
    },
    isLoggedIn: {
      type: Boolean,
      default: false,
    },
    frezeed: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await hashFn({ plainText: this.password });
  }
});

const User = mongoose.model("User", userSchema);

export default User;

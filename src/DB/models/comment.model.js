import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema(
  {
    text: {
      type: String,
      trim: true,
    },
    image: {
      secure_url: {
        type: String,
      },
      public_id: {
        type: String,
      },
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true },
);

/*
        الـ Arrow Function مش بتعمل binding خاص لـ this، وبالتالي this مش هيشير للـ Comment document.
        لازم تستخدم Function عادية:
        commentSchema.pre("validate", function () {}
    */

commentSchema.pre("validate", function () {
  const hasText = Boolean(this.text?.trim());

  const hasImage = Boolean(this.image?.secure_url);

  if (!hasText && !hasImage) {
    this.invalidate("text", "Comment must contain at least text or one image");
  }
});

export const Comment = mongoose.model("Comment", commentSchema);

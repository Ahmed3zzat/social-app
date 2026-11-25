import mongoose, { Schema } from "mongoose";
import cloudinary from "../../utils/file uploading/cloudinary.config.js";

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
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
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
    // replies: []
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// virtual populate
commentSchema.virtual("replies", {
  localField: "_id",
  foreignField: "parentComment",
  ref: "Comment",
});

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

// hooks
commentSchema.post(
  "deleteOne",
  { query: false, document: true },
  async function (doc) {

    // delete image from cloudnairy
    if (doc.image.secure_url) {
      await cloudinary.uploader.destroy(doc.image.public_id);
    }
    
    // Get deleted comment ID
    const commentParent = doc._id;
    // Find all replies related to this comment
    const replies = await doc.constructor.find({
      parentComment: commentParent,
    });

    // Delete all replies
    for (const reply of replies) {
      await reply.deleteOne();
    }
  },
);

export const Comment = mongoose.model("Comment", commentSchema);

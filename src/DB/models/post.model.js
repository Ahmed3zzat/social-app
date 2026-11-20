import mongoose, { Schema } from "mongoose";

const postSchema = new Schema(
  {
    text: {
      type: String,
      trim: true,
      minlength: 2,
    },

    images: [
      {
        secure_url: {
          type: String,
        },
        public_id: {
          type: String,
        },
      },
    ],

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // comments: [
    //   {
    //     type: Schema.Types.ObjectId,
    //     ref: "Comment",
    //   },
    // ],

    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
    cloudFolder: {
      type: String,
      unique: true,
      require: function () {
        return this.images.length ? true : false;
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ==================== Post Validation ====================

postSchema.virtual("comments", {
  ref: "Comment",
  foreignField: "post",
  localField: "_id",
});

postSchema.pre("validate", function () {
  const hasText = Boolean(this.text?.trim());
  const hasImages = this.images?.length > 0;

  if (!hasText && !hasImages) {
    //
    this.invalidate("text", "Post must contain at least text or one image");
  }
});

const Post = mongoose.model("Post", postSchema);

export default Post;

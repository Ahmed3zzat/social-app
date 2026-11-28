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
      required: function () {
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


postSchema.query.paginate = async function (page = 1, limit = 2) {
  page = Number(page) || 1;

  const skip = limit * (page - 1);

  // ==================== Get Data & Total Items ====================
  const [data, totalItems] = await Promise.all([
    this.clone()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    this.model.countDocuments(this.getFilter()),
  ]);

  // ==================== Pagination ====================
  const totalPages = Math.ceil(totalItems / limit);

  return {
    data,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
      limit,
      itemPerPage: data.length,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

const Post = mongoose.model("Post", postSchema);

export default Post;

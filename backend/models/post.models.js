import mongoose from "mongoose"

// 1. Define the Sub-schema FIRST
const commentSchema = new mongoose.Schema({
  content: {
    type: String, required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId, ref: "User"
  },
  isEdited: {
    type: Boolean, default: false

  }
}, { timestamps: true });


// 2. Use subSchemas in the Post Schema
const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  description: {
    type: String,
    default: "",
    required: true
  },
  image: {
    type: String
  },
  imagePublicId: {
    type: String
  },
  like: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  comments: [commentSchema],
}, { timestamps: true })
postSchema.index({ author: 1, createdAt: -1 });

// --- THE MIDDLEWARE ---

// 1. Success Trigger: Runs ONLY after the post is successfully written to DB
postSchema.post('save', async function (doc) {
  // 'doc' is the post that was just created
  await mongoose.model('User').findByIdAndUpdate(doc.author, {
    $inc: { postCount: 1 }
  });
});

// 2. Delete Trigger: Runs after a post is successfully removed
// This handles calls like Post.findOneAndDelete()
postSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await mongoose.model('User').findByIdAndUpdate(doc.author, {
      $inc: { postCount: -1 }
    });
  }
});

const Post = mongoose.model("Post", postSchema)

export default Post
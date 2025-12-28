import Post from "../models/post.models.js"
import { uploadOnCloudinary, deleteFromCloudinary } from "../config/cloudinary.js"
import { io } from "../index.js"
import User from "../models/user.models.js"


export const createPost = async (req, res) => {
    let cloudinaryResponse = null; // Track this for cleanup if needed

    try {
        const { description } = req.body;
        let postData = {
            author: req.userId,
            description
        };

        // 1. Handle File Upload
        if (req.file) {
            cloudinaryResponse = await uploadOnCloudinary(req.file.path);

            if (cloudinaryResponse && cloudinaryResponse.secure_url) {
                postData.image = cloudinaryResponse.secure_url;
                // Pro Tip: Store the public_id in your DB for easy deletion later
                postData.imagePublicId = cloudinaryResponse.public_id;
            } else {
                throw new Error("Cloudinary upload failed");
            }
        }

        // 2. Create Post 
        // This triggers the middleware to increment user.postCount automatically!
        const newPost = await Post.create(postData);

        return res.status(201).json({
            message: "Post created successfully",
            newPost
        });

    } catch (error) {
        //If DB save fails but image was uploaded,
        if (cloudinaryResponse && cloudinaryResponse.public_id) {
            await deleteFromCloudinary(cloudinaryResponse.public_id);
        }

        return res.status(500).json({
            message: "Create post error",
            error: error.message
        });
    }
};

export const deletePost = async (req, res) => {
    const { postId } = req.params
    try {

        // 1. Find the post first to get the Image Public ID
        const post = await Post.findOne({ _id: postId, author: req.userId });
        if (!post) {
            return res.status(404).json({ message: "Post not found or unauthorized" });
        }
        // 2. Delete from Cloudinary if image exists
        if (post.imagePublicId) {
            await deleteFromCloudinary(post.imagePublicId);
        }
        // 3. Delete from MongoDB
        // Using findOneAndDelete triggers the 'post' middleware to decrease postCount!
        await Post.findOneAndDelete({ _id: postId, author: req.userId });
        return res.status(200).json({ message: "Post deleted successfully" });

    } catch (error) {
        return res.status(500).json({ message: "Delete error", error: error.message });
    }


}

export const getPost = async (req, res) => {
    console.log(req.query.limit, req.query.cursor)
    try {
        const limit = Number(req.query.limit) || 10;
        const cursor = req.query.cursor ? JSON.parse(req.query.cursor)
            : null;

        const query = cursor
            ? {
                $or: [
                    { createdAt: { $lt: cursor.createdAt } },
                    {
                        createdAt: cursor.createdAt,
                        _id: { $lt: cursor._id }
                    }
                ]
            }
            : {}


        const posts = await Post
            .find(query)
            .populate("author", "firstName lastName profileImage headline")
            .populate("comments.user", "firstName lastName profileImage")
            .sort({ createdAt: -1, _id: -1 })
            .limit(limit + 1) // fetch one extra
            .lean();
        // console.log(posts)
        const hasMore = posts.length > limit;
        if (hasMore) posts.pop();

        const lastPost = posts[posts.length - 1];

        const nextCursor = hasMore && lastPost
            ? {
                createdAt: lastPost.createdAt,
                _id: lastPost._id
            }
            : null;
        posts.forEach(p => {
            p.status = "temp"
        });
        res.status(200).json({
            post: posts,
            nextCursor,
            message: "post fetched Successfully"
        });

    } catch (error) {
        return res.status(500).json({ message: "getPost error", error })
    }
}

export const like = async (req, res) => {
    try {
        let postId = req.params.id
        let userId = req.userId


        let post = await Post.findById(postId).populate([
            {
                // 1. Populate the Post Author
                path: "author",
                select: "firstName lastName profileImage headline"
            },
            {
                // 2. Populate the remaining Comments' Users
                path: "comments.user",
                select: "firstName lastName profileImage"
            }
        ]);
        if (!post) {
            return res.status(400).json({ message: "post not found" })
        }
        if (post.like.includes(userId)) {
            // console.log("includes");

            post.like = post.like.filter((id) => id != userId)
        }
        else {
            // console.log("not includes");

            post.like.push(userId)
        }
        await post.save()
        // io.emit("likeUpdated", { postId, likes: post.like })

        return res.status(200).json({ message: "post like/unlike successful", post })

    } catch (error) {
        return res.status(500).json({ message: `like error ${error}` })
    }
}

export const comment = async (req, res) => {
    try {
        let postId = req.params.postId

        let userId = req.userId
        let { content } = req.body

        let post = await Post.findByIdAndUpdate(postId, {
            $push: { comments: { content, user: userId } }
        }, { new: true }).populate([
            {
                // 1. Populate the Post Author
                path: "author",
                select: "firstName lastName profileImage headline"
            },
            {
                // 2. Populate the remaining Comments' Users
                path: "comments.user",
                select: "firstName lastName profileImage"
            }
        ]);

        io.emit("commentAdded", { postId, comm: post.comments })
        return res.status(200).json({ message: "comment posted successfully", post })
    } catch (error) {
        return res.status(500).json({ message: `failed to comment due to ${error}` })
    }
}

export const deleteComment = async (req, res) => {
    try {
        const { postId, commentId } = req.params
        let userId = req.userId

        const updatedPost = await Post.findOneAndUpdate(
            { _id: postId },
            { $pull: { comments: { _id: commentId, user: userId } } },
            { new: true }
        ).populate([
            {
                // 1. Populate the Post Author
                path: "author",
                select: "firstName lastName profileImage headline"
            },
            {
                // 2. Populate the remaining Comments' Users
                path: "comments.user",
                select: "firstName lastName profileImage"
            }
        ]);
        console.log(updatedPost)
        if (!updatedPost) {
            return res.status(404).json({ message: "Post or Comment not found" });
        }

        // io.emit("commentDeleted", { postId, post: updatedPost })

        return res.status(200).json({
            message: "Comment deleted successfully",
            post: updatedPost
        });
    } catch (error) {
        return res.status(500).json({ message: `failed to delete comment due to ${error}` })
    }
}

export const editComment = async (req, res) => {
    try {
        const { postId, commentId } = req.params
        let userId = req.userId
        const { newContent } = req.body

        const updatedPost = await Post.findOneAndUpdate(
            { _id: postId, "comments._id": commentId, "comments.user": userId },
            {
                $set: {
                    "comments.$.content": newContent,
                    "comments.$.isEdited": true,
                    "comments.$.updatedAt": Date.now()
                }
            },
            { new: true }
        ).populate([
            {
                // 1. Populate the Post Author
                path: "author",
                select: "firstName lastName profileImage headline"
            },
            {
                // 2. Populate the remaining Comments' Users
                path: "comments.user",
                select: "firstName lastName profileImage"
            }
        ]);
        // console.log(updatedPost)
        if (!updatedPost) {
            return res.status(404).json({ message: "Post or Comment not found" });
        }

        // io.emit("commentDeleted", { postId, comments: updatedPost.comments })

        return res.status(200).json({
            message: "Comment editted successfully",
            post: updatedPost
        });
    } catch (error) {
        return res.status(500).json({ message: `failed to delete comment due to ${error}` })
    }
}
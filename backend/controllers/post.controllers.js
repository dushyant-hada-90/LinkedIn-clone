import Post from "../models/post.models.js"
import uploadOnCloudinary from "../config/cloudinary.js"
import { io } from "../index.js"

export const createPost = async (req, res) => {
    try {
        // console.log(req.file);
        let { description } = req.body
        let newPost
        if (req.file) {
            let image = await uploadOnCloudinary(req.file.path)
            newPost = await Post.create({
                author: req.userId,
                description,
                image
            })
        }
        else {
            newPost = await Post.create({
                author: req.userId,
                description
            })
        }
        return res.status(201).json({ message: "post created successfully", newPost })
    } catch (error) {
        return res.status(500).json({ message: `create post erroer ${error}` })
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
            .populate("comment.user", "firstName lastName profileImage")
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


        let post = await Post.findById(postId)
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
        io.emit("likeUpdated", { postId, likes: post.like })

        return res.status(200).json({ message: "post like/unlike successful", post })

    } catch (error) {
        return res.status(500).json({ message: `like error ${error}` })
    }
}

export const comment = async (req, res) => {
    try {
        let postId = req.params.id

        let userId = req.userId
        let { content } = req.body

        let post = await Post.findByIdAndUpdate(postId, {
            $push: { comment: { content, user: userId } }
        }, { new: true }).populate("comment.user", "firstName lastName profileImage headline")

        io.emit("commentAdded", { postId, comm: post.comment })
        return res.status(200).json({ message: "comment posted successfully", post })
    } catch (error) {
        return res.status(500).json({ message: `failed to comment due to ${error}` })
    }
}
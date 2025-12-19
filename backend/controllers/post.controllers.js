import Post from "../models/post.models.js"
import uploadOnCloudinary from "../config/cloudinary.js"
import { io } from "../index.js"

export const createPost = async (req, res) => {
    try {
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
        return res.status(500).json({ message: `create post erroe ${error}` })
    }
}

export const getPost = async (req, res) => {
    try {
        const post = await Post
        .find()
        .populate("author", "firstName lastName profileImage headline")
        .sort({ createdAt: -1 })
        .populate("comment.user","firstName lastName profileImage")
        return res.status(200).json({ message: "post fetched Successfully", post })
    } catch (error) {
        return res.status(500).json({ message: "getPost error" })
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
        io.emit("likeUpdated",{postId,likes:post.like})
        
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

        io.emit("commentAdded",{postId,comm:post.comment})
        return res.status(200).json({ message: "comment posted successfully", post })
    } catch (error) {
        return res.status(500).json({ message: `failed to comment due to ${error}` })
    }
}
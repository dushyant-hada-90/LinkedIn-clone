import express from "express"
import { createPost, getPost, like,comment, deletePost, deleteComment, editComment } from "../controllers/post.controllers.js"
import isAuth from "../middlewares/isAuth.js"
import upload from "../middlewares/multer.js"

const postRouter = express.Router()

postRouter.post("/create",isAuth,upload.single("image"),createPost)
postRouter.delete("/delete",isAuth,upload.single("image"),deletePost)
postRouter.get("/getpost",isAuth,getPost)
postRouter.get("/like/:id",isAuth,like)
postRouter.post("/comment/:postId",isAuth,comment)
postRouter.delete("/deletecomment/:postId/:commentId",isAuth,deleteComment)
postRouter.post("/editcomment/:postId/:commentId",isAuth,editComment)

export default postRouter 
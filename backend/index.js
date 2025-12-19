import express from "express"
import dotenv from "dotenv"
import connectDb from "./config/db.js"
import authRouter from "./routes/auth.routes.js"
import cookieParser from "cookie-parser";
import cors from 'cors'
import userRouter from "./routes/user.routes.js";
import postRouter from "./routes/post.routes.js";
import connectiontRouter from "./routes/connection.routes.js"
import http from "http"
import { Server } from "socket.io";

dotenv.config()
let port = process.env.PORT || 5000
let FRONTEND_URL = process.env.FRONTEND_URL
let app = express()
let server = http.createServer(app)
export const io = new Server(server, {
    cors: ({
        origin: FRONTEND_URL,
        credentials: true
    })
})


app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({
    origin: FRONTEND_URL,
    credentials: true
}))


app.get("/", (req, res) => {
    res.send("hello")
})


app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/post", postRouter)
app.use("/api/connection", connectiontRouter)

export const userSocketMap = new Map()

io.on("connection",(socket)=>{
    console.log("user connected",socket.id);
    socket.on("register",(userId)=>{
        userSocketMap.set(userId,socket.id)
    })
    socket.on("disconnect",(socket)=>{
        console.log("user disconnected",socket.id);
    })
})
server.listen(port, () => {
    connectDb()
    console.log(`server started on ${port}`);
})
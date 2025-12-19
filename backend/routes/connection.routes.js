import express from "express"
import isAuth from "../middlewares/isAuth.js"
import {acceptConnection, getConnectionRequests, getConnectionStatus, getUserConnection, rejectConnection, removeConnection, sendConnection} from "../controllers/connection.controllers.js"
let connectionRouter = express.Router()

connectionRouter.post("/send/:id",isAuth,sendConnection)
connectionRouter.put("/accept/:connectionId",isAuth,acceptConnection)
connectionRouter.put("/reject/:connectionId",isAuth,rejectConnection)
connectionRouter.get("/getstatus/:userId",isAuth,getConnectionStatus)
connectionRouter.delete("/remove/:userId",isAuth,removeConnection)
connectionRouter.get("/requests",isAuth,getConnectionRequests)
connectionRouter.get("/connection",isAuth,getUserConnection)

export default connectionRouter
import Connection from "../models/connection.models.js"
import User from "../models/user.model.js"
import { io, userSocketMap } from "../index.js"


export const sendConnection = async (req, res) => {
    try {
        let { id } = req.params //receiver
        let sender = req.userId
        let user = await User.findById(sender)
        if (sender == id) {
            return res.status(400).json({ message: "you can't send request to yourself" })
        }
        if (user.connection.includes(id)) {
            return res.status(400).json({ message: "you are already connected" })
        }
        let existingConnection = await Connection.findOne({
            sender,
            receiver: id,
            status: "pending"
        })
        if (existingConnection) {
            return res.status(400).json({ message: "request already send" })
        }

        let newRequest = await Connection.create({
            sender,
            receiver: id
        })

        let receiverSocketId = userSocketMap.get(id)
        let senderSocketId = userSocketMap.get(sender)

        if (receiverSocketId) {
            io.to(receiverSocketId).emit("statusUpdated", { updatedUserId: sender, newStatus: "received" })
        }
        if (senderSocketId) {
            io.to(senderSocketId).emit("statusUpdated", { updatedUserId: id, newStatus: "pending" })
        }
        return res.status(200).json({ message: "connection request sent successfully" })
    } catch (error) {
        return res.status(500).json({ message: `sendConnection error -> ${error}` })
    }
}

export const acceptConnection = async (req, res) => {
    try {
        let { connectionId } = req.params
        let connection = await Connection.findById(connectionId)
        if (!connection) {
            return res.status(400).json({ message: "connection does not exist" })
        }
        if (connection.status != "pending") {
            return res.status(400).json({ message: "request under process" })
        }
        connection.status = "accepted"
        await connection.save()
        await User.findByIdAndUpdate(req.userId, {
            $addToSet: { connection: connection.sender._id }
        })
        await User.findByIdAndUpdate(connection.sender._id, {
            $addToSet: { connection: req.userId }
        })

        let receiverSocketId = userSocketMap.get(connection.receiver._id.toString())
        let senderSocketId = userSocketMap.get(connection.sender._id.toString())

        if (receiverSocketId) {
            io.to(receiverSocketId).emit("statusUpdated", { updatedUserId: connection.sender._id, newStatus: "disconnect" })
        }
        if (senderSocketId) {
            io.to(senderSocketId).emit("statusUpdated", { updatedUserId: connection.receiver._id, newStatus: "disconnect" })
        }

        return res.status(200).json({ message: "connection accepted" })
    } catch (error) {
        return res.status(500).json({ message: `error while acceptinc connection -> ${error}` })
    }
}
export const rejectConnection = async (req, res) => {
    try {
        let { connectionId } = req.params
        let connection = await Connection.findById(connectionId)
        if (!connection) {
            return res.status(400).json({ message: "connection does not exist" })
        }
        if (connection.status != "pending") {
            return res.status(400).json({ message: "request under process" })
        }
        connection.status = "rejected"
        await connection.save()

        
        return res.status(200).json({ message: "connection rejected" })
    } catch (error) {
        return res.status(500).json({ message: `error while rejecting connection -> ${error}` })
    }
}

export const getConnectionStatus = async (req, res) => {
    try {
        const targetUserId = req.params.userId
        const currentUserId = req.userId

        let currentUser = await User.findById(currentUserId)
        if (currentUser.connection.includes(targetUserId)) {
            return res.json({ status: "disconnect" }) //if already connected then connection button should show disconnect
        }

        const pendingRequest = await Connection.findOne({
            $or: [
                { sender: currentUserId, receiver: targetUserId },
                { sender: targetUserId, receiver: currentUserId },
            ],
            status: "pending"
        })
        if (pendingRequest) {
            if (pendingRequest.sender.toString() === currentUserId.toString()) {
                return res.json({ status: "pending" })
            }
            if (pendingRequest.receiver.toString() === currentUserId.toString()) {
                return res.json({ status: "received", requestId: pendingRequest._id })
            }
        }

        return res.json({status: "connect" })
    } catch (error) {
        return res.status(500).json({ message: `getConnectionStatusError -> ${error}` })
    }
}

export const removeConnection = async (req, res) => {
    try {
        const myId = req.userId
        const otherUserId = req.params.userId

        await User.findByIdAndUpdate(myId, {
            $pull: { connection: otherUserId }
        })
        await User.findByIdAndUpdate(otherUserId, {
            $pull: { connection: myId }
        })

        let receiverSocketId = userSocketMap.get(otherUserId)
        let senderSocketId = userSocketMap.get(myId)

        if (receiverSocketId) {
            io.to(receiverSocketId).emit("statusUpdated", { updatedUserId: myId, newStatus: "connect" })
        }
        if (senderSocketId) {
            io.to(senderSocketId).emit("statusUpdated", { updatedUserId: otherUserId, newStatus: "connect" })
        }
        return res.status(200).json({ message: "connection removed successsfully" })

    } catch (error) {
        return res.status(500).json({ message: ` error in removeConnection ->  ${error}` })

    }
}

export const getConnectionRequests = async (req, res) => {
    try {
        const userId = req.userId
        const requests = await Connection.find({ receiver: userId, status: "pending" })
            .populate("sender", "firstName lastName email userName profileImage headline")

        return res.status(200).json({ message: "requests fetched successfully", requests })
    } catch (error) {
        return res.status(500).json({ message: `error while fetching requests -> ${error}` })

    }
}

export const getUserConnection = async (req, res) => {
    try {
        const userId = req.userId
        const user = await User.findById(userId).populate(
            "connection", "firstName lastNamee profileImage headline connection"
        )

        return res.status(200).json({ message: "userConnection fetched successfully", connection: user.connection })
    } catch (error) {
        return res.status(500).json({ message: `error in getUserConnection -> ${error}` })
    }
}
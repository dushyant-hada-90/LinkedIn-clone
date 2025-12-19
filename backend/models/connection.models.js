import mongoose from "mongoose"

let connectionSchema = new mongoose.Schema({
    sender:{
        type:mongoose.Types.ObjectId,
        ref:"User"
    },
    receiver:{
        type:mongoose.Types.ObjectId,
        ref:"User"
    },
    status:{
        type:String,
        enum:["pending","accepted","rejected"],
        default:"pending"
    }
},{timestamps:true})

const Connection = mongoose.model("Connection",connectionSchema)
export default Connection
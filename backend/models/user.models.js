import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        default:""
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        default:""

    },
    profileImage: {
        type: String,
        default: ""
    },
    coverImage: {
        type: String,
        default: ""
    },
    headline: {
        type: String,
        default: ""
    },
    skills: [
        { type: String }
    ],
    education: [
        {
            college: { type: String },
            degree: { type: String },
            fieldOfStudy: { type: String },
        }
    ],
    location: {
        type: String,
        default: "India"
    },
    gender: {
        type: String,
        enum: ["male", "female", "other"]
    },
    experience: [
        {
            title: { type: String },
            company: { type: String },
            description: { type: String }
        }
    ],
    connection: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    authProvider: {
        type: String,
        enum: ["local", "google", "github", "apple"],
        default: "local"

    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    postCount: { type: Number, default: 0 }, // Industry standard: "Counter Cache"

}, { timestamps: true })

const User = mongoose.model("User", userSchema)
export default User
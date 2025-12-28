import User from "../models/user.models.js"
import {uploadOnCloudinary,deleteFromCloudinary} from "../config/cloudinary.js"


export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password")
        if (!user) {
            return res.status(400).json({ message: "user not found", userId: req.userId })
        }
        return res.status(200).json({ user, message: 'user fetched successfully' })

    } catch (error) {
        return res.status(400).json({ message: "get current user error" })
    }
}


export const updateProfile = async (req, res) => {
    try {
        let { firstName, lastName, userName, headline, location, gender, skills, education, experience } = req.body
        skills = req.body.skills ? JSON.parse(req.body.skills) : []
        experience = req.body.experience ? JSON.parse(req.body.experience) : []
        education = req.body.education ? JSON.parse(req.body.education) : []

        let userData = { firstName, lastName, userName, headline, location, gender, skills, education, experience, }
        let profileImageCloudinaryResponse
        let coverImageCloudinaryResponse
        console.log(req.files)

        if (req.files && req.files.profileImage) {
            profileImageCloudinaryResponse = await uploadOnCloudinary(req.files.profileImage[0].path)

            if (profileImageCloudinaryResponse && profileImageCloudinaryResponse.secure_url) {
                userData.profileImage = profileImageCloudinaryResponse.secure_url;
                // Pro Tip: Store the public_id in your DB for easy deletion later
                userData.profileImagePublicId = profileImageCloudinaryResponse.public_id;
            } else {
                throw new Error("Cloudinary upload failed for profile Image");
            }
        }
        if (req.files && req.files.coverImage) {
            coverImageCloudinaryResponse = await uploadOnCloudinary(req.files.coverImage[0].path)

            if (coverImageCloudinaryResponse && coverImageCloudinaryResponse.secure_url) {
                userData.coverImage = coverImageCloudinaryResponse.secure_url;
                // Pro Tip: Store the public_id in your DB for easy deletion later
                userData.coverImagePublicId = coverImageCloudinaryResponse.public_id;
            } else {
                throw new Error("Cloudinary upload failed for cover Image");
            }
        }
        let user = await User.findByIdAndUpdate(req.userId, userData, { new: true }).select("-password")

        return res.status(200).json({ user, message: "user updated successfully" })
    } catch (error) {
        //If DB save fails but image was uploaded,
        if (coverImageCloudinaryResponse && coverImageCloudinaryResponse.public_id) {
            await deleteFromCloudinary(coverImageCloudinaryResponse.public_id);
        }
        if (profileImageCloudinaryResponse && profileImageCloudinaryResponse.public_id) {
            await deleteFromCloudinary(profileImageCloudinaryResponse.public_id);
        }
        console.log("catch", "unable to update user", error);
        return res.status(500).json({ message: "update user failed" })
    }
}
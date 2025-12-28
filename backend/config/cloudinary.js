import {v2 as cloudinary} from "cloudinary"
import fs from "fs"
const uploadOnCloudinary = async (filePath)=>{
    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
    });
    try {
        if(!filePath){
            return null
        }
        // Upload an image
        const uploadResult = await cloudinary.uploader
        .upload(filePath)
        .catch((error) => {
            console.log(error);
        });
        // delete from multer
        fs.unlinkSync(filePath)
        return uploadResult
        
        // console.log(uploadResult);
    } catch (error) {
        fs.unlinkSync(filePath)
        console.log(error);
    }
}


const deleteFromCloudinary = async (publicId) => {
    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    try {
        if (!publicId) return null;

        // Use the uploader.destroy method
        const response = await cloudinary.uploader.destroy(publicId);
        
        console.log("Deleted from Cloudinary:", response);
        return response;
    } catch (error) {
        console.error("Cloudinary Delete Error:", error);
        return null;
    }
};

export { deleteFromCloudinary,uploadOnCloudinary };
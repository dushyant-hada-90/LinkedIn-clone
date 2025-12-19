import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

// Get absolute path of the current directory
const __filename = fileURLToPath(import.meta.url); //tells the current file path of multer.js regardless of on whose system it is dev or prod
// console.log(__filename,"---")
const __dirname = path.dirname(__filename); // tells the immediate parent of multer.js
// console.log(__dirname) 

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Use path.join to ensure the path is absolute
        cb(null, path.join(__dirname, '../public/uploads')); 
    },
    filename: (req, file, cb) => {
        // Create a unique name: timestamp + original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit for security
});

export default upload;
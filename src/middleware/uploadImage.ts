import multer from 'multer';
import { Request } from 'express';
import path from 'path';
import fs from 'fs';

const uploadDir = path.resolve('./uploads'); // Path to your upload directory
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true }); // Create folder if it doesn't exist
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Upload folder path
    },
    filename: (req, file, cb) => {
        console.log("file",file)
        const uniqueName = `${req.user.firstName}_${Date.now()}_${file.originalname}`;
        cb(null, uniqueName); // Unique filename with extension
    },
});

// File type validation
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and JPG are allowed.'));
    }
};

// Multer instance with validation and limits
const upload: multer.Multer = multer({
    storage,
    // fileFilter,
        // limits: {
        //     fileSize: 2 * 1024 * 1024, // Limit file size to 2MB
        // },
});

// Export middleware
export default upload;

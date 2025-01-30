require('dotenv').config(); // Ensure env variables are loaded

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

console.log("Cloudinary Config:", process.env.CLOUD_NAME, process.env.CLOUD_API_KEY, process.env.CLOUD_API_SECRET); // Debugging log

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY, 
    api_secret: process.env.CLOUD_API_SECRET    
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'wanderlus_DEV',
        allowedFormats: ['jpeg', 'png', 'jpg'],
    },
});

module.exports = { cloudinary, storage };

const { v2: cloudinary } = require("cloudinary");

class CloudinaryService {
    constructor() {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
            secure: true,
        });
    }

    upload(file, folder, options = {}) {
        return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder, resource_type: "image", ...options },
                (error, result) => {
                    if (error || !result) {
                        return reject(new Error("Failed to upload image"));
                    }
                    resolve({ path: result.secure_url, filename: result.public_id });
                }
            );
            stream.end(file.buffer);
        });
    }

    uploadMany(files, folder, options = {}) {
        return Promise.all(files.map((f) => this.upload(f, folder, options)));
    }

   
    async delete(publicId) {
        return cloudinary.uploader.destroy(publicId);
    }
}

module.exports = new CloudinaryService(); // singleton
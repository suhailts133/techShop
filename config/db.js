const mongoose  = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_ATLAS_URI);
        console.log("DB Connected")
    } catch (error) {
        console.log("DB connection error", error.message);
        process.exit(1)
    }
}

module.exports = connectDB;
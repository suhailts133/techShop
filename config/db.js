const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const isProd = process.env.NODE_ENV === "production";
    const uri = isProd ? process.env.MONGODB_ATLAS_URI : process.env.MONGODB_URI;

    if (!uri) {
      throw new Error(
        `MongoDB connection string is missing for environment: "${process.env.NODE_ENV || "development"}"`
      );
    }

    // Attach listeners once for runtime drops
    mongoose.connection.on("error", (err) => {
      console.error("Mongoose runtime connection error:", err.message);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("Mongoose connection disconnected.");
    });

    const conn = await mongoose.connect(uri);

    console.log(`DB Connected: ${conn.connection.host} (${conn.connection.name})`);
  } catch (error) {
    console.error("DB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
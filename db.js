require("dotenv").config();
const mongoose = require("mongoose");

const mongoURI = process.env.MONGO_URI;

const connectDB = async () => {
  if (!mongoURI) {
    console.error("MongoDB URI is undefined! Check your .env file.");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("MongoDB Connected...");
  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;

const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    password: { type: String, required: true },
    createdAt: { type: String, default: () => new Date().toLocaleString("en-US", { timeZone: "UTC" }) }
});

module.exports = mongoose.model("User", UserSchema);

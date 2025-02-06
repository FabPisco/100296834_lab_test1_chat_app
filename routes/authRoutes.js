const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// The signup
router.post("/signup", async (req, res) => {
    try {
        const { username, firstname, lastname, password } = req.body;

        // see if exist
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ message: "Username already exists" });

        // mashing passwoed
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // creating the new user
        const newUser = new User({ username, firstname, lastname, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: "User created successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

// log in
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        // Cchecking the user
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        // also verefying the password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        // the token genereator
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.status(200).json({ token, username: user.username });
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;

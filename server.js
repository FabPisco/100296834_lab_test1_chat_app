require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./db");
const User = require ("./models/User");

// this where i import the  authRoutes
const authRoutes = require("./routes/authRoutes");  
const GroupMessage = require("./models/GroupMessage");  


// The exprees app 
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

// we connect here  MongoDB
connectDB();

// Here goes the middleweare 
app.use(cors());
app.use(express.json());

// public directory
app.use(express.static("public"))

// db connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.error("MongoDB Connection Error:", err));

// routes Auth
app.use("/api/auth", authRoutes); 

// the simople route
app.get("/", (req, res) => {
    res.send("Chat App Backend is Running");
});

// starting the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// the event handling for socket io
io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // We join the room here
    socket.on("joinRoom", ({ username, room }) => {
        socket.join(room);
        console.log(`${username} joined room: ${room}`);

        // we notify otheres about the room
        socket.to(room).emit("message", { from_user: "System", message: `${username} has joined the room.` });
    });

    // handling the messages
    socket.on("chatMessage", async ({ from_user, room, message }) => {
        const newMessage = new GroupMessage({ from_user, room, message });
        await newMessage.save();

        io.to(room).emit("message", { from_user, message });
    });

    // Typing inicater handling
    socket.on("typing", ({ username, room }) => {
        socket.to(room).emit("displayTyping", { username });
    });

    // leaving the room
    socket.on("leaveRoom", ({ username, room }) => {
        socket.leave(room);
        console.log(`${username} left room: ${room}`);

        // notification to others about the room
        socket.to(room).emit("message", { from_user: "System", message: `${username} has left the room.` });
    });

    // disconnecting
    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
    });
    
});

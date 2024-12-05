import express from "express";
import authRoute from "./routes/authRoute.js"
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import messageRoute from "./routes/messageRoute.js"
import {app, server} from "./lib/socket.js"
import path from "path"



app.use(express.json({limit:"15mb"}));
app.use(cookieParser());
app.use(express.urlencoded({ limit: '15mb', extended: true })); // For URL-encoded data
app.use(cors({  origin: "http://localhost:5173",  credentials: true,}));

dotenv.config();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();


app.use("/api/auth", authRoute);
app.use("/api/messages", messageRoute);

if (process.env.NODE_ENV === "production") {
     app.use(express.static(path.join(__dirname, "../frontend/dist")));
   
     app.get("*", (req, res) => {
       res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
     });
}

server.listen(PORT, () => console.log(`Server Is Running On Post : ${PORT}`));
connectDB();
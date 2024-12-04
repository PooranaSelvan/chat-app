import express from "express";
import authRoute from "./routes/authRoute.js"
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import messageRoute from "./routes/messageRoute.js"

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
     cors({
       origin: "http://localhost:5173",
       credentials: true,
     })
);

dotenv.config();
const PORT = process.env.PORT || 5000;


app.use("/api/auth", authRoute);
app.use("api/messages", messageRoute)

app.listen(PORT, () => console.log(`Server Is Running On Post : ${PORT}`));
connectDB();
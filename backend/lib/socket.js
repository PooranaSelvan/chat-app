import { Server } from "socket.io";
import http from "http";
import express from "express";

// decalring express
const app = express();

// creating new http server with express.
const server = http.createServer(app);

// cors.
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];

  // it stores userId like this:

  // const userSocketMap = {
  //   user1: "socketId_123",
  //   user2: "socketId_456",
  //   user3: "socketId_789",
  // };
  
}

//  to store online users
const userSocketMap = {}; // {userId: socketId}

// When a client connects to the server, the connection event is triggered, and the socket object represents the connection.
io.on("connection", (socket) => {
  // console.log("A user connected", socket.id);


  // This retrieves the userId from the query parameters sent during the WebSocket handshake.
  // The client must pass the userId when initiating the connection (e.g., io.connect({ query: { userId: "someUserId" } })).
  const userId = socket.handshake.query.userId;

  // Adds the userId and its associated socket.id to the userSocketMap object.
  if (userId) userSocketMap[userId] = socket.id;

  // eg:
  // const userSocketMap = {
  //   user1: "socketId_123",
  //   user2: "socketId_456",
  // };
  

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // it triggers when a user disconnects.
  // it removes the userId from the userSocketMap
  socket.on("disconnect", () => {
    // console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
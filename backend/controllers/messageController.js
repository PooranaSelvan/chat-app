import User from "../model/userModel.js";
import Message from "../model/messageModel.js"
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
     try {
       // getting userId from frontend
       const loggedInUserId = req.user._id;
       // finding other user except the logged user.
       // { $ne: loggedInUserId } --  this is what is means.
       const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
   
       res.status(200).json(filteredUsers);
     } catch (error) {
       console.error("Error in getUsersForSidebar: ", error.message);
       res.status(500).json({ error: "Internal server error" });
     }
};
   
export const getMessages = async (req, res) => {
     try {

      // get the id from fronten.=d.
       const { id: userToChatId } = req.params;
       const myId = req.user._id;
   
        // it is used to get the message sent by current user to another user & used to get the message sent by other user to current user.
        const messages = await Message.find({
          $or: [
            { senderId: myId, receiverId: userToChatId },
            { senderId: userToChatId, receiverId: myId },
          ],
        });
   
       res.status(200).json(messages);
     } catch (error) {
       console.log("Error in getMessages controller: ", error.message);
       res.status(500).json({ error: "Internal server error" });
     }
};
   
export const sendMessage = async (req, res) => {
     try {

      // getting text, image, sendingUser id, receivingUser id.
       const { text, image } = req.body;
       const { id: receiverId } = req.params;
       const senderId = req.user._id;
   
       // uploading image to the cloudinary.
       let imageUrl;
       if (image) {
         // Upload base64 image to cloudinary
         const uploadResponse = await cloudinary.uploader.upload(image);
         imageUrl = uploadResponse.secure_url;
       }
   
       // creating a obj
       const newMessage = new Message({
         senderId,
         receiverId,
         text,
         image: imageUrl,
       });
   
       // saving into db.
       await newMessage.save();
   
       // getting receivers socket id.
       const receiverSocketId = getReceiverSocketId(receiverId);

       // socketID is true sending a message in real timer user socket.io 
       if (receiverSocketId) {
         io.to(receiverSocketId).emit("newMessage", newMessage);
       }
   
       res.status(201).json(newMessage);
     } catch (error) {
       console.log("Error in sendMessage controller: ", error.message);
       res.status(500).json({ error: "Internal server error" });
     }
};

export const deleteMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params; // Get the message ID from the URL params
    const userId = req.user._id; // Get the logged-in user's ID

    // Find the message by ID
    const message = await Message.findById(messageId);

    // Check if the message exists
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Check if the user is the sender of the message
    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ error: "You are not authorized to delete this message" });
    }

    // Delete the message
    await message.deleteOne();

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error in deleteMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

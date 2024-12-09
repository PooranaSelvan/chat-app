import { create } from "zustand";
import toast from "react-hot-toast"; 
import { axiosInstance } from "../lib/axios"; 
import { useAuthStore } from "./useAuthStore";

// Creating a Zustand store similar to redux/toolkit.
export const useChatStore = create((set, get) => ({
  messages: [], // Array to store chat messages
  users: [], // Array to store users involved in the chat
  selectedUser: null, // Stores the currently selected user for chat
  isUsersLoading: false, // Indicates if user data is being loaded
  isMessagesLoading: false, // Indicates if messages are being loaded

  // Method to fetch all users for chat
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data }); // Update users array with the fetched data
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false }); 
    }
  },

  // Method to fetch messages for a specific user
  getMessages: async (userId) => {
    set({ isMessagesLoading: true }); 
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data }); // Update messages array with the fetched data
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  // Method to send a new message
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get(); // Get the selected user and current messages from the store
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] }); // Append the new message to the existing messages array
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  // Method to delete a message
  deleteMessage: async (messageId) => {
    const { messages } = get(); 
    try {
      await axiosInstance.delete(`/messages/delete/${messageId}`);
      set({
        messages: messages.filter((message) => message._id !== messageId), // Remove the deleted message from the messages array
      });
      toast.success("Message deleted successfully.");
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.error || "Failed to delete message.");
    }
  },

  // Method to subscribe to real-time message updates via socket
  subscribeToMessages: () => {
    const { selectedUser } = get(); // Get the selected user from the store
    if (!selectedUser) return; // Exit if no user is selected

    const socket = useAuthStore.getState().socket; // Get the socket instance from the auth store

    socket.on("newMessage", (newMessage) => { // Listening for new messages from the server
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id; // Check if the message is from the selected user
      if (!isMessageSentFromSelectedUser) return; // Ignore messages not from the selected user

      set({
        messages: [...get().messages, newMessage], // Append the new message to the existing messages array
      });
    });
  },

  // Method to unsubscribe from real-time message updates via socket
  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket; // Get the socket instance from the auth store
    socket.off("newMessage"); // Remove the listener for new messages
  },

  // Method to set the selected user for chat
  setSelectedUser: (selectedUser) => set({ selectedUser }), // Update the selected user in the store
}));

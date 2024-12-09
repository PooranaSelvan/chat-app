import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import { toast } from "react-hot-toast";
import { io } from "socket.io-client";


// Setting the base URL depending on the environment (development or production)
const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:5000" : "/";

// Creating a Zustand store for authentication and user management
// it was similar to redux/toolkit.

export const useAuthStore = create((set, get) => ({
  // State declarations
  authUser: null, // Holds the authenticated user's data
  isSigningUp: false, // Indicates if a signup request is in progress
  isLoggingIn: false, // Indicates if a login request is in progress
  isUpdatingProfile: false, // Indicates if a profile update is in progress
  isCheckingAuth: true, // Indicates if the app is checking user authentication status
  onlineUsers: [], // Stores a list of online users
  socket: null, // Holds the socket instance for real-time communication

  // Method to check the authentication status of the user
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data }); // Updating the state with authenticated user data
      get().connectSocket(); // Connecting to the socket if authenticated
    } catch (err) {
      set({ authUser: null }); // Clearing the state if authentication fails
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  // Method to handle user signup
  signup: async (data) => {
    set({ isSigningUp: true }); // Setting signup in-progress state
    try {
      const res = await axiosInstance.post("/auth/signup", data); // Sending signup data to the backend
      set({ authUser: res.data }); // Updating the state with the new user data
      toast.success("Account Created Successfully..");
      get().connectSocket(); // Connecting to the socket after signup
    } catch (err) {
      console.log(err); // Logging error in case of failure
    } finally {
      set({ isSigningUp: false });
    }
  },

  // Method to handle user login
  login: async (data) => {
    set({ isLoggingIn: true }); // Setting login in-progress state
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data }); // Updating the state with authenticated user data
      toast.success("Logged in successfully");
      get().connectSocket(); // Connecting to the socket after login
    } catch (err) {
      console.log(err); // Logging error in case of failure
      toast.error(err.response.data.message); // Displaying error message in toast.
    } finally {
      set({ isLoggingIn: false });
    }
  },

  // Method to handle user logout
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null }); // Clearing the authenticated user data
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message); // Displaying error message
    }
  },

  // Method to update the user's profile
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true }); // Setting profile update in-progress state
    try {
      const res = await axiosInstance.put("/auth/updateProfile", data);
      if (res.data) {
        set({ authUser: res.data }); // Updating the state with new profile data
        toast.success("Profile updated successfully");
      } else {
        throw new Error("No data received from server");
      }
    } catch (error) {
      console.error("Error in update profile:", error); // Logging error
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  // Method to delete the user's account
  deleteAccount: async () => {
    const { authUser, disconnectSocket } = get();

    if (!authUser) {
      toast.error("No authenticated user found");
      return;
    }

    try {
      await axiosInstance.delete(`/auth/delete/${authUser._id}`); // Sending a delete request with user ID
      set({ authUser: null }); // Clearing the authenticated user data
      disconnectSocket(); // Disconnecting the socket
      toast.success("Account deleted successfully");
    } catch (err) {
      console.error("Error deleting account:", err);
      toast.error(err.response?.data?.message || "Failed to delete account");
    }
  },

  // Method to connect the socket
  connectSocket: () => {
    const { authUser } = get(); // Getting the authenticated user state
    if (!authUser || get().socket?.connected) return; // Returning if no user or socket is already connected

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id, // Passing the user ID for socket.io connection
      },
    });
    socket.connect(); // Connecting the socket.io

    set({ socket: socket }); // Updating the state with the connected socket instance

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds }); // Updating the state with the list of online users
    });
  },

  // Method to disconnect the socket
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect(); // Disconnecting the socket if connected
  },
}));

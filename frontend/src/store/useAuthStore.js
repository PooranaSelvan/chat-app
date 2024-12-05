import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import { toast } from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:5000" : "/";

// creating a new store in zustand - it was similar to redux
export const useAuthStore = create((set, get) => ({
  // state decalaration
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      // if the data came set the data in "authUser" state
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (err) {
      // console.log(err);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account Created Successfully..");
      get().connectSocket();
    } catch (err) {
      console.log(err);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");

      get().connectSocket();
    } catch (err) {
      console.log(err);
      toast.error(err.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/updateProfile", data);
      if (res.data) {
        set({ authUser: res.data });
        toast.success("Profile updated successfully");
      } else {
        throw new Error("No data received from server");
      }
    } catch (error) {
      console.error("Error in update profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  deleteAccount: async () => {
    const { authUser, disconnectSocket } = get();
  
    if (!authUser) {
      toast.error("No authenticated user found");
      return;
    }
  
    try {
      // Use the userId from authUser
      await axiosInstance.delete(`/auth/delete/${authUser._id}`);
      set({ authUser: null }); // Clear the authenticated user
      disconnectSocket(); // Disconnect from socket if connected
      toast.success("Account deleted successfully");
    } catch (err) {
      console.error("Error deleting account:", err);
      toast.error(err.response?.data?.message || "Failed to delete account");
    }
  },
  

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));

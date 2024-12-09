import axios from "axios";

// creating axios instance that we can use it in anywhere.
export const axiosInstance = axios.create({
     baseURL : import.meta.env.MODE === "development" ? "http://localhost:5000/api" : "/api",
     withCredentials:true
});
import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/generateToken.js";
import User from  "../model/userModel.js"
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {

     // getting details from frontend
     const { fullName, email, password } = req.body;
     try {

       // if got details is not found
       if (!fullName || !email || !password) {
         return res.status(400).json({ message: "All fields are required" });
       }
   
       // checking pass length
       if (password.length < 6) {
         return res.status(400).json({ message: "Password must be at least 6 characters" });
       }
   
       // finding user in db with email
       const user = await User.findOne({ email });
   
       // if user found return err
       if (user) return res.status(400).json({ message: "Email already exists" });
   
       // user not found:

       // hash password
       const hashedPassword = await bcrypt.hash(password, 10);
   
       // create a new obj
       const newUser = new User({
         fullName,
         email,
         password: hashedPassword,
       });
   
       // if obj created
       if (newUser) {

         // generate jwt token 
         generateToken(newUser._id, res);

         // save it into db.
         await newUser.save();
   
         // return a res
         res.status(201).json({
           _id: newUser._id,
           fullName: newUser.fullName,
           email: newUser.email,
           profilePic: newUser.profilePic,
         });
       } else {
         res.status(400).json({ message: "Invalid user data" });
       }
     } catch (error) {
       console.log("Error in signup controller", error.message);
       res.status(500).json({ message: "Internal Server Error" });
     }
};
   
export const login = async (req, res) => {

     // getting mail, pass from frontend.
     const { email, password } = req.body;
     try {
       // finding user with email
       const user = await User.findOne({ email });
   
       // if not found return err
       if (!user) {
         return res.status(400).json({ message: "Invalid credentials" });
       }
   
       // if found compare with hashed pass
       const isPasswordCorrect = await bcrypt.compare(password, user.password);
       if (!isPasswordCorrect) {
         return res.status(400).json({ message: "Invalid credentials" });
       }
   
       // generate token
       generateToken(user._id, res);
   
       // return err
       res.status(200).json({
         _id: user._id,
         fullName: user.fullName,
         email: user.email,
         profilePic: user.profilePic,
       });
     } catch (error) {
       console.log("Error in login controller", error.message);
       res.status(500).json({ message: "Internal Server Error" });
     }
   };
   
export const logout = (req, res) => {
     try {
       // clearing all cookies 
       res.cookie("jwt", "", { maxAge: 0 });
       res.status(200).json({ message: "Logged out successfully" });
     } catch (error) {
       console.log("Error in logout controller", error.message);
       res.status(500).json({ message: "Internal Server Error" });
     }
};

export const updateProfile = async (req, res) => { 
  try {
    const { profilePic, fullName, email, currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user fields only if they are provided in the request
    if (fullName) user.fullName = fullName; // Change 'name' to 'fullName'
    if (email) user.email = email;

    // Handle profile picture update
    if (profilePic === '/avatar.png') {
      // If the profilePic is '/avatar.png', set the default image URL
      user.profilePic = '/avatar.png'; // This is the path to your default image in the public folder
    } else if (profilePic) {
      // If a new image is uploaded, handle Cloudinary upload
      const uploadResponse = await cloudinary.uploader.upload(profilePic);
      user.profilePic = uploadResponse.secure_url;
    }

    // Handle password change
    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }

    // Save the updated user
    const updatedUser = await user.save();

    // Return the updated user details (excluding the password)
    const { password, ...userDetails } = updatedUser.toObject();
    res.status(200).json(userDetails);
  } catch (error) {
    console.error("Error in update profile:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};



   
export const checkAuth = (req, res) => {
     try {
       res.status(200).json(req.user);
     } catch (error) {
       console.log("Error in checkAuth controller", error.message);
       res.status(500).json({ message: "Internal Server Error" });
     }
};

export const deleteUser = async (req, res) => {
  const { userId } = req.params;

  try {
    // Check if the user exists
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error" });
  }
};
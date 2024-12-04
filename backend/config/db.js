import mongoose from "mongoose";


const connectDb = async () => {
     try{
          mongoose.connect(process.env.MONGO_URI);
          console.log("Connected to MongoDB");
     } catch(err) {
          console.error(err);
     }
}

export default connectDb;
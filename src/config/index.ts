import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb+srv://iphonetechwinlabs:BxhCTnrFhi18IBZv@simplisticfishing.ducqxrt.mongodb.net/Lockbox';
    console.log(uri);
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Exit the process if the connection fails
  }
};

export default connectDB;

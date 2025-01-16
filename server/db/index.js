import mongoose from "mongoose";

export const connectToDatabase = async () => {
  console.log('與mongoose嘗試連接');
  

  if (mongoose.connection.readyState >= 1) return;

  try {
  console.log('與mongoose env');

    await mongoose.connect("mongodb+srv://admin:admin0925@rabbbe.3idti.mongodb.net/rob?retryWrites=true&w=majority&appName=Rabbbe");
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

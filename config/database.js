import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "./config.env" });

const connectDatabase = () => {
  mongoose.set("strictQuery", false);

  mongoose.connect(process.env.MONGO_URL).then(() => {
    console.log(`MongoDB Database connected `);
  });
};

export default connectDatabase;

import mongoose from "mongoose";
import "dotenv/config";

const uri = process.env.MONGO_URI;

const db = mongoose.connect(uri);

export default db;

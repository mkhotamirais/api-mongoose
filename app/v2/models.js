import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    image: String,
    cloudinary_id: String,
  },
  {
    timestamps: true,
  }
);

const Products = mongoose.model("v2Product", productSchema);

export { Products };

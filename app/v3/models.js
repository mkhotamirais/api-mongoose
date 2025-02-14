import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    email: { type: String, requried: true, unique: true, trim: true },
    password: { type: String, requried: true },
    role: { type: String, enum: ["user", "editor", "admin"], default: "user" },
  },
  {
    timestamps: true,
  }
);

const tagSchema = new mongoose.Schema(
  { name: { type: String, required: true, unique: true, trim: true } },
  { timestamps: true }
);

const categorySchema = new mongoose.Schema(
  { name: { type: String, required: true, unique: true, trim: true } },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, requried: true, unique: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    tag: [{ type: mongoose.Schema.Types.ObjectId, ref: "v3Tags", required: true }],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "v3Categories",
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "v3Users" },
  },
  {
    timestamps: true,
  }
);

const Users = mongoose.model("v3Users", userSchema);
const Tags = mongoose.model("v3Tags", tagSchema);
const Categories = mongoose.model("v3Categories", categorySchema);
const Products = mongoose.model("v3Products", productSchema);

export { Tags, Categories, Products, Users };

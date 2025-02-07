import cloudinary from "./cloudinary.js";
import { Products } from "./models.js";
import { unlinkSync } from "fs";

export const createProduct = async (req, res) => {
  const { name, price } = req.body;

  if (!name) return res.status(400).json({ message: `Name is required` });
  if (!price) return res.status(400).json({ message: `Price is required` });

  try {
    const dupName = await Products.findOne({ name });
    if (dupName) return res.status(409).json({ message: `Duplicate name` });
    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "v2products",
        use_filename: true,
        unique_filename: true,
        resource_type: "image",
      });
      unlinkSync(req.file.path);

      req.body.image = uploadResult.secure_url;
      req.body.cloudinary_id = uploadResult.public_id;
    }

    await Products.create(req.body);
    res.status(200).json({ message: `Create ${name} success` });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const data = await Products.find().select("-__v");
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

export const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await Products.findById(id);
    if (!data) return res.status(400).json({ error: `Data id ${id} not found` });
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await Products.findById(id);
    if (!data) return res.status(400).json({ error: `Product id ${id} not found` });

    if (data?.cloudinary_id || data?.image) {
      await cloudinary.uploader.destroy(data.cloudinary_id);
    }
    await Products.findByIdAndDelete(id);

    res.status(200).json({ message: `Delete ${data.name} success` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const data = await Products.findById(id);
    if (!data) return res.status(400).json({ error: `Product id ${id} not found` });

    let imageUrl = data.image;
    let cloudinaryId = data?.cloudinary_id ? data.cloudinary_id : null;

    if (req.file) {
      if (cloudinaryId) {
        await cloudinary.uploader.destroy(cloudinaryId);
      }

      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "v2products",
        use_filename: true,
        unique_filename: false,
        resource_type: "image",
      });

      imageUrl = uploadResult.secure_url;
      cloudinaryId = uploadResult.public_id;

      unlinkSync(req.file.path);
    }

    req.body.image = imageUrl;
    req.body.cloudinary_id = cloudinaryId;

    await Products.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({ message: `Update ${name} success` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

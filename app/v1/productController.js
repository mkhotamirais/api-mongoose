import { Products } from "./models.js";

export const createdProduct = async (req, res) => {
  const { name, price } = req.body;
  if (!name) return res.status(400).json({ error: `Name is required!` });
  if (!price) return res.status(400).json({ error: `Price is required!` });
  try {
    const dupName = await Products.findOne({ name });
    if (dupName) return res.status(409).json({ error: "Duplicate name!" });
    await Products.create(req.body);
    res.status(201).json({ message: `Create ${name} success` });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

export const readProducts = async (req, res) => {
  try {
    const data = await Products.find().sort("-createdAt");
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

export const readProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await Products.findById(id);
    if (!data) return res.status(400).json({ error: `Data id ${id} not found!` });
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, price } = req.body;
  if (!name) return res.status(400).json({ error: `Name is required!` });
  if (!price) return res.status(400).json({ error: `Price is required!` });
  try {
    const data = await Products.findById(id);
    if (!data) return res.status(400).json({ error: `Data id ${id} not found!` });
    const dupName = await Products.findOne({ name });
    if (dupName && dupName.name !== name) return res.status(409).json({ error: `Duplicate name!` });

    await Products.findByIdAndUpdate(id, { name, price });
    res.status(200).json({ message: `Update ${data.name} success` });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await Products.findById(id);
    if (!data) return res.status(400).json({ error: `Data id ${id} not found!` });
    await Products.findByIdAndDelete(id);
    res.status(200).json({ message: `Delete ${data.name} success` });
  } catch (error) {
    console.log(error);
    res.status(400).json({ erro: error.message });
  }
};

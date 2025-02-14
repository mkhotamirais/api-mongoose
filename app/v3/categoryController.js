import { Categories } from "./models.js";

export const getCategories = async (req, res) => {
  try {
    const data = await Categories.find().sort("-createdAt");
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

export const getCategoryById = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await Categories.findById(id);
    if (!data) return res.status(400).json({ error: `Category id ${id} not found!` });
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

export const createCategory = async (req, res) => {
  const { name } = req.body;
  if (!name || name === "") return res.status(400).json({ error: `Name is required!` });
  try {
    const dupName = await Categories.findOne({ name });
    if (dupName) return res.status(409).json({ error: `Duplicate name!` });
    await Categories.create(req.body);
    res.status(200).json({ message: `Post ${name} success` });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name || name === "") return res.status(400).json({ error: `Name is required!` });
  try {
    const match = await Categories.findById(id);
    if (!match) return res.status(400).json({ error: `Category id ${id} not found!` });
    const dupName = await Categories.findOne({ name });
    if (dupName && dupName.name !== name) return res.status(409).json({ error: "Duplicate name!" });
    await Categories.findByIdAndUpdate(match._id, req.body, { new: true });
    res.status(200).json({ message: `Update ${name} success` });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await Categories.findById(id);
    if (!data) return res.json(400).json({ error: `Category id ${id} not found!` });
    await Categories.findByIdAndDelete(id);
    res.status(200).json({ message: `Delete ${data.name} success` });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

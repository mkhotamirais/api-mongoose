import { Tags } from "./models.js";

export const getTags = async (req, res) => {
  try {
    const data = await Tags.find().sort("-createdAt");
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

export const getTagById = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await Tags.findById(id);
    if (!data) return res.status(400).json({ error: `Tag id ${id} not found!` });
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

export const createTag = async (req, res) => {
  const { name } = req.body;
  if (!name || name === "") return res.status(400).json({ error: `Name is required!` });
  try {
    const dupName = await Tags.findOne({ name });
    if (dupName) return res.status(409).json({ error: `Duplicate name!` });
    await Tags.create(req.body);
    res.status(200).json({ message: `Post ${name} success` });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

export const updateTag = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name || name === "") return res.status(400).json({ error: `Name is required!` });
  try {
    const match = await Tags.findById(id);
    if (!match) return res.status(400).json({ error: `Tag id ${id} not found!` });
    const dupName = await Tags.findOne({ name });
    if (dupName && dupName.name !== name) return res.status(409).json({ error: "Duplicate name!" });
    await Tags.findByIdAndUpdate(match._id, req.body, { new: true });
    res.status(200).json({ message: `Update ${name} success` });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

export const deleteTag = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await Tags.findById(id);
    if (!data) return res.json(400).json({ error: `Tag id ${id} not found!` });
    await Tags.findByIdAndDelete(id);
    res.status(200).json({ message: `Delete ${data.name} success` });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

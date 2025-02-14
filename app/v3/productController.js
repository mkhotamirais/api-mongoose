import { Products } from "./models.js";

export const getProducts = async (req, res) => {
  const { skip = 0, limit = 0, q = "", category = "", tag = [], sort = "-createdAt" } = req.query;
  let criteria;
  if (q.length) criteria = { ...criteria, name: { $regex: `${q}`, $options: "i" } };
  if (category.length) criteria = { ...criteria, category };
  if (tag.length) criteria = { ...criteria, tag: { $in: tag } };
  try {
    // const options = { sort: [["group.name", "asc"]] };
    const count = await Products.countDocuments(criteria);
    const data = await Products.find(criteria)
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .sort(sort)
      .populate({ path: "category", select: "name" })
      .populate({ path: "tag", select: ["name"] })
      .populate({ path: "user", select: ["username"] })
      .select("-__v");
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

export const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await Products.findById(id)
      .populate({ path: "category", select: ["name"] })
      .populate({ path: "tag", select: ["name"] })
      .populate({ path: "user", select: ["username"] });
    if (!data) return res.status(404).json({ error: `Data ${id} not found!` });
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

export const createProduct = async (req, res) => {
  const { name, price, tag, category } = req.body;

  if (!name) return res.status(400).json({ error: "Name is required!" });
  if (!price) return res.status(400).json({ error: "Price is required!" });
  if (!Array.isArray(tag) || tag.length === 0)
    return res.status(400).json({ error: "Tag IDs must be a non-empty array!" });
  if (!category) return res.status(400).json({ error: "Category ID is required!" });

  try {
    const dupName = await Products.findOne({ name });
    if (dupName) return res.status(409).json({ error: "Duplicate name!" });

    req.body.user = req.user._id;

    await Products.create(req.body);

    res.status(201).json({ message: `Product ${name} created successfully!` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, price, tag, category } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required!" });
  if (!price) return res.status(400).json({ error: "Price is required!" });
  if (!tag) return res.status(400).json({ error: "Tag is required!" });
  if (!category) return res.status(400).json({ error: "Category is required!" });

  try {
    const data = await Products.findById(id);
    if (!data) return res.status(404).json({ error: `Product id ${id} not found!` });

    const dupName = await Products.findOne({ name });
    if (dupName && dupName.name !== name) return res.status(409).json({ error: "Duplicate name!" });

    await Products.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({ message: `Update ${name} success` });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await Products.findById(id);
    if (!data) return res.status(404).json({ error: `Data id ${id} not found!` });
    await Products.findByIdAndDelete(id);
    res.status(200).json({ message: `Delete ${data.name} success` });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

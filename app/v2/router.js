import express from "express";

const router = express.Router();

import upload from "./multer.js";
import { createProduct, deleteProduct, getProductById, getProducts, updateProduct } from "./productController.js";

router.route("/product").get(getProducts).post(upload, createProduct);
router.route("/product/:id").get(getProductById).patch(upload, updateProduct).delete(deleteProduct);

export default router;

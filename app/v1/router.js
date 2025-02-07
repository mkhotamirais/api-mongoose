import express from "express";
import { createdProduct, deleteProduct, readProductById, readProducts, updateProduct } from "./productController.js";

const router = express.Router();

router.route("/product").get(readProducts).post(createdProduct);
router.route("/product/:id").get(readProductById).patch(updateProduct).delete(deleteProduct);

export default router;

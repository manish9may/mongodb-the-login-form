const path = require("path");

const express = require("express");

const shopController = require("../controllers/shop");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

router.get("/", shopController.getIndex);

router.get("/products", shopController.getProducts);

router.get("/products/:productId", shopController.getProduct);

router.get("/cart", authMiddleware, shopController.getCart);

router.post("/cart", authMiddleware, shopController.postCart);

router.post(
  "/cart-delete-item",
  authMiddleware,
  shopController.postCartDeleteProduct
);

router.post("/create-order", authMiddleware, shopController.postOrder);

router.get("/orders", authMiddleware, shopController.getOrders);

module.exports = router;

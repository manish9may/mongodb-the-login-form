const path = require("path");

const express = require("express");

const adminController = require("../controllers/admin");

const authMiddleware = require("../middleware/authMiddleware");

const { check, body } = require("express-validator");

const router = express.Router();

// /admin/add-product => GET
router.get("/add-product", authMiddleware, adminController.getAddProduct);

// /admin/products => GET
router.get("/products", authMiddleware, adminController.getProducts);

// /admin/add-product => POST
router.post(
  "/add-product",
  [
    body("title", "Invalid title").isLength({ min: 3 }).trim(),
    body("imageUrl", "Invalid imageUrl").isURL(),
    body("description", "Invalid description")
      .isLength({ min: 3, max: 400 })
      .trim(),
    body("price", "Invalid price").isFloat(),
  ],
  authMiddleware,
  adminController.postAddProduct
);

router.get(
  "/edit-product/:productId",
  authMiddleware,
  adminController.getEditProduct
);

router.post(
  "/edit-product",
  [
    body("title").isAlphanumeric().isLength({ min: 3 }).trim(),
    body("imageUrl").isURL(),
    body("description").isLength({ min: 3, max: 400 }).trim(),
    body("price").isFloat(),
  ],
  authMiddleware,
  adminController.postEditProduct
);

router.post(
  "/delete-product",
  authMiddleware,
  adminController.postDeleteProduct
);

module.exports = router;

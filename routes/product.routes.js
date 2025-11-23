const express = require("express");
const router = express.Router();

const productCtrl = require("../controllers/product.controller");

// List products (mendukung filter influencerId, q, paginasi)
router.get("/", productCtrl.list);

// Detail product by id
router.get("/:id", productCtrl.getById);

// Get List Product by Username
router.get("/username/:username", productCtrl.getByUsername);

// Create product
router.post("/", productCtrl.create);

// Update product by id
router.patch("/:id", productCtrl.update);

// Update Platform Product by id
router.patch("/:id/platforms", productCtrl.updatePlatforms);

// Add Platform Product by id Product
router.post("/:idproduct/platforms", productCtrl.addPlatforms);

// Delete product by id
router.delete("/:id", productCtrl.remove);

module.exports = router;

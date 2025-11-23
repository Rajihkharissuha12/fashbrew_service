// routes/ootd.routes.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/ootd.controller");
const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 10MB max per file
});

router.post("/", controller.createOotd);
router.get("/", controller.listOotds);
router.get("/:username", controller.getListOotdByUsername);
router.get("/byid/:id", controller.getOotdById);
router.put("/:id", controller.updateOotd);
router.delete("/:id", controller.deleteOotd);

// relasi OOTD-Product
router.post("/:id/products", controller.attachProduct);
router.delete("/:id/products/:productId", controller.detachProduct);
router.put("/:ootdId/products", controller.updateProductInOotd);

// media
router.post("/:idootd/media", upload.array("photos", 4), controller.addMedia);
router.patch("/banner", controller.setBanner);
router.delete("/media/:id", controller.deleteMedia);

// analytics ringan
router.post("/:id/view", controller.addView);
router.post("/:id/like", controller.addLike);
router.post("/analytics/click", controller.logClick);

module.exports = router;

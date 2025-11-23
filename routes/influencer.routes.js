const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/influencer.controller");

router.post("/", ctrl.create);
router.get("/", ctrl.list);
router.get("/handle/:handle", ctrl.getByHandle);
router.get("/by-user/:userId", ctrl.getByUserId);
router.get("/:id", ctrl.getById);
router.patch("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);

module.exports = router;

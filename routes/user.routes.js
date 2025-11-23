const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/user.controller");
const { default: axios } = require("axios");

router.post("/", ctrl.create);
router.get("/", ctrl.list);
router.get("/:id", ctrl.getById);
router.get("/username/:username", ctrl.getByUsername);
router.patch("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);

module.exports = router;

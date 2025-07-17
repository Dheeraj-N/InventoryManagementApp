const express = require("express");
const ctrl = require("../controllers/rawMaterial.controller");
const router = express.Router();

router.get("/", ctrl.getAll);
router.get("/:id", ctrl.getById);
router.post("/", ctrl.create);
router.put("/:id", ctrl.update);
router.delete("/:id", ctrl.delete);
router.get('/filter', ctrl.filterRawMaterials);

module.exports = router;

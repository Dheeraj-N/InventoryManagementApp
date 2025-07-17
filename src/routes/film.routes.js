const router = require("express").Router();
const c = require("../controllers/film.controller");

router.get("/", c.getAll);
router.get("/:id", c.getById);
router.post("/", c.create);
router.put("/:id", c.update);
router.delete("/:id", c.delete);
router.get('/filter', c.filterFilms);

module.exports = router;

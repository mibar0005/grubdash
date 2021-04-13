const router = require("express").Router();
const { listDishes, createANewDish, getDish, update, validDish } = require("./dishes.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

// TODO: Implement the /dishes routes needed to make the tests pass
router
.route("/")
.get(validDish)
.post(createANewDish)
.all(methodNotAllowed);

router
.route("/:dishId")
.get(getDish)
.put(update)
.all(methodNotAllowed);

module.exports = router;

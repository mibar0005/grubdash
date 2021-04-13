const router = require("express").Router();
const { ordersList, create, getAnOrder, update, deletes } = require("./orders.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

// TODO: Implement the /orders routes needed to make the tests pass
router
.route("/")
.get(ordersList)
.post(create)
.all(methodNotAllowed);

router
.route("/:orderId")
.get(getAnOrder)
.put(update)
.delete(deletes)
.all(methodNotAllowed);

module.exports = router;

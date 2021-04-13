const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
function ordersList(req, res) {
	res.json({ data: orders });
}

function create(req, res) {
	const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;

	const newOrder = {
		id: nextId(),
		deliverTo: deliverTo,
		mobileNumber: mobileNumber,
		status: status ? status : "pending",
		dishes: dishes,
	}

	orders.push(newOrder);

	res.status(201).json({ data: newOrder });
}
//function to declare if the order is valid 
function isOrderValid(req, res, next) {
	const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;
	//set an empty variable to store the message string. 
	let message;
	//If there is not deliver to or the deliver to is empty then...
	if(!deliverTo || deliverTo === "")
		message = "Order must include a deliverTo";
	//If not phonenumber is entered or if number is empty then... 
	else if(!mobileNumber || mobileNumber === "")
		message = "Order must include a mobileNumber";
	//If there are not dishes in the order then....
	else if(!dishes)
		message = "Order must include a dish";
	//If there is not array of dishes or if the array is 0 
	else if(!Array.isArray(dishes) || dishes.length === 0)
		message = "Order must include at least one dish";
	else {
		for(let i = 0; i < dishes.length; i++) {
			if(!dishes[i].quantity || dishes[i].quantity <= 0 || !Number.isInteger(dishes[i].quantity))
				message = `Dish ${i} must have a quantity greater than 0`;
		}
	}

	//If there is a message return 400 and the message 
	if(message) {
		return next({
			status: 400,
			message: message,
		});
	}

	next();
}

function getAnOrder(req, res) {
	res.json({ data: res.locals.order });
}

function orderId(req, res, next) {
	const { orderId } = req.params;
	const found = orders.find((order) => order.id === orderId);

	if(found) {
		res.locals.order = found;
		return next();
	}

	next({
		status: 404,
		message: `Order id does not exist: ${orderId}`,
	});
}

function update(req, res) {
	const { data: { deliverTo, mobileNumber, dishes, status } = {} } = req.body;

	res.locals.order = {
		id: res.locals.order.id,
		deliverTo: deliverTo,
		mobileNumber: mobileNumber,
		dishes: dishes,
		status: status,
	}

	res.json({ data: res.locals.order });
}

function validate(req, res, next) {
	const { orderId } = req.params;
	const { data: { id, status } = {} } = req.body;
	//declare an empty variable to hold the string. 
	let message;
	//If if and id not equal to orderId
	if(id && id !== orderId)
		message = `Order id does not match route id. Order: ${id}, Route: ${orderId}`
	//If status does not exist OR status is empty OR if status is not pending AND
	//Status is NOT equal to preparing AND status is NOT equal to out-for-delivery
	else if(!status || status === "" || (status !== "pending" &&
	 status !== "preparing" && status !== "out-for-delivery"))
		message = "Order must have a status of pending, preparing, out-for-delivery, delivered";
	//if status is equal to delivered 
	else if(status == "delivered")
		message = "A delivered order cannot be changed"

	//If a message exists return the message and status 400
	if(message) {
		return next({
			status: 400,
			message: message,
		});
	}

	next();
}

function deletes(req, res) {
	const index = orders.indexOf(res.locals.order);
	orders.splice(index, 1);

	res.sendStatus(204);
}

function validateDelete(req, res, next) {
	if(res.locals.order.status !== "pending") {
		return next({
			status: 400,
			message: "An order cannot be deleted unless it is pending",
		});
	}	

	next();
}

module.exports = {
	ordersList,
	create: [isOrderValid, create],
	getAnOrder: [orderId, getAnOrder],
	update: [isOrderValid, orderId, validate, update],
	deletes: [orderId, validateDelete, deletes],
}
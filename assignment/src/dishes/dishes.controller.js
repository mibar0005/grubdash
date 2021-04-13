const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
function validDish(req, res) {
	res.json({ data: dishes });
}

function createANewDish(req, res) {
	const { data: { name, description, price, image_url } = {} } = req.body;
	const createDish = {
		id: nextId(),
		name: name,
		description: description,
		price: price,
		image_url: image_url,
	};

	dishes.push(createDish);
	res.status(201).json({ data: createDish });
}

function bodyOfDish(req, res, next) {
	const { data: { name, description, price, image_url } = {} } = req.body;
	//Declare an empty variable for message
	let message;

	//If name is NOT included or name is empty
	if (!name || name == "")
		message = "Dish must include a name";
	//If there is NOT a description or the description is empty 
	else if (!description || description == "")
		message = "Dish must include a description";
	//If the price is NOT included 
	else if (!price)
		message = "Dish must include a price";
	//If the price is less than or equal to 0 OR Number is NOT an integer 
	else if (price <= 0 || !Number.isInteger(price))
		message = "Dish must have a price greater than 0 and must be an integer";
	//If there is NOT an image or the image is empty 
	else if (!image_url || image_url == "")
		message = "Dish must include a image_url";

	//If there is a message, proceed, otherwise return next()
	if(message) {
		return next({
			status: 400,
			message: message,
		});
	}

	next();
}

function getDish(req, res) {
	res.json({ data: res.locals.dish });
}

function dishId(req, res, next) {
	const { dishId } = req.params;
	const found = dishes.find((dish) => dish.id === dishId);

	if (found) {
		res.locals.dish = found;
		return next();
	}

	next({
		status: 404,
		message: `Dish id does not exist: ${dishId}`,
	})
}

function update (req, res) {
	const { data: { name, description, price, image_url } = {} } = req.body;

	res.locals.dish = {
		id: res.locals.dishId,
		name: name,
		description: description,
		price: price,
		image_url: image_url,
	};

	res.json({ data: res.locals.dish });
}

function isTheDishValid(req, res, next) {
	const { dishId } = req.params;
	const { data: { id } = {} } = req.body;

	if (!id || id === dishId) {
		res.locals.dishId = dishId;
		return next();
	}

	next({
		status: 400,
		message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`
	});
}

module.exports = {
	validDish,
	createANewDish: [bodyOfDish, createANewDish],
	getDish: [dishId, getDish],
	update : [dishId, bodyOfDish, isTheDishValid, update ],
};
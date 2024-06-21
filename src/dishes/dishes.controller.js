const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
function create(req, res) {
    const { data } = req.body;

    const newDish = {
        id: nextId(),
        name: data.name,
        description: data.description,
        price: data.price,
        image_url: data.image_url
    };

    dishes.push(newDish);

    res.status(201).json({ data: newDish });
}

function read(req, res) {
    const { dishId } = req.params;
    const foundDish = dishes.find((dish) => dish.id === dishId);

    res.json({ data: foundDish });
}

function update(req, res) {
    const dishId = req.params.dishId;
    const foundDish = dishes.find((dish) => dish.id === dishId);

    const { data } = req.body;
    foundDish.name = data.name;
    foundDish.description= data.description,
    foundDish.price= data.price,
    foundDish.image_url= data.image_url
  
    res.json({ data: foundDish });
}

function list(req, res) {
    res.json({ data: dishes });
}

function dishExists(req, res, next) {
    const { dishId } = req.params;
    const foundDish = dishes.find((dish) => dish.id === dishId);

    if (foundDish) {
        res.locals.dish = foundDish; 
        return next();
    }

    next({ status: 404, message: `Dish ID not found: ${dishId}` });
}

function dishIdMatches(req, res, next) {
    const { dishId } = req.params;
    const { data } = req.body;

    if (data.id && dishId !== data.id) {
        return res.status(400).json({ error: `Dish id does not match route id. Dish: ${data.id}, Route: ${dishId}` });
    }

    return next();
}


const validateDish = (req, res, next) => {
    const { data } = req.body;

    if (!data) {
        return res.status(400).json({ error: "Dish must include data" });
    }

    if (!data.name || data.name.trim() === "") {
        return res.status(400).json({ error: "Dish must include a name" });
    }

    if (!data.description || data.description.trim() === "") {
        return res.status(400).json({ error: "Dish must include a description" });
    }

    if (data.price === undefined) {
        return res.status(400).json({ error: "Dish must include a price" });
    }

    if (typeof data.price !== "number" || !Number.isInteger(data.price) || data.price <= 0) {
        return res.status(400).json({ error: "Dish must have a price that is an integer greater than 0" });
    }

    if (!data.image_url || data.image_url.trim() === "") {
        return res.status(400).json({ error: "Dish must include an image_url" });
    }

    next();
};


module.exports = {
    create: [validateDish, create],
    list: [list],
    read: [dishExists, read],
    update: [dishExists, dishIdMatches, validateDish, update],
};
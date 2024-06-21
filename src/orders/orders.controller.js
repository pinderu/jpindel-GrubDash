const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
function create(req, res) {
    const { data } = req.body;

    const newOrder = {
        id: nextId(),
        deliverTo: data.deliverTo,
        mobileNumber: data.mobileNumber,
        status: 'pending',
        dishes: data.dishes,
    };

    orders.push(newOrder);

    res.status(201).json({ data: newOrder });
}

function read(req, res) {
    const {orderId} = req.params;
    const foundOrder = orders.find((order) => order.id === orderId);

    res.json({data: foundOrder});
}

function update(req, res) {
    const {orderId} = req.params;
    const foundOrder = orders.find((order) => order.id === orderId);

    const { data} = req.body;



    foundOrder.deliverTo = data.deliverTo;
    foundOrder.mobileNumber = data.mobileNumber;
    foundOrder.status = data.status;
    foundOrder.dishes = data.dishes;


        if (!foundOrder.status || !["pending", "preparing", "out-for-delivery", "delivered"].includes(foundOrder.status)) {
           
            return res.status(400).json({ error: ` ${foundOrder.status} Order must include a valid status` });
        }


    res.json({data: foundOrder});
}

function destroy(req, res, next) {
    const {orderId} = req.params;
    const index = orders.findIndex((order) => order.id === orderId);
   
    orders.splice(index, 1);
    res.sendStatus(204);
}

function list(req, res) {
    res.json({ data: orders });
}

function orderIsPending(req, res, next){
    const {orderId} = req.params;
    const index = orders.findIndex((order) => order.id === orderId);
    if(orders[index].status !== "pending"){
        return res.status(400).json({error: `Order ID: ${orderId} is not pending`});
    }

    return next();
}

function orderExists(req, res, next){
    const {orderId} = req.params;
    const foundOrder = orders.find((order) => order.id === orderId);

    if(foundOrder){
        res.locals.order = foundOrder;
        return next();
    }

    next({ status:404, message: `Order ID not found: ${orderId}`});
}


const validateOrder = (req, res, next) => {
    const { data } = req.body;
    
    if (!data) {
        return res.status(400).json({ error: "Order must include data" });
    }

    if (!data.deliverTo || data.deliverTo.trim() === "") {
        return res.status(400).json({ error: "Order must include a deliverTo" });
    }

    if (!data.mobileNumber || data.mobileNumber.trim() === "") {
        return res.status(400).json({ error: "Order must include a mobileNumber" });
    }

    if (!data.dishes || !Array.isArray(data.dishes) || data.dishes.length === 0) {
        return res.status(400).json({ error: "Order must include at least one dish" });
    }

    for (let i = 0; i < data.dishes.length; i++) {
        const dish = data.dishes[i];

            
        if (!dish.name || dish.name.trim() === "") {
            return res.status(400).json({ error: `Dish ${i} must include a name` });
        }

        if (!dish.description || dish.description.trim() === "") {
            return res.status(400).json({ error: `Dish ${i} must include a description` });
        }

        if (dish.price === undefined) {
            return res.status(400).json({ error: `Dish ${i} must include a price` });
        }

        if (typeof dish.price !== "number" || !Number.isInteger(dish.price) || dish.price <= 0) {
            return res.status(400).json({ error: `Dish ${i} must have a price that is an integer greater than 0` });
        }

        if (!dish.image_url || dish.image_url.trim() === "") {
            return res.status(400).json({ error: `Dish ${i} must include an image_url` });
        }

        if (dish.quantity === undefined) {
            return res.status(400).json({ error: `Dish ${i} must include a quantity` });
        }

        if (typeof dish.quantity !== "number" || !Number.isInteger(dish.quantity) || dish.quantity <= 0) {
            return res.status(400).json({ error: `Dish ${i} must have a quantity that is an integer greater than 0` });
        }
    }

    next();
};

function orderIdMatches(req, res, next) {
    const { orderId } = req.params;
    const { data } = req.body;

    if (data.id && orderId !== data.id) {
        return res.status(400).json({ error: `Dish id does not match route id. Dish: ${data.id}, Route: ${orderId}` });
    }

    return next();
}

module.exports = {
    create: [validateOrder, create],
    list: [list],
    read: [orderExists, read],
    update: [orderExists, orderIdMatches, validateOrder, update],
    delete: [orderExists, orderIsPending, destroy]
};
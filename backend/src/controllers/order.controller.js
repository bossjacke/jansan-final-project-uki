// Minimal order controller stubs. Implement business logic later.
import Order from "../models/order.model.js";

export const listOrders = async (req, res) => {
	try {
		const orders = await Order.find();
		res.json({ orders });
	} catch (error) {
		res.status(500).json({ message: "Error fetching orders", error: error.message });
	}
};

export const getOrder = async (req, res) => {
	try {
		const order = await Order.findById(req.params.id);
		if (!order) return res.status(404).json({ message: "Order not found" });
		res.json({ order });
	} catch (error) {
		res.status(500).json({ message: "Error fetching order", error: error.message });
	}
};

export default { listOrders, getOrder };

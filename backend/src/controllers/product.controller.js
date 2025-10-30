import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";

// ✅ Create New Product (Admin)
export const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ message: "Product created successfully", product });
  } catch (error) {
    res.status(500).json({ message: "Error creating product", error: error.message });
  }
};

// ✅ Get All Products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error: error.message });
  }
};

// ✅ Get Single Product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ product });
  } catch (error) {
    res.status(500).json({ message: "Error fetching product", error: error.message });
  }
};

// ✅ Update Product (Admin)
export const updateProduct = async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product updated successfully", updated });
  } catch (error) {
    res.status(500).json({ message: "Error updating product", error: error.message });
  }
};

// ✅ Delete Product (Admin)
export const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error: error.message });
  }
};

// ✅ Place Order (Customer)
export const placeOrder = async (req, res) => {
  try {
    const { productId } = req.body;
    const order = await Order.create({
      userId: req.user.id,
      productId,
    });
    res.status(201).json({ message: "Order placed successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Error placing order", error: error.message });
  }
};

// ✅ Get All Orders for a Customer
export const getCustomerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).populate("productId");
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error: error.message });
  }
};

// ✅ Update Order Status (Admin)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { orderStatus: status },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Order status updated successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Error updating order", error: error.message });
  }
};

import Cart from '../models/cart.model.js';
import Product from '../models/product.model.js';

// 🛒 Get User Cart
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.getOrCreateCart(req.user.id);
    res.status(200).json({ success: true, message: "Cart fetched", data: cart });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error getting cart", error: err.message });
  }
};

// ➕ Add Item to Cart
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) return res.status(400).json({ success: false, message: "Product ID required" });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const cart = await Cart.getOrCreateCart(req.user.id);
    const item = cart.items.find(i => i.productId.toString() === productId);

    if (item) item.quantity += quantity;
    else cart.items.push({ productId, quantity, price: product.price });

    await cart.save();
    const updated = await Cart.findById(cart._id).populate("items.productId", "name type description images image");
    res.status(200).json({ success: true, message: "Item added", data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error adding item", error: err.message });
  }
};

// 🔄 Update Quantity
export const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!productId || quantity < 1)
      return res.status(400).json({ success: false, message: "Invalid input" });

    const cart = await Cart.getOrCreateCart(req.user.id);
    const item = cart.items.find(i => i.productId.toString() === productId);
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });

    item.quantity = quantity;
    await cart.save();

    const updated = await Cart.findById(cart._id).populate("items.productId", "name type description images image");
    res.status(200).json({ success: true, message: "Quantity updated", data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating cart", error: err.message });
  }
};

// ❌ Remove Item
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const cart = await Cart.getOrCreateCart(req.user.id);

    cart.items = cart.items.filter(i => i.productId.toString() !== productId);
    await cart.save();

    const updated = await Cart.findById(cart._id).populate("items.productId", "name type description images image");
    res.status(200).json({ success: true, message: "Item removed", data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error removing item", error: err.message });
  }
};

// 🧹 Clear Cart
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.getOrCreateCart(req.user.id);
    cart.items = [];
    await cart.save();
    res.status(200).json({ success: true, message: "Cart cleared", data: cart });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error clearing cart", error: err.message });
  }
};

// 📊 Cart Summary
export const getCartSummary = async (req, res) => {
  try {
    const cart = await Cart.getOrCreateCart(req.user.id);
    const totalItems = cart.items.reduce((sum, i) => sum + i.quantity, 0);

    res.status(200).json({
      success: true,
      message: "Cart summary",
      data: {
        totalItems,
        totalAmount: cart.totalAmount,
        itemCount: cart.items.length,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error getting summary", error: err.message });
  }
};

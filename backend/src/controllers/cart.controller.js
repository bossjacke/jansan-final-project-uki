import Cart from '../models/cart.model.js';
import Product from '../models/product.model.js';

// 🛒 Get User Cart
export const getCart = async (req, res) => {
  try {
    const userId = req.user?.id || req.user;
    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }
    const cart = await Cart.getOrCreateCart(userId);
    res.status(200).json({ success: true, message: "Cart fetched", data: cart });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error getting cart", error: err.message });
  }
};

// ➕ Add Item to Cart
export const addToCart = async (req, res) => {
  try {
    console.log('🛒 addToCart Request body:', req.body);
    console.log('👤 req.user:', req.user);
    console.log('🆔 req.user?.id:', req.user?.id);
    
    const { productId, quantity = 1 } = req.body;
    if (!productId) return res.status(400).json({ success: false, message: "Product ID required" });

    const userId = req.user?.id || req.user;
    console.log('🔑 Final userId:', userId);
    
    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const cart = await Cart.getOrCreateCart(userId);
    const item = cart.items.find(i => i.productId.toString() === productId);

    if (item) item.quantity += quantity;
    else cart.items.push({ productId, quantity, price: product.price });

    await cart.save();
    const updated = await Cart.findById(cart._id).populate("items.productId", "name type description capacity warrantyPeriod images image");
    res.status(200).json({ success: true, message: "Item added", data: updated });
  } catch (err) {
    console.error('🔥 addToCart Error:', err);
    console.error('🔥 Error stack:', err.stack);
    res.status(500).json({ success: false, message: "Error adding item", error: err.message });
  }
};

// 🔄 Update Quantity
export const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!itemId || quantity < 1)
      return res.status(400).json({ success: false, message: "Invalid input" });

    const userId = req.user?.id || req.user;
    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const cart = await Cart.getOrCreateCart(userId);
    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });

    item.quantity = quantity;
    await cart.save();

    const updated = await Cart.findById(cart._id).populate("items.productId", "name type description capacity warrantyPeriod images image");
    res.status(200).json({ success: true, message: "Quantity updated", data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating cart", error: err.message });
  }
};

// ❌ Remove Item
export const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    
    const userId = req.user?.id || req.user;
    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const cart = await Cart.getOrCreateCart(userId);

    cart.items.pull(itemId);
    await cart.save();

    const updated = await Cart.findById(cart._id).populate("items.productId", "name type description capacity warrantyPeriod images image");
    res.status(200).json({ success: true, message: "Item removed", data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error removing item", error: err.message });
  }
};

// 🧹 Clear Cart
export const clearCart = async (req, res) => {
  try {
    const userId = req.user?.id || req.user;
    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const cart = await Cart.getOrCreateCart(userId);
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
    const userId = req.user?.id || req.user;
    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const cart = await Cart.getOrCreateCart(userId);
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

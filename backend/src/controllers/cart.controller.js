import Cart from '../models/cart.model.js';
import Product from '../models/product.model.js';

// 🛒 Get User Cart
export const getCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    console.log('🛒 getCart - userId:', userId);
    
    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }
    const cart = await Cart.getOrCreateCart(userId);
    console.log('✅ Cart retrieved successfully');
    res.status(200).json({ success: true, message: "Cart fetched", data: cart });
  } catch (err) {
    console.error('❌ Error getting cart:', err);
    res.status(500).json({ success: false, message: "Error getting cart", error: err.message });
  }
};

// ➕ Add Item to Cart
export const addToCart = async (req, res) => {
  try {
    console.log('🛒 addToCart - Request body:', req.body);
    console.log('👤 addToCart - req.user:', req.user);
    
    const { productId, quantity = 1 } = req.body;
    if (!productId) return res.status(400).json({ success: false, message: "Product ID required" });

    const userId = req.user?.id;
    console.log('🔑 addToCart - Final userId:', userId);
    
    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    // Ensure product has a valid price before adding to cart
    if (product.price == null) {
      console.warn('⚠️ Product missing price for productId:', productId);
      return res.status(400).json({ success: false, message: "Product price is not set for this item" });
    }

    const cart = await Cart.getOrCreateCart(userId);
    // Handle both populated and unpopulated productId in cart items
    const item = cart.items.find(i => {
      try {
        if (!i.productId) return false;
        // If populated, productId may be an object
        const pid = (i.productId._id && i.productId._id.toString) ? i.productId._id.toString() : (i.productId.toString ? i.productId.toString() : null);
        return pid === productId;
      } catch (e) {
        return false;
      }
    });

    if (item) {
      console.log('📦 Item already in cart, updating quantity:', item.quantity, '→', item.quantity + quantity);
      item.quantity += quantity;
    } else {
      console.log('✨ Adding new item to cart');
      cart.items.push({ productId, quantity, price: product.price });
    }

    await cart.save();
    const updated = await Cart.findById(cart._id).populate("items.productId", "name type description capacity warrantyPeriod images image");
    console.log('✅ Cart updated successfully');
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

    console.log('🔄 updateCartItem - itemId:', itemId, 'quantity:', quantity);

    if (!itemId || quantity < 1)
      return res.status(400).json({ success: false, message: "Invalid input" });

    const userId = req.user?.id;
    console.log('👤 updateCartItem - userId:', userId);
    
    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const cart = await Cart.getOrCreateCart(userId);
    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });

    console.log('📦 Old quantity:', item.quantity, '→ New quantity:', quantity);
    item.quantity = quantity;
    await cart.save();

    const updated = await Cart.findById(cart._id).populate("items.productId", "name type description capacity warrantyPeriod images image");
    console.log('✅ Cart updated successfully');
    res.status(200).json({ success: true, message: "Quantity updated", data: updated });
  } catch (err) {
    console.error('❌ Error updating cart:', err);
    res.status(500).json({ success: false, message: "Error updating cart", error: err.message });
  }
};

// ❌ Remove Item
export const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    console.log('🗑️ removeFromCart - itemId:', itemId);
    
    const userId = req.user?.id;
    console.log('👤 removeFromCart - userId:', userId);
    
    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const cart = await Cart.getOrCreateCart(userId);

    console.log('📦 Items before removal:', cart.items.length);
    cart.items.pull(itemId);
    console.log('📦 Items after removal:', cart.items.length);
    
    await cart.save();

    const updated = await Cart.findById(cart._id).populate("items.productId", "name type description capacity warrantyPeriod images image");
    console.log('✅ Item removed successfully');
    res.status(200).json({ success: true, message: "Item removed", data: updated });
  } catch (err) {
    console.error('❌ Error removing item:', err);
    res.status(500).json({ success: false, message: "Error removing item", error: err.message });
  }
};

// 🧹 Clear Cart
export const clearCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    console.log('🧹 clearCart - userId:', userId);
    
    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const cart = await Cart.getOrCreateCart(userId);
    console.log('📦 Items before clear:', cart.items.length);
    cart.items = [];
    await cart.save();
    console.log('✅ Cart cleared successfully');
    res.status(200).json({ success: true, message: "Cart cleared", data: cart });
  } catch (err) {
    console.error('❌ Error clearing cart:', err);
    res.status(500).json({ success: false, message: "Error clearing cart", error: err.message });
  }
};

// 📊 Cart Summary
export const getCartSummary = async (req, res) => {
  try {
    const userId = req.user?.id;
    console.log('📊 getCartSummary - userId:', userId);
    
    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const cart = await Cart.getOrCreateCart(userId);
    const totalItems = cart.items.reduce((sum, i) => sum + i.quantity, 0);

    console.log('✅ Cart summary retrieved - items:', totalItems, 'total:', cart.totalAmount);
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
    console.error('❌ Error getting summary:', err);
    res.status(500).json({ success: false, message: "Error getting summary", error: err.message });
  }
};

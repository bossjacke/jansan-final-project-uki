// import Cart from '../models/cart.model.js';
// import Product from '../models/product.model.js';

// /**
//  * Get user's cart
//  */
// export const getCart = async (req, res) => {
//     try {
//         const cart = await Cart.getOrCreateCart(req.user.id);
        
//         res.status(200).json({
//             success: true,
//             message: 'Cart retrieved successfully',
//             data: cart
//         });
//     } catch (error) {
//         console.error('Error getting cart:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to retrieve cart',
//             error: error.message
//         });
//     }
// };

// /**
//  * Add item to cart
//  */
// export const addToCart = async (req, res) => {
//     try {
//         const { productId, quantity = 1 } = req.body;

//         if (!productId) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Product ID is required'
//             });
//         }

//         // Check if product exists and is available
//         const product = await Product.findById(productId);
//         if (!product) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Product not found'
//             });
//         }

//         // Get or create cart
//         const cart = await Cart.getOrCreateCart(req.user.id);

//         // Check if product already in cart
//         const existingItemIndex = cart.items.findIndex(
//             item => item.productId.toString() === productId
//         );

//         if (existingItemIndex > -1) {
//             // Update quantity if item exists
//             cart.items[existingItemIndex].quantity += quantity;
//         } else {
//             // Add new item
//             cart.items.push({
//                 productId,
//                 quantity,
//                 price: product.price
//             });
//         }

//         await cart.save();

//         // Return updated cart with populated product details
//         const updatedCart = await Cart.findById(cart._id)
//             .populate('items.productId', 'name type description capacity warrantyPeriod');

//         res.status(200).json({
//             success: true,
//             message: 'Item added to cart successfully',
//             data: updatedCart
//         });
//     } catch (error) {
//         console.error('Error adding to cart:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to add item to cart',
//             error: error.message
//         });
//     }
// };

// /**
//  * Update cart item quantity
//  */
// export const updateCartItem = async (req, res) => {
//     try {
//         const { productId } = req.params;
//         const { quantity } = req.body;

//         if (!productId) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Product ID is required'
//             });
//         }

//         if (!quantity || quantity < 1) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Quantity must be at least 1'
//             });
//         }

//         const cart = await Cart.getOrCreateCart(req.user.id);

//         const itemIndex = cart.items.findIndex(
//             item => item.productId.toString() === productId
//         );

//         if (itemIndex === -1) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Item not found in cart'
//             });
//         }

//         cart.items[itemIndex].quantity = quantity;
//         await cart.save();

//         const updatedCart = await Cart.findById(cart._id)
//             .populate('items.productId', 'name type description capacity warrantyPeriod');

//         res.status(200).json({
//             success: true,
//             message: 'Cart item updated successfully',
//             data: updatedCart
//         });
//     } catch (error) {
//         console.error('Error updating cart item:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to update cart item',
//             error: error.message
//         });
//     }
// };

// /**
//  * Remove item from cart
//  */
// export const removeFromCart = async (req, res) => {
//     try {
//         const { productId } = req.params;

//         if (!productId) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Product ID is required'
//             });
//         }

//         const cart = await Cart.getOrCreateCart(req.user.id);

//         const itemIndex = cart.items.findIndex(
//             item => item.productId.toString() === productId
//         );

//         if (itemIndex === -1) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Item not found in cart'
//             });
//         }

//         cart.items.splice(itemIndex, 1);
//         await cart.save();

//         const updatedCart = await Cart.findById(cart._id)
//             .populate('items.productId', 'name type description capacity warrantyPeriod');

//         res.status(200).json({
//             success: true,
//             message: 'Item removed from cart successfully',
//             data: updatedCart
//         });
//     } catch (error) {
//         console.error('Error removing from cart:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to remove item from cart',
//             error: error.message
//         });
//     }
// };

// /**
//  * Clear entire cart
//  */
// export const clearCart = async (req, res) => {
//     try {
//         const cart = await Cart.getOrCreateCart(req.user.id);
//         cart.items = [];
//         await cart.save();

//         res.status(200).json({
//             success: true,
//             message: 'Cart cleared successfully',
//             data: cart
//         });
//     } catch (error) {
//         console.error('Error clearing cart:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to clear cart',
//             error: error.message
//         });
//     }
// };

// /**
//  * Get cart summary (total items and total amount)
//  */
// export const getCartSummary = async (req, res) => {
//     try {
//         const cart = await Cart.getOrCreateCart(req.user.id);
        
//         const totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
        
//         res.status(200).json({
//             success: true,
//             message: 'Cart summary retrieved successfully',
//             data: {
//                 totalItems,
//                 totalAmount: cart.totalAmount,
//                 itemCount: cart.items.length
//             }
//         });
//     } catch (error) {
//         console.error('Error getting cart summary:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to retrieve cart summary',
//             error: error.message
//         });
//     }
// };


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
    const updated = await Cart.findById(cart._id).populate("items.productId", "name type description");
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

    const updated = await Cart.findById(cart._id).populate("items.productId", "name type description");
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

    const updated = await Cart.findById(cart._id).populate("items.productId", "name type description");
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

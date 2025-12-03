// import logger from "../utils/logger.js";
// import Order from "../models/order.model.js";
// import Cart from "../models/cart.model.js";
// import Product from "../models/product.model.js";
// import User from "../models/user.model.js";

// // ==================== ORDER CONTROLLERS ====================

// // 🛍️ Create Order
// export const createOrder = async (req, res) => {
//   try {
//     const { shippingAddress } = req.body;

//     logger.info("🛒 Creating order for user:", req.user.id);

//     const cart = await Cart.getOrCreateCart(req.user.id);
//     logger.info("🛍️ Cart items:", cart.items.length, cart.items);
    
//     if (cart.items.length === 0) {
//       return res.status(400).json({ success: false, message: "Cart is empty" });
//     }

//     // Validate cart items
//     for (const item of cart.items) {
//       if (!item.productId || !item.quantity || !item.price) {
//         return res.status(400).json({ 
//           success: false, 
//           message: "Invalid cart item data" 
//         });
//       }
//     }

//     // Check product availability and stock
//     const productIds = cart.items.map(i => i.productId);
//     logger.info("🔍 Product IDs to check:", productIds);
//     logger.info("🛒 Cart items structure:", JSON.stringify(cart.items, null, 2));
    
//     const products = await Product.find({ _id: { $in: productIds } });
//     logger.info("📦 Found products:", products.length, products.map(p => ({ id: p._id, name: p.name, stock: p.stock })));

//     if (products.length !== cart.items.length) {
//       logger.error("❌ Product count mismatch:", { cartItems: cart.items.length, foundProducts: products.length });
//       return res.status(400).json({ 
//         success: false, 
//         message: "Some products are unavailable or have been removed" 
//       });
//     }

//     // Check stock availability
//     for (const cartItem of cart.items) {
//       const product = products.find(p => p._id.toString() === cartItem.productId.toString());
//       logger.info("🔍 Checking stock for cart item:", cartItem);
//       logger.info("📦 Found product:", product ? { id: product._id, name: product.name, stock: product.stock } : 'NOT FOUND');
//       logger.info("🔍 Comparing:", { cartProductId: cartItem.productId.toString(), productIds: productIds.map(id => id.toString()) });
      
//       if (!product) {
//         logger.error("❌ Product not found for ID:", cartItem.productId);
//         return res.status(400).json({ 
//           success: false, 
//           message: `Product not found: ${cartItem.productId}` 
//         });
//       }

//       if (product.stock < cartItem.quantity) {
//         return res.status(400).json({ 
//           success: false, 
//           message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${cartItem.quantity}` 
//         });
//       }
//     }

//     // Get user information
//     const user = await User.findById(req.user.id);
//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     // Prepare order products
//     const orderProducts = cart.items.map(i => ({
//       productId: i.productId,
//       quantity: i.quantity,
//       price: i.price,
//     }));

//     // Prepare shipping address with proper field mapping
//     const finalShippingAddress = shippingAddress || {
//       fullName: user.fullName || user.name || '',
//       phone: user.phone || '',
//       addressLine1: user.location || '',
//       city: user.city || '',
//       postalCode: user.postalCode || '',
//       country: user.country || 'India'
//     };

//     // Handle field name mapping (frontend sends 'street', backend expects 'addressLine1')
//     if (shippingAddress && shippingAddress.street) {
//       finalShippingAddress.addressLine1 = shippingAddress.addressLine1 || shippingAddress.street;
//     }

//     // Validate required shipping address fields
//     const requiredFields = ['fullName', 'phone', 'addressLine1', 'city', 'postalCode'];
//     const missingFields = requiredFields.filter(field => !finalShippingAddress[field]);
//     if (missingFields.length > 0) {
//       return res.status(400).json({
//         success: false,
//         message: `Missing required shipping address fields: ${missingFields.join(', ')}`
//       });
//     }

//     // Create order
//     const order = await Order.create({
//       userId: req.user.id,
//       products: orderProducts,
//       totalAmount: cart.totalAmount,
//       paymentMethod: "cash_on_delivery",
//       deliveryLocation: user.location || finalShippingAddress.addressLine1,
//       shippingAddress: finalShippingAddress,
//       paymentStatus: "pending",
//       orderStatus: "Processing"
//     });

//     // Set delivery date (3 days from now)
//     const deliveryDate = new Date();
//     deliveryDate.setDate(deliveryDate.getDate() + 3);
//     order.deliveryDate = deliveryDate;
//     await order.save();

//     // Update product stock (use atomic operations to prevent race conditions)
//     const stockUpdatePromises = cart.items.map(cartItem => 
//       Product.findByIdAndUpdate(
//         cartItem.productId,
//         { $inc: { stock: -cartItem.quantity } },
//         { new: true }
//       )
//     );

//     await Promise.all(stockUpdatePromises);

//     // Clear cart
//     cart.items = [];
//     cart.totalAmount = 0;
//     await cart.save();

//     // Get complete order with populated data
//     const fullOrder = await Order.findById(order._id)
//       .populate("products.productId", "name type description images image");

//     res.status(201).json({
//       success: true,
//       message: "Order created successfully",
//       data: { order: fullOrder },
//     });

//   } catch (err) {
//     logger.error("❌ Error creating order:", err);
//     res.status(500).json({ 
//       success: false, 
//       message: "Error creating order", 
//       error: err.message 
//     });
//   }
// };

import logger from "../utils/logger.js";
import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";

// ==================== CREATE ORDER ====================
export const createOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    logger.info("🛒 Creating order for user:", req.user.id);

    const cart = await Cart.getOrCreateCart(req.user.id);

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty"
      });
    }

    // 🔥 FIX: Normalize productId (cart may store product as full object)
    const productIds = cart.items
      .map((item) => {
        if (!item.productId) return null;

        // productId may be full object → extract _id
        if (typeof item.productId === "object" && item.productId._id) {
          return item.productId._id.toString();
        }

        // already an id
        return item.productId.toString();
      })
      .filter(Boolean);

    logger.info("🔍 Normalized Product IDs:", productIds);

    // Get products from DB
    const products = await Product.find({ _id: { $in: productIds } });

    logger.info("📦 Products found:", products.length);

    // Check mismatch
    if (products.length !== cart.items.length) {
      return res.status(400).json({
        success: false,
        message: "Some products not found in database"
      });
    }

    // Build order products with correct validation
    const orderProducts = [];

    for (let item of cart.items) {
      // normalize cart item id again
      let cartId =
        typeof item.productId === "object" && item.productId._id
          ? item.productId._id.toString()
          : item.productId.toString();

      const product = products.find(
        (p) => p._id.toString() === cartId
      );

      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product not found: ${JSON.stringify(item.productId)}`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `${product.name} - not enough stock`
        });
      }

      orderProducts.push({
        productId: product._id,
        quantity: item.quantity,
        price: product.price || 0
      });
    }

    // User for auto-fill address
    const user = await User.findById(req.user.id);

    const finalShippingAddress = {
      fullName: shippingAddress?.fullName || user?.name || "",
      phone: shippingAddress?.phone || user?.phone || "",
      addressLine1: shippingAddress?.addressLine1 || user?.address || "",
      city: shippingAddress?.city || user?.city || "",
      postalCode: shippingAddress?.postalCode || user?.postalCode || "",
      country: shippingAddress?.country || user?.country || "India"
    };

    // Create order
    const order = await Order.create({
      userId: req.user.id,
      products: orderProducts,
      totalAmount: cart.totalAmount,
      paymentMethod: "cash_on_delivery",
      deliveryLocation: user?.location || finalShippingAddress.addressLine1,
      shippingAddress: finalShippingAddress,
      orderStatus: "Processing",
      paymentStatus: "pending"
    });

    // Clear cart
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    logger.info("✅ Order Created:", order._id);

    res.status(201).json({
      success: true,
      message: "Order created",
      data: order
    });
  } catch (err) {
    logger.error("❌ CREATE ORDER ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Error creating order",
      error: err.message
    });
  }
};










// 📦 Get User Orders
export const getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    // Build query
    const query = { userId: req.user.id };
    if (status) {
      query.orderStatus = status;
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate("products.productId", "name type description images image");

    // Get total count for pagination
    const total = await Order.countDocuments(query);

    res.status(200).json({ 
      success: true, 
      message: "Orders fetched successfully",
      data: {
        orders,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / limit),
          totalOrders: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (err) {
    logger.error("❌ Error fetching orders:", err);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching orders", 
      error: err.message 
    });
  }
};

// 🔍 Get Single Order
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    const order = await Order.findById(orderId)
      .populate("products.productId", "name type description images image")
      .populate("userId", "name email");

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: "Order not found" 
      });
    }

    // Check if user owns this order or is admin
    if (order.userId._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: "Unauthorized to access this order" 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: "Order fetched successfully", 
      data: order 
    });

  } catch (err) {
    logger.error("❌ Error getting order:", err);
    res.status(500).json({ 
      success: false, 
      message: "Error getting order", 
      error: err.message 
    });
  }
};

// 🔄 Update Order Status (Admin only)
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    if (!["Processing", "Delivered", "Cancelled"].includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status'
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update order status
    order.orderStatus = orderStatus;
    
    // Set delivery date if order is delivered
    if (orderStatus === "Delivered") {
      order.deliveryDate = new Date();
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });

  } catch (err) {
    logger.error("❌ Error updating order status:", err);
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: err.message
    });
  }
};

// ❌ Cancel Order
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns this order
    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to cancel this order'
      });
    }

    // Check if order can be cancelled (only if it's still processing)
    if (order.orderStatus !== "Processing") {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage'
      });
    }

    // Update order status
    order.orderStatus = "Cancelled";
    await order.save();

    // Restore product stock
    for (const orderProduct of order.products) {
      await Product.findByIdAndUpdate(
        orderProduct.productId,
        { $inc: { stock: orderProduct.quantity } }
      );
    }


    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });

  } catch (err) {
    logger.error("❌ Error cancelling order:", err);
    res.status(500).json({
      success: false,
      message: 'Error cancelling order',
      error: err.message
    });
  }
};

// 📊 Get All Orders (Admin only)
export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    
    // Build query
    const query = {};
    if (status && status !== 'all') {
      query.orderStatus = status;
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'userId.name': { $regex: search, $options: 'i' } },
        { 'userId.email': { $regex: search, $options: 'i' } }
      ];
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate("userId", "name email")
      .populate("products.productId", "name type description images image");

    // Get total count for pagination
    const total = await Order.countDocuments(query);

    res.status(200).json({ 
      success: true, 
      message: "Orders fetched successfully",
      data: {
        orders,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / limit),
          totalOrders: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (err) {
    logger.error("❌ Error fetching all orders:", err);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching orders", 
      error: err.message 
    });
  }
};

export default {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getAllOrders,
};

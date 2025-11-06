import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import Payment from "../models/payment.model.js";
import Product from "../models/product.model.js";
import Stripe from 'stripe';

// Initialize Stripe
let stripe;
try {
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_your_stripe_secret_key_here') {
        console.warn('Stripe secret key is not configured or using placeholder value.');
        stripe = null;
    } else {
        stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    }
} catch (error) {
    console.error('Failed to initialize Stripe:', error.message);
    stripe = null;
}

// ==================== ORDER CONTROLLERS ====================

/**
 * Create order from cart with payment method selection
 */
export const createOrder = async (req, res) => {
    try {
        const { paymentMethod, shippingAddress } = req.body;

        if (!paymentMethod) {
            return res.status(400).json({
                success: false,
                message: 'Payment method is required'
            });
        }

        if (!['card', 'paypal', 'bank_transfer', 'cash_on_delivery'].includes(paymentMethod)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment method'
            });
        }

        // Get user's cart
        const cart = await Cart.getOrCreateCart(req.user.id);
        
        if (cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cart is empty'
            });
        }

        // Check product availability and get product names
        const productIds = cart.items.map(item => item.productId);
        const products = await Product.find({ _id: { $in: productIds } });
        
        if (products.length !== productIds.length) {
            return res.status(400).json({
                success: false,
                message: 'Some products in cart are no longer available'
            });
        }

        // Create order items with product names
        const orderItems = cart.items.map(item => {
            const product = products.find(p => p._id.toString() === item.productId.toString());
            return {
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
                productName: product.name
            };
        });

        // Create order
        const order = new Order({
            userId: req.user.id,
            items: orderItems,
            totalAmount: cart.totalAmount,
            paymentMethod,
            shippingAddress: shippingAddress || {}
        });

        await order.save();

        // Create payment record
        let payment;
        if (paymentMethod === 'cash_on_delivery') {
            // For cash on delivery, create payment record without Stripe
            payment = new Payment({
                userId: req.user.id,
                orderId: order._id,
                stripePaymentIntentId: `COD-${order.orderNumber}`,
                amount: order.totalAmount,
                paymentMethod: 'cash_on_delivery',
                status: 'pending',
                description: `Cash on delivery for order ${order.orderNumber}`
            });
            await payment.save();
            
            // Link payment to order
            order.paymentId = payment._id;
            order.paymentStatus = 'pending';
            await order.save();
        }

        // Clear cart after order creation
        cart.items = [];
        await cart.save();

        // Return order with payment details
        const populatedOrder = await Order.findById(order._id)
            .populate('items.productId', 'name type description capacity warrantyPeriod')
            .populate('paymentId');

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: {
                order: populatedOrder,
                payment: payment || null,
                requiresPayment: paymentMethod !== 'cash_on_delivery'
            }
        });

    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create order',
            error: error.message
        });
    }
};

/**
 * Process payment for order (for online payments)
 */
export const processOrderPayment = async (req, res) => {
    try {
        const { orderId } = req.params;

        // Find order
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
                message: 'You are not authorized to access this order'
            });
        }

        // Check if payment is already processed
        if (order.paymentStatus === 'paid') {
            return res.status(400).json({
                success: false,
                message: 'Payment already processed for this order'
            });
        }

        // Check if it's cash on delivery
        if (order.paymentMethod === 'cash_on_delivery') {
            return res.status(400).json({
                success: false,
                message: 'This is a cash on delivery order. No online payment required.'
            });
        }

        // Create Stripe payment intent
        if (!stripe) {
            return res.status(500).json({
                success: false,
                message: 'Payment system is not properly configured'
            });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(order.totalAmount * 100), // Convert to cents
            currency: 'usd',
            description: `Payment for order ${order.orderNumber}`,
            metadata: {
                orderId: order._id.toString(),
                userId: req.user.id
            },
            automatic_payment_methods: {
                enabled: true
            }
        });

        // Create payment record
        const payment = new Payment({
            userId: req.user.id,
            orderId: order._id,
            stripePaymentIntentId: paymentIntent.id,
            amount: order.totalAmount,
            paymentMethod: order.paymentMethod,
            status: 'pending',
            description: `Payment for order ${order.orderNumber}`
        });

        await payment.save();

        // Link payment to order
        order.paymentId = payment._id;
        await order.save();

        res.status(200).json({
            success: true,
            message: 'Payment intent created successfully',
            data: {
                clientSecret: paymentIntent.client_secret,
                paymentId: payment._id,
                orderId: order._id,
                amount: order.totalAmount,
                currency: 'usd'
            }
        });

    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process payment',
            error: error.message
        });
    }
};

/**
 * Confirm payment for order
 */
export const confirmOrderPayment = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { paymentIntentId } = req.body;

        // Find order
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
                message: 'You are not authorized to access this order'
            });
        }

        // Find payment
        const payment = await Payment.findById(order.paymentId);
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        // Verify payment intent ID matches
        if (payment.stripePaymentIntentId !== paymentIntentId) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment intent ID'
            });
        }

        // Retrieve payment intent from Stripe
        if (stripe) {
            const stripePaymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
            
            if (stripePaymentIntent.status === 'succeeded') {
                // Update payment status
                payment.status = 'succeeded';
                await payment.save();

                // Update order status
                order.paymentStatus = 'paid';
                order.orderStatus = 'confirmed';
                await order.save();
            } else {
                payment.status = stripePaymentIntent.status === 'canceled' ? 'canceled' : 'failed';
                await payment.save();
            }
        } else {
            // For demo purposes, mark as succeeded
            payment.status = 'succeeded';
            await payment.save();
            order.paymentStatus = 'paid';
            order.orderStatus = 'confirmed';
            await order.save();
        }

        res.status(200).json({
            success: true,
            message: 'Payment confirmed successfully',
            data: {
                orderId: order._id,
                paymentStatus: payment.status,
                orderStatus: order.orderStatus
            }
        });

    } catch (error) {
        console.error('Error confirming payment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to confirm payment',
            error: error.message
        });
    }
};

/**
 * Get user's orders
 */
export const getUserOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        
        // Build query
        const query = { userId: req.user.id };
        if (status) {
            query.orderStatus = status;
        }

        // Get orders with pagination
        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('items.productId', 'name type description capacity warrantyPeriod')
            .select('-__v');

        // Get total count for pagination
        const total = await Order.countDocuments(query);

        res.status(200).json({
            success: true,
            message: 'Orders retrieved successfully',
            data: {
                orders,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalOrders: total,
                    hasNext: page < Math.ceil(total / limit),
                    hasPrev: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Error getting orders:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve orders',
            error: error.message
        });
    }
};

/**
 * Get specific order by ID
 */
export const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId)
            .populate('items.productId', 'name type description capacity warrantyPeriod')
            .populate('paymentId');

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
                message: 'You are not authorized to access this order'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Order retrieved successfully',
            data: order
        });

    } catch (error) {
        console.error('Error getting order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve order',
            error: error.message
        });
    }
};

/**
 * Cancel order
 */
export const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;

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
                message: 'You are not authorized to access this order'
            });
        }

        // Check if order can be canceled
        if (['shipped', 'delivered'].includes(order.orderStatus)) {
            return res.status(400).json({
                success: false,
                message: 'Order cannot be canceled at this stage'
            });
        }

        // Update order status
        order.orderStatus = 'canceled';
        await order.save();

        // If there's a payment, cancel it
        if (order.paymentId) {
            const payment = await Payment.findById(order.paymentId);
            if (payment && payment.status === 'pending') {
                payment.status = 'canceled';
                await payment.save();

                // Cancel Stripe payment intent if exists
                if (stripe && payment.stripePaymentIntentId && payment.paymentMethod !== 'cash_on_delivery') {
                    try {
                        await stripe.paymentIntents.cancel(payment.stripePaymentIntentId);
                    } catch (stripeError) {
                        console.error('Error canceling Stripe payment intent:', stripeError);
                    }
                }
            }
        }

        res.status(200).json({
            success: true,
            message: 'Order canceled successfully',
            data: {
                orderId: order._id,
                orderStatus: order.orderStatus
            }
        });

    } catch (error) {
        console.error('Error canceling order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel order',
            error: error.message
        });
    }
};

// Admin functions (for admin users only)

/**
 * Get all orders (admin only)
 */
export const getAllOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, userId } = req.query;
        
        // Build query
        const query = {};
        if (status) {
            query.orderStatus = status;
        }
        if (userId) {
            query.userId = userId;
        }

        // Get orders with pagination
        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('userId', 'name email')
            .populate('items.productId', 'name type')
            .select('-__v');

        // Get total count for pagination
        const total = await Order.countDocuments(query);

        res.status(200).json({
            success: true,
            message: 'All orders retrieved successfully',
            data: {
                orders,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalOrders: total,
                    hasNext: page < Math.ceil(total / limit),
                    hasPrev: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Error getting all orders:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve orders',
            error: error.message
        });
    }
};

/**
 * Update order status (admin only)
 */
export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { orderStatus } = req.body;

        if (!orderStatus) {
            return res.status(400).json({
                success: false,
                message: 'Order status is required'
            });
        }

        const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'canceled'];
        if (!validStatuses.includes(orderStatus)) {
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

        order.orderStatus = orderStatus;
        
        // Set delivery date if order is delivered
        if (orderStatus === 'delivered') {
            order.deliveryDate = new Date();
        }

        await order.save();

        res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            data: {
                orderId: order._id,
                orderStatus: order.orderStatus,
                deliveryDate: order.deliveryDate
            }
        });

    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update order status',
            error: error.message
        });
    }
};

export default {
    createOrder,
    processOrderPayment,
    confirmOrderPayment,
    getUserOrders,
    getOrderById,
    cancelOrder,
    getAllOrders,
    updateOrderStatus
};

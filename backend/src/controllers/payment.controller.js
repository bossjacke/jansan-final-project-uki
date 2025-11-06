import Stripe from 'stripe';
import Payment from '../models/payment.model.js';

// Initialize Stripe with proper error handling
let stripe;
try {
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_your_stripe_secret_key_here') {
        console.warn('Stripe secret key is not configured or using placeholder value. Payment features will be limited.');
        stripe = null;
    } else {
        stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    }
} catch (error) {
    console.error('Failed to initialize Stripe:', error.message);
    stripe = null;
}

// ==================== PAYMENT CONTROLLERS ====================

/**
 * Create a payment intent using Stripe
 * This is the first step in processing a payment
 */
export const createPaymentIntent = async (req, res) => {
    try {
        const { amount, currency = 'usd', description, metadata = {} } = req.body;

        // Validate input
        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Amount must be greater than 0'
            });
        }

        // Check if Stripe is properly configured
        if (!stripe) {
            return res.status(500).json({
                success: false,
                message: 'Payment system is not properly configured'
            });
        }

        // Create payment intent with Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency,
            description,
            metadata: {
                userId: req.user.id,
                ...metadata
            },
            automatic_payment_methods: {
                enabled: true
            }
        });

        // Save payment record to database
        const payment = new Payment({
            userId: req.user.id,
            stripePaymentIntentId: paymentIntent.id,
            amount,
            currency,
            status: 'pending',
            description,
            metadata
        });

        await payment.save();

        res.status(200).json({
            success: true,
            message: 'Payment intent created successfully',
            data: {
                clientSecret: paymentIntent.client_secret,
                paymentId: payment._id,
                amount,
                currency
            }
        });

    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create payment intent',
            error: error.message
        });
    }
};

/**
 * Confirm a payment and update its status
 * This is called after the client successfully completes the payment
 */
export const confirmPayment = async (req, res) => {
    try {
        const { paymentIntentId } = req.body;

        if (!paymentIntentId) {
            return res.status(400).json({
                success: false,
                message: 'Payment intent ID is required'
            });
        }

        // Find the payment in our database
        const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntentId });
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        // Check if user owns this payment
        if (payment.userId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to access this payment'
            });
        }

        // Retrieve payment intent from Stripe to get the latest status
        if (stripe) {
            const stripePaymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
            
            // Update payment status based on Stripe status
            payment.status = stripePaymentIntent.status === 'succeeded' ? 'succeeded' : 
                           stripePaymentIntent.status === 'canceled' ? 'canceled' : 'failed';
        } else {
            // If Stripe is not available, mark as succeeded for demo purposes
            payment.status = 'succeeded';
        }

        await payment.save();

        res.status(200).json({
            success: true,
            message: 'Payment confirmed successfully',
            data: {
                paymentId: payment._id,
                status: payment.status,
                amount: payment.amount,
                currency: payment.currency
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
 * Get payment history for the authenticated user
 */
export const getPaymentHistory = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        
        // Build query
        const query = { userId: req.user.id };
        if (status) {
            query.status = status;
        }

        // Get payments with pagination
        const payments = await Payment.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .select('-metadata -__v');

        // Get total count for pagination
        const total = await Payment.countDocuments(query);

        res.status(200).json({
            success: true,
            message: 'Payment history retrieved successfully',
            data: {
                payments,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalPayments: total,
                    hasNext: page < Math.ceil(total / limit),
                    hasPrev: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Error getting payment history:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve payment history',
            error: error.message
        });
    }
};

/**
 * Get a specific payment by ID
 */
export const getPaymentById = async (req, res) => {
    try {
        const { paymentId } = req.params;

        if (!paymentId) {
            return res.status(400).json({
                success: false,
                message: 'Payment ID is required'
            });
        }

        // Find payment by ID
        const payment = await Payment.findById(paymentId)
            .populate('userId', 'name email')
            .populate('orderId', 'orderNumber totalAmount');

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        // Check if user owns this payment
        if (payment.userId._id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to access this payment'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Payment retrieved successfully',
            data: payment
        });

    } catch (error) {
        console.error('Error getting payment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve payment',
            error: error.message
        });
    }
};

/**
 * Cancel a pending payment
 */
export const cancelPayment = async (req, res) => {
    try {
        const { paymentId } = req.params;

        if (!paymentId) {
            return res.status(400).json({
                success: false,
                message: 'Payment ID is required'
            });
        }

        // Find payment by ID
        const payment = await Payment.findById(paymentId);

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        // Check if user owns this payment
        if (payment.userId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to access this payment'
            });
        }

        // Check if payment can be canceled (only pending payments)
        if (payment.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Only pending payments can be canceled'
            });
        }

        // Cancel payment intent in Stripe
        if (stripe) {
            try {
                await stripe.paymentIntents.cancel(payment.stripePaymentIntentId);
            } catch (stripeError) {
                console.error('Error canceling Stripe payment intent:', stripeError);
            }
        }

        // Update payment status
        payment.status = 'canceled';
        await payment.save();

        res.status(200).json({
            success: true,
            message: 'Payment canceled successfully',
            data: {
                paymentId: payment._id,
                status: payment.status
            }
        });

    } catch (error) {
        console.error('Error canceling payment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel payment',
            error: error.message
        });
    }
};

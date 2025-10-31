import Stripe from "stripe";
// Minimal payment controller stub. Expand with real payment flows later.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export const createPaymentIntent = async (req, res) => {
	try {
		// For now return a simple placeholder response.
		res.status(200).json({ message: "Payment endpoint not implemented yet" });
	} catch (error) {
		res.status(500).json({ message: "Payment error", error: error.message });
	}
};

export default { createPaymentIntent };

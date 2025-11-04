import Joi from 'joi';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import sendEmail from '../utils/email.js';

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

export const forgotPassword = async (req, res) => {
  // Validate email
  const schema = Joi.object({ email: Joi.string().email().required() });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: 'Invalid email', error: error.details });

  const { email } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(200).json({ message: 'If that email exists, a reset link was sent.' });

    // Create a short-lived token (e.g., 1 hour)
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });

    // Build reset URL (frontend will use this token)
    const resetUrl = `${FRONTEND_URL}/reset-password/${token}`;

    // Send email
    const subject = 'Reset your password';
    const text = `You requested a password reset. Click the link to reset your password:\n\n${resetUrl}\n\nIf you did not request this, ignore this email.`;

    try {
      await sendEmail({ to: user.email, subject, text });
    } catch (emailError) {
      console.error('Email send failed:', emailError);
      // Still return success to prevent email enumeration attacks
      // But log the reset URL for development
      console.log('=== DEVELOPMENT: Reset URL ===');
      console.log('Email would be sent to:', user.email);
      console.log('Reset URL:', resetUrl);
      console.log('=============================');
    }

    return res.json({ message: 'If that email exists, a reset link was sent.' });
  } catch (err) {
    console.error('forgotPassword error', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  // Validate password
  const schema = Joi.object({ password: Joi.string().min(6).required() });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: 'Invalid password', error: error.details });

  const { password } = req.body;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;
    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ message: 'Invalid token or user not found' });

    // Hash password and save
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    user.password = hashed;
    await user.save();

    return res.json({ message: 'Password has been reset successfully' });
  } catch (err) {
    console.error('resetPassword error', err);
    return res.status(400).json({ message: 'Invalid or expired token', error: err.message });
  }
};

export default { forgotPassword, resetPassword };

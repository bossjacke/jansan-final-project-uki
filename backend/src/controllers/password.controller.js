import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import sendEmail from '../utils/email.js';

// Rate limiting map (in production, use Redis or database)
const otpRequests = new Map();

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  
  // Input validation
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Valid email required' });
  }

  // Rate limiting: max 3 requests per 15 minutes per email
  const now = Date.now();
  const userRequests = otpRequests.get(email) || [];
  const recentRequests = userRequests.filter(time => now - time < 15 * 60 * 1000);
  
  if (recentRequests.length >= 3) {
    return res.status(429).json({ 
      message: 'Too many requests. Please try again later.' 
    });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    
    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ message: 'If email exists, OTP sent successfully' });
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to database
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Update rate limiting
    recentRequests.push(now);
    otpRequests.set(email, recentRequests);

    // Send email
    const subject = 'Password Reset OTP';
    const text = `Your password reset OTP is: ${otp}\n\nThis OTP expires in 10 minutes.\n\nIf you didn't request this, please ignore this email.`;

    try {
      await sendEmail({ to: user.email, subject, text });
      console.log('OTP sent successfully to:', user.email);
    } catch (emailError) {
      console.error('Email send failed:', emailError);
      // Log OTP for development
      console.log('=== DEVELOPMENT MODE ===');
      console.log('Email:', user.email);
      console.log('OTP:', otp);
      console.log('Expires:', otpExpires);
      console.log('========================');
    }

    res.json({ message: 'If email exists, OTP sent successfully' });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  // Input validation
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ 
      message: 'Email, OTP, and new password are required' 
    });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Valid email required' });
  }

  if (!/^\d{6}$/.test(otp)) {
    return res.status(400).json({ message: 'Invalid OTP format' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ 
      message: 'Password must be at least 6 characters' 
    });
  }

  try {
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      otp: otp,
      otpExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid or expired OTP' 
      });
    }

    // Hash password and save
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);
    user.password = hashed;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export default { forgotPassword, resetPassword };

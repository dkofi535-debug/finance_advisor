const { registerUser, loginUser, getUserProfile } = require('../services/authService');

/**
 * Register a new user and return a JWT token.
 */
const register = async (req, res, next) => {
  try {
    const { full_name, password } = req.body;
    const email = req.body.email?.trim().toLowerCase();

    // Validate full name
    if (!full_name || !full_name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Full name is required.',
      });
    }

    // Validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required.',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.',
      });
    }

    // Validate password
    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters.',
      });
    }

    const result = await registerUser({
      full_name,
      email,
      password,
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful.',
      token: result.token,
      user: result.user,
    });

  } catch (error) {

    if (error.statusCode === 409) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered.',
      });
    }

    next(error);
  }
};

/**
 * Authenticate a user and return a JWT token.
 */
const login = async (req, res, next) => {
  try {
    const { password } = req.body;
    const email = req.body.email?.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required.',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(email)) {
  return res.status(400).json({
    success: false,
    message: 'Please enter a valid email address.',
  });
}

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required.',
      });
    }

    const result = await loginUser({ email, password });

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    if (error.statusCode === 401) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    next(error);
  }
};

/**
 * Get the authenticated user's profile.
 */
const getProfile = async (req, res, next) => {
  try {
    const profile = await getUserProfile(req.user.id);

    return res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully.',
      user: profile,
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
      });
    }

    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
};
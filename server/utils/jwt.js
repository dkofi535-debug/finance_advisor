const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

// Ensure JWT_SECRET exists before the application starts
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is missing in the .env file');
}

/**
 * Generate a signed JWT for a user payload.
 * @param {object} payload - The user data to encode into the token.
 * @returns {string} A signed JWT string.
 */
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });
};

/**
 * Verify and decode a JWT token.
 * @param {string} token - The JWT string to verify.
 * @returns {object} The decoded payload from the token.
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
  generateToken,
  verifyToken,
};
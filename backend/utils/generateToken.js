const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT token for user authentication
 * @param {string} id - User ID
 * @returns {string} Signed JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'meditrack_jwt_secret_key_12345', {
    expiresIn: '30d',
  });
};

module.exports = generateToken;

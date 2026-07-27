console.log("✅ authRoutes.js loaded from:", __filename);

const express = require('express');
const router = express.Router();

const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public Auth routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected Profile route
router.get('/me', protect, getMe);

router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes are working!' });
});

module.exports = router;

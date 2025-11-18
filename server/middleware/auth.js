const jwt = require('jsonwebtoken');

// This middleware function verifies the user's token
module.exports = function (req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if not token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user; // Add user payload to request
    next(); // Move to the next function
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
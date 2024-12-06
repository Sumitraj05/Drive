const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  try {
    // Retrieve the token from cookies
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        message: 'Unauthorized: No token provided',
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded user information to the request object
    req.user = decoded;

    next(); // Pass control to the next middleware
  } catch (err) {
    return res.status(401).json({
      message: 'Unauthorized: Invalid token',
    });
  }
}

module.exports = auth;

const jwt = require('jsonwebtoken');
const Signup = require("../models/authModal")

const JWT_SECRET = process.env.SECRET_KEY || 'devBishu';

const authMiddleware = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Authorization: Bearer token
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { userId, role } = decoded;

    const user = await Signup.findById(userId);

    if (!user) {
      return res.status(401).json({ message: 'user not found' });
    }

    req.userId = userId;
    req.role = role; 
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;

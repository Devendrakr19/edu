const jwt = require('jsonwebtoken');
const Teacher = require('../models/teacherModel');

const JWT_SECRET = process.env.SECRET_KEY || 'devBishu';

const authMiddleware = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Authorization: Bearer token
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const teacher = await Teacher.findById(decoded.id);

    if (!teacher) {
      return res.status(401).json({ message: 'Teacher not found' });
    }

    req.teacherId = decoded.id; // Attach teacherId to the request object
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;

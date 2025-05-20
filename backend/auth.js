const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();

const SECRET_KEY = 'your_secret_key_here'; // Replace with env variable in production

// In-memory user store for demo purposes
const users = [
  {
    id: 1,
    username: 'admin',
    passwordHash: '', // to be set on server start
    role: 'admin'
  }
];

// Hash password for demo user on server start
(async () => {
  const password = 'adminpassword'; // Change to secure password
  const hash = await bcrypt.hash(password, 10);
  users[0].passwordHash = hash;
})();

// Login route
router.post('/login', express.json(), async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }
  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
  res.json({ token });
});

// Registration route
router.post('/register', express.json(), async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  const existingUser = users.find(u => u.username === username);
  if (existingUser) {
    return res.status(400).json({ message: 'Username already exists' });
  }
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = {
      id: users.length + 1,
      username,
      passwordHash,
      role: 'admin'
    };
    users.push(newUser);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user' });
  }
});

// Middleware to verify token and role
function authenticateRole(role) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Missing authorization header' });
    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Missing token' });
    try {
      const payload = jwt.verify(token, SECRET_KEY);
      if (payload.role !== role) {
        return res.status(403).json({ message: 'Forbidden: insufficient rights' });
      }
      req.user = payload;
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
}


module.exports = { router, authenticateRole };

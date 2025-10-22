const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// User Signup
exports.signup = async (req, res) => {
  const { username, email, password } = req.body;
    try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    user = new User({ username,email, password: hashedPassword });
    await user.save();

    // Generate JWT
    const token = jwt.sign({id:user._id}, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({ token, message: 'User registered successfully' });
    } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

//login
exports.login = async (req, res) => {
  const { email, password } = req.body;
    try {

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }


    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }
    

    // Generate JWT
    const token = jwt.sign({id:user._id}, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(200).json({ token, message: 'Login successful' });
    } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  } 
};
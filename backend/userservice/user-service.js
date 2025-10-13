import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import User from "./user-model.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const app = express();
const port = 8001; 

const secretKey = 'your-secret-key';

app.use(express.json());

const corsOptions = {
  origin: [
    process.env.USER_SERVICE_URL || "http://localhost:8001",
    process.env.MONGODB_URI || "mongodb://localhost:27017/userdb",
  ],
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/userdb';
mongoose.connect(mongoUri);

/**
 * Validates email format using regex pattern
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email format is valid
 */
function validateEmailFormat(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates that all required fields are present in request body
 * @param {Object} req - Express request object
 * @param {string[]} requiredFields - Array of required field names
 * @throws {Error} If any required field is missing or email format is invalid
 */
function validateRequiredFields(req, requiredFields) {
    for (const field of requiredFields) {
      if (!(field in req.body)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    if (requiredFields.includes('email') && req.body.email) {
      if (!validateEmailFormat(req.body.email)) {
        throw new Error('Invalid email format');
      }
    }
}

/**
 * Creates a new user account
 * @route POST /adduser
 * @param {Object} req.body - User registration data
 * @param {string} req.body.username - Unique username
 * @param {string} req.body.name - User first name
 * @param {string} req.body.surname - User last name
 * @param {string} req.body.email - User email address
 * @param {string} req.body.password - User password
 * @param {string} req.body.confirmPassword - Password confirmation
 * @param {string} [req.body.role="user"] - User role (default: user)
 * @returns {Object} User data with authentication tokens
 */
app.post("/adduser", async (req, res) => {
  try {
    validateRequiredFields(req, ["username", "name", "surname", "email", "password", "confirmPassword"]);

    const { username, password, confirmPassword, email } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({
        error: "Passwords do not match.",
        field: "confirmPassword"
      });
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error: "Password must be at least 8 characters long, contain at least one uppercase letter, and at least one number.",
        field: "password"
      });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        error: "Username already exists. Please choose a different username.",
        field: "username"
      });
    }

    const existingEmail = await User.findOne({ email: email });
    if (existingEmail) {
      return res.status(400).json({
        error: "Email already exists. Please choose a different email.",
        field: "email"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      name: req.body.name,
      surname: req.body.surname,
      email: email,
      role: req.body.role || "user",
      password: hashedPassword,
    });

    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, secretKey, { expiresIn: "1h" });

    const roleToken = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      secretKey, 
      { expiresIn: '1h' }
    );

    res.status(200).json({
      username: newUser.username,
      createdAt: newUser.createdAt,
      token: token,
      roleToken: roleToken,
    });
  } catch (error) {
    if (error.message.includes('Invalid email format')) {
      return res.status(400).json({ 
        error: 'Invalid email format',
        field: 'email'
      });
    }
    
    res.status(400).json({ 
      error: error.message,
      field: 'general'
    });
  }
});

/**
 * Authenticates user and returns JWT tokens
 * @route POST /login
 * @param {Object} req.body - Login credentials
 * @param {string} req.body.username - User username
 * @param {string} req.body.password - User password
 * @returns {Object} Authentication tokens and user data
 */
app.post('/login', async (req, res) => {
  try {
    validateRequiredFields(req, ['username', 'password']);

    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (user && await bcrypt.compare(password, user.password)) {

      const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '1h' });

      const roleToken = jwt.sign(
        { userId: user._id, role: user.role },
       secretKey, 
        { expiresIn: '1h' }
      );
  
      res.json({ token: token, roleToken:roleToken, username: username, createdAt: user.createdAt });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Validates and sanitizes string input
 * @param {*} input - Input to validate
 * @returns {string} Trimmed string
 * @throws {Error} If input is not a string
 */
function checkInput(input) {
  if (typeof input !== "string") {
    throw new Error("Input debe ser una cadena de texto");
  }
  return input.trim();
}

/**
 * Retrieves all users (excluding passwords)
 * @route GET /users
 * @returns {Object[]} Array of user objects without passwords
 */
app.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, { password: 0});
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * Searches for a specific user by username or userId
 * @route GET /users/search
 * @param {string} [req.query.username] - Username to search for
 * @param {string} [req.query.userId] - User ID to search for
 * @returns {Object} User data without password
 */
app.get("/users/search", async (req, res) => {
  try {
    const { username, userId } = req.query;
    
    let currentUser;
    
    if (username) {
      // Buscar por coincidencia exacta primero
      currentUser = await User.findOne({ username: username });
      
      // Si no se encuentra coincidencia exacta, buscar por coincidencia parcial
      if (!currentUser) {
        currentUser = await User.findOne({ username: { $regex: username, $options: 'i' } });
      }
    } else if (userId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid userId format" });
    }
      currentUser = await User.findById(userId);
    } else {
      return res.status(400).json({ error: "Username or userId is required" });
    }
    
    console.log(currentUser);
    console.log(username || userId);
    
    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const { password, ...userWithoutPassword } = currentUser.toObject();
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error("Error in /users/search:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * Updates user profile information
 * @route PUT /edit-user/:userId
 * @param {string} req.params.userId - User ID to update
 * @param {Object} req.body - Updated user data
 * @param {string} [req.body.password] - New password (requires currentPassword)
 * @param {string} [req.body.currentPassword] - Current password for verification
 * @returns {Object} Updated user data
 */
app.put("/edit-user/:userId", async (req, res) => {
  try {
    const { password, currentPassword, ...otherFields } = req.body;
    const userId = req.params.userId;

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ 
        error: "User not found",
        field: "general"
      });
    }

    let updateData = { ...otherFields };

    if (password) {
      if (!currentPassword) {
        return res.status(400).json({
          error: "Current password is required to change password",
          field: "currentPassword"
        });
      }

      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, currentUser.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          error: "Current password is incorrect",
          field: "currentPassword"
        });
      }

      const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({
          error: "Password must be at least 8 characters long, contain at least one uppercase letter, and at least one number.",
          field: "password"
        });
      }

      const isSamePassword = await bcrypt.compare(password, currentUser.password);
      if (isSamePassword) {
        return res.status(400).json({
          error: "New password must be different from current password",
          field: "password"
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    if (otherFields.email) {
      if (!validateEmailFormat(otherFields.email)) {
        return res.status(400).json({
          error: "Invalid email format",
          field: "email"
        });
      }

      const existingEmailUser = await User.findOne({ 
        email: otherFields.email,
        _id: { $ne: userId }
      });
      
      if (existingEmailUser) {
        return res.status(400).json({
          error: "Email already exists. Please choose a different email.",
          field: "email"
        });
      }
    }

    if (otherFields.username) {
      const existingUsernameUser = await User.findOne({ 
        username: otherFields.username,
        _id: { $ne: userId }
      });
      
      if (existingUsernameUser) {
        return res.status(400).json({
          error: "Username already exists. Please choose a different username.",
          field: "username"
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      updateData, 
      { new: true, select: '-password' }
    );

    res.status(200).json({
      message: password ? "Profile and password updated successfully" : "Profile updated successfully",
      user: updatedUser
    });

  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ 
      error: "Failed to update user",
      field: "general"
    });
  }
});

/**
 * Verifies JWT token and returns user role
 * @route POST /verifyToken
 * @param {Object} req.body - Token verification data
 * @param {string} req.body.token - JWT token to verify
 * @returns {Object} User role information
 */
app.post('/verifyToken', (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    const role = decoded.role;
    if (role === 'admin') {
      res.status(200).json({ role });
    } else {
      res.status(403).json({ error: 'Forbidden' });
    }
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});


const server = app.listen(port, () => {
  console.log(`User Service listening at http://localhost:${port}`);
});

server.on('close', () => {
    mongoose.connection.close();
  });

  export default server;
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import User from "./user-model.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const app = express();
const port = 8001; 

const secretKey='your-secret-key';

// Middleware to parse JSON in request body
app.use(express.json());

const corsOptions = {
  origin: [
    process.env.USER_SERVICE_URL || "http://localhost:8001",
    process.env.MONGODB_URI || "mongodb://localhost:27017/userdb",
  ],
};

app.use(cors(corsOptions));

// Middleware to parse JSON in request body
app.use(bodyParser.json());

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/userdb';
mongoose.connect(mongoUri);

// Function to validate required fields in the request body
function validateRequiredFields(req, requiredFields) {
    for (const field of requiredFields) {
      if (!(field in req.body)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
}

// Route for user login
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

function checkInput(input) {
  if (typeof input !== "string") {
    throw new Error("Input debe ser una cadena de texto");
  }
  return input.trim();
}

app.post("/adduser", async (req, res) => {
  try {
    validateRequiredFields(req, ["username", "name", "email", "password", "confirmPassword"]);

    const { username, password, confirmPassword, role } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({
        error: "Passwords do not match.",
      });
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(401).json({
        error: "Password must be at least 8 characters long, contain at least one uppercase letter, and at least one number.",
      });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res
        .status(400)
        .json({
          error: "Username already exists. Please choose a different username.",
        });
    }

    const existingEmail = await User.findOne({ email: req.body.email });
    if (existingEmail) {
      return res
        .status(400)
        .json({
          error: "Email already exists. Please choose a different email.",
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      name: req.body.name,
      email: req.body.email,
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
    res.status(400).json({ error: error.message });
  }
});

app.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, { password: 0});
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/users/search", async (req, res) => {
  try {
    const { username, userId } = req.query;
    
    let currentUser;
    
    if (username) {
      currentUser = await User.findOne({ username: username });
    } else if (userId) {
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
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.put("/edit-user/:userId", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.userId, req.body, { new: true });
    if (!updatedUser) return res.status(404).json({ error: "User not found" });
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: "Failed to update user" });
  }
});

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


// Start the server
const server = app.listen(port, () => {
  console.log(`User Service listening at http://localhost:${port}`);
});

server.on('close', () => {
    // Close the Mongoose connection
    mongoose.connection.close();
  });

  export default server;
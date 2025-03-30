import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import User from "./user-model.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const app = express();
const port = 8001; 

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

      const token = jwt.sign({ userId: user._id }, 'your-secret-key', { expiresIn: '1h' });

      const roleToken = jwt.sign(
        { userId: newUser._id, role: newUser.role },
        'your-secret-key', 
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
    // Check if required fields are present in the request body
    validateRequiredFields(req, ["username", "name", "email", "password", "confirmPassword"]);

    const { username, password, confirmPassword, role } = req.body;

    // Check if passwords match
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

    // Check if the username already exists
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

    // Encrypt the password before saving it
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      name: req.body.name,
      email: req.body.email,
      role: req.body.role || "user",
      password: hashedPassword,
    });

    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, "your-secret-key", { expiresIn: "1h" });

    const roleToken = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      'your-secret-key', 
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

// Route to get all users
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
    const { username } = req.query.username;

    // Search for the user by username
    const currentUser = await User.findOne({ username:username });
    console.log(currentUser);
    console.log(username);
    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(currentUser);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Actualizar usuario
app.put("/edit-user/:userId", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.userId, req.body, { new: true });
    if (!updatedUser) return res.status(404).json({ error: "User not found" });
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: "Failed to update user" });
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
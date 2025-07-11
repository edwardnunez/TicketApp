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

function validateEmailFormat(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateRequiredFields(req, requiredFields) {
    for (const field of requiredFields) {
      if (!(field in req.body)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    // Validación específica para email
    if (requiredFields.includes('email') && req.body.email) {
      if (!validateEmailFormat(req.body.email)) {
        throw new Error('Invalid email format');
      }
    }
}

app.post("/adduser", async (req, res) => {
  try {
    validateRequiredFields(req, ["username", "name", "surname", "email", "password", "confirmPassword"]);

    const { username, password, confirmPassword, email } = req.body;

    // Validación de contraseñas coincidentes
    if (password !== confirmPassword) {
      return res.status(400).json({
        error: "Passwords do not match.",
        field: "confirmPassword"
      });
    }

    // Validación de formato de contraseña
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error: "Password must be at least 8 characters long, contain at least one uppercase letter, and at least one number.",
        field: "password"
      });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        error: "Username already exists. Please choose a different username.",
        field: "username"
      });
    }

    // Verificar si el email ya existe
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
      // Validar que userId es un ObjectId válido
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

app.put("/edit-user/:userId", async (req, res) => {
  try {
    const { password, currentPassword, ...otherFields } = req.body;
    const userId = req.params.userId;

    // Buscar el usuario actual
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ 
        error: "User not found",
        field: "general"
      });
    }

    let updateData = { ...otherFields };

    // Si se está intentando cambiar la contraseña
    if (password) {
      // Verificar que se proporcionó la contraseña actual
      if (!currentPassword) {
        return res.status(400).json({
          error: "Current password is required to change password",
          field: "currentPassword"
        });
      }

      // Verificar que la contraseña actual es correcta
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, currentUser.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          error: "Current password is incorrect",
          field: "currentPassword"
        });
      }

      // Validar el formato de la nueva contraseña
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({
          error: "Password must be at least 8 characters long, contain at least one uppercase letter, and at least one number.",
          field: "password"
        });
      }

      // Verificar que la nueva contraseña no sea igual a la actual
      const isSamePassword = await bcrypt.compare(password, currentUser.password);
      if (isSamePassword) {
        return res.status(400).json({
          error: "New password must be different from current password",
          field: "password"
        });
      }

      // Hashear la nueva contraseña
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    // Validar email si se está actualizando
    if (otherFields.email) {
      if (!validateEmailFormat(otherFields.email)) {
        return res.status(400).json({
          error: "Invalid email format",
          field: "email"
        });
      }

      // Verificar que el email no esté en uso por otro usuario
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

    // Verificar username si se está actualizando
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

    // Actualizar el usuario
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
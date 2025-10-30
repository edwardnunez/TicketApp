/**
 * @file Servicio de Usuario - Gestiona autenticación y administración de perfiles
 * @module services/UserService
 * @description Microservicio para registro de usuarios, login, actualización de perfiles y autenticación JWT
 * @requires express
 * @requires mongoose
 * @requires bcrypt
 * @requires jsonwebtoken
 */

import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import User from "./user-model.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Intentar cargar .env solo si existe (desarrollo local)
// En Docker, las variables vienen del contenedor
const envPath = resolve(__dirname, '../../.env');
if (existsSync(envPath)) {
  console.log('Loading .env from:', envPath);
  dotenv.config({ path: envPath });
  console.log('Environment variables loaded from file');
} else {
  console.log('No .env file found, using environment variables from container');
}

const app = express();
const port = 8001;

const secretKey = process.env.JWT_SECRET;

if (!secretKey) {
  console.error('ERROR: JWT_SECRET no está definido en las variables de entorno');
  console.error('Available env vars:', Object.keys(process.env).filter(k => !k.startsWith('npm_')));
  process.exit(1);
}

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/userdb';
mongoose.connect(mongoUri);

/**
 * Valida el formato del correo electrónico usando patrón regex
 * @param {string} email - Dirección de correo electrónico a validar
 * @returns {boolean} Verdadero si el formato del correo es válido
 */
function validateEmailFormat(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida que todos los campos requeridos estén presentes en el cuerpo de la solicitud
 * @param {Object} req - Objeto de solicitud de Express
 * @param {string[]} requiredFields - Array de nombres de campos requeridos
 * @throws {Error} Si falta algún campo requerido o el formato del email es inválido
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
 * Crea una nueva cuenta de usuario
 * @route POST /adduser
 * @param {Object} req.body - Datos de registro del usuario
 * @param {string} req.body.username - Nombre de usuario único
 * @param {string} req.body.name - Nombre del usuario
 * @param {string} req.body.surname - Apellido del usuario
 * @param {string} req.body.email - Dirección de correo del usuario
 * @param {string} req.body.password - Contraseña del usuario
 * @param {string} req.body.confirmPassword - Confirmación de contraseña
 * @param {string} [req.body.role="user"] - Rol del usuario (por defecto: user)
 * @returns {Object} Datos del usuario con tokens de autenticación
 */
app.post("/adduser", async (req, res) => {
  try {
    validateRequiredFields(req, ["username", "name", "surname", "email", "password", "confirmPassword"]);

    const { username, password, confirmPassword, email } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({
        error: "Las contraseñas no coinciden.",
        field: "confirmPassword"
      });
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error: "La contraseña debe tener al menos 8 caracteres, una letra mayúscula y un número.",
        field: "password"
      });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        error: "El nombre de usuario ya existe. Por favor elige otro nombre de usuario.",
        field: "username"
      });
    }

    const existingEmail = await User.findOne({ email: email });
    if (existingEmail) {
      return res.status(400).json({
        error: "El email ya existe. Por favor elige otro email.",
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

    res.status(201).json({
      username: newUser.username,
      createdAt: newUser.createdAt,
      token: token,
      roleToken: roleToken,
    });
  } catch (error) {
    if (error.message.includes('Invalid email format')) {
      return res.status(400).json({
        error: 'Formato de email inválido',
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
 * Autentica al usuario y retorna tokens JWT
 * @route POST /login
 * @param {Object} req.body - Credenciales de inicio de sesión
 * @param {string} req.body.username - Nombre de usuario
 * @param {string} req.body.password - Contraseña del usuario
 * @returns {Object} Tokens de autenticación y datos del usuario
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
      res.status(401).json({ error: 'Credenciales inválidas' });
    }
  } catch (_error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * Obtiene todos los usuarios (excluyendo contraseñas)
 * @route GET /users
 * @returns {Object[]} Array de objetos de usuario sin contraseñas
 */
app.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, { password: 0});
    res.status(200).json(users);
  } catch (_error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

/**
 * Busca un usuario específico por nombre de usuario o userId
 * @route GET /users/search
 * @param {string} [req.query.username] - Nombre de usuario a buscar
 * @param {string} [req.query.userId] - ID de usuario a buscar
 * @returns {Object} Datos del usuario sin contraseña
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
      return res.status(400).json({ error: "Formato de userId inválido" });
    }
      currentUser = await User.findById(userId);
    } else {
      return res.status(400).json({ error: "Se requiere nombre de usuario o userId" });
    }

    if (!currentUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const { password: _password, ...userWithoutPassword } = currentUser.toObject();
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error("Error in /users/search:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

/**
 * Actualiza la información del perfil del usuario
 * @route PUT /edit-user/:userId
 * @param {string} req.params.userId - ID del usuario a actualizar
 * @param {Object} req.body - Datos actualizados del usuario
 * @param {string} [req.body.password] - Nueva contraseña (requiere currentPassword)
 * @param {string} [req.body.currentPassword] - Contraseña actual para verificación
 * @returns {Object} Datos actualizados del usuario
 */
app.put("/edit-user/:userId", async (req, res) => {
  try {
    const { password, currentPassword, ...otherFields } = req.body;
    const userId = req.params.userId;

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({
        error: "Usuario no encontrado",
        field: "general"
      });
    }

    const updateData = { ...otherFields };

    if (password) {
      if (!currentPassword) {
        return res.status(400).json({
          error: "Se requiere la contraseña actual para cambiar la contraseña",
          field: "currentPassword"
        });
      }

      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, currentUser.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          error: "La contraseña actual es incorrecta",
          field: "currentPassword"
        });
      }

      const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({
          error: "La contraseña debe tener al menos 8 caracteres, una letra mayúscula y un número.",
          field: "password"
        });
      }

      const isSamePassword = await bcrypt.compare(password, currentUser.password);
      if (isSamePassword) {
        return res.status(400).json({
          error: "La nueva contraseña debe ser diferente de la contraseña actual",
          field: "password"
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    if (otherFields.email) {
      if (!validateEmailFormat(otherFields.email)) {
        return res.status(400).json({
          error: "Formato de email inválido",
          field: "email"
        });
      }

      const existingEmailUser = await User.findOne({
        email: otherFields.email,
        _id: { $ne: userId }
      });

      if (existingEmailUser) {
        return res.status(400).json({
          error: "El email ya existe. Por favor elige otro email.",
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
          error: "El nombre de usuario ya existe. Por favor elige otro nombre de usuario.",
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
      message: password ? "Perfil y contraseña actualizados exitosamente" : "Perfil actualizado exitosamente",
      user: updatedUser
    });

  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({
      error: "Error al actualizar el usuario",
      field: "general"
    });
  }
});

/**
 * Verifica el token JWT y retorna el rol del usuario
 * @route POST /verifyToken
 * @param {Object} req.body - Datos de verificación del token
 * @param {string} req.body.token - Token JWT a verificar
 * @returns {Object} Información del rol del usuario
 */
app.post('/verifyToken', (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Se requiere un token' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    const role = decoded.role;
    if (role === 'admin') {
      res.status(200).json({ role });
    } else {
      res.status(403).json({ error: 'Prohibido' });
    }
  } catch (_error) {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
});

/**
 * Inicia el servidor del Servicio de Usuario
 * @listens {port} 8001
 */
const server = app.listen(port, () => {
  console.log(`User Service listening at http://localhost:${port}`);
});

/**
 * Manejador de limpieza para el cierre del servidor
 * Cierra la conexión de MongoDB cuando el servidor se detiene
 */
server.on('close', () => {
    mongoose.connection.close();
});

export default server;

/**
 * @file Modelo de datos de Usuario para MongoDB
 * @module models/User
 */

import mongoose from 'mongoose';

/**
 * Definición del schema de Usuario
 * @typedef {Object} UserSchema
 * @property {string} username - Nombre de usuario único
 * @property {string} name - Nombre del usuario
 * @property {string} surname - Apellido del usuario
 * @property {string} email - Dirección de correo electrónico del usuario
 * @property {string} password - Contraseña hasheada
 * @property {Date} createdAt - Fecha y hora de creación de la cuenta
 * @property {string} avatar - Ruta o URL de la imagen de avatar del usuario
 * @property {string} role - Rol del usuario (por defecto: "user", puede ser "admin")
 * @property {mongoose.Schema.Types.ObjectId[]} tickets - Array de IDs de tickets del usuario
 */
const userSchema = new mongoose.Schema({
    username: String,
    name: String,
    surname: String,
    email: String,
    password: String,
    createdAt: { type: Date, default: Date.now },
    avatar: String,
    role: { type: String, default: "user" },
    tickets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Ticket" }]
});

/**
 * Modelo de Usuario para operaciones de base de datos
 * @type {mongoose.Model}
 */
const User = mongoose.model('User', userSchema);

export default User;
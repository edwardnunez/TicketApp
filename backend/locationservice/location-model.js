/**
 * @file Modelo de datos de Ubicación para MongoDB
 * @module models/Location
 */

import mongoose from 'mongoose';

/**
 * Definición del schema de Ubicación
 * @typedef {Object} LocationSchema
 * @property {string} name - Nombre del lugar/ubicación
 * @property {string} category - Categoría de la ubicación (stadium, cinema, concert, theater, festival)
 * @property {string} address - Dirección física de la ubicación
 * @property {number} capacity - Capacidad total de la ubicación (opcional)
 * @property {string} seatMapId - Referencia al diseño del mapa de asientos asociado (opcional)
 */
const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['stadium', 'cinema', 'concert', 'theater', 'festival'],
    required: true
  },
  address: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    required: false
  },
  seatMapId: {
    type: String,
    required: false
  },
}, {
  timestamps: true
});

/**
 * Modelo de Ubicación para operaciones de base de datos
 * @type {mongoose.Model}
 */
const Location = mongoose.model('Location', locationSchema);

export default Location;
const mongoose = require('mongoose');

/**
 * Schema de Libro - Define la estructura y validaciones de un libro en la base de datos
 * Cumple con Single Responsibility: solo define la estructura de datos
 */
const bookSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: [true, 'El título es obligatorio'],
      trim: true,
      maxlength: [200, 'El título no puede exceder 200 caracteres']
    },
    autor: {
      type: String,
      required: [true, 'El autor es obligatorio'],
      trim: true,
      maxlength: [100, 'El autor no puede exceder 100 caracteres']
    },
    isbn: {
      type: String,
      required: [true, 'El ISBN es obligatorio'],
      unique: true,
      trim: true,
      validate: {
        validator: function(v) {
          // Validación básica de ISBN-10 o ISBN-13
          return /^(?:\d{9}[\dX]|\d{13})$/.test(v.replace(/-/g, ''));
        },
        message: 'ISBN inválido. Debe ser ISBN-10 o ISBN-13'
      }
    },
    genero: {
      type: String,
      required: [true, 'El género es obligatorio'],
      enum: {
        values: ['Ficción', 'No Ficción', 'Ciencia', 'Historia', 'Tecnología', 'Arte', 'Biografía', 'Otro'],
        message: '{VALUE} no es un género válido'
      }
    },
    anioPublicacion: {
      type: Number,
      required: [true, 'El año de publicación es obligatorio'],
      min: [1000, 'El año debe ser mayor a 1000'],
      max: [new Date().getFullYear(), `El año no puede ser mayor a ${new Date().getFullYear()}`]
    },
    editorial: {
      type: String,
      trim: true,
      maxlength: [100, 'La editorial no puede exceder 100 caracteres']
    },
    numeroPaginas: {
      type: Number,
      min: [1, 'El número de páginas debe ser al menos 1'],
      max: [10000, 'El número de páginas no puede exceder 10000']
    },
    descripcion: {
      type: String,
      trim: true,
      maxlength: [1000, 'La descripción no puede exceder 1000 caracteres']
    }
  },
  {
    timestamps: true, // Crea automáticamente createdAt y updatedAt
    versionKey: false // Desactiva __v para respuestas más limpias
  }
);

// Índices para búsquedas eficientes
// Nota: No duplicamos el índice de ISBN porque ya está definido con unique:true
bookSchema.index({ titulo: 1, autor: 1 });
bookSchema.index({ genero: 1 });

// Virtual para obtener el nombre completo de identificación
bookSchema.virtual('identificacion').get(function() {
  return `${this.titulo} - ${this.autor}`;
});

// Configuración para incluir virtuals en JSON
bookSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret._id;
    return ret;
  }
});

module.exports = mongoose.model('Book', bookSchema);

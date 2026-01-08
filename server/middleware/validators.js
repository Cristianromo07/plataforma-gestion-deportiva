const { body, validationResult } = require('express-validator');

// Función auxiliar para verificar resultados de validación en el controlador
// Si hay errores, responde automáticamente y detiene el flujo.
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map(err => err.msg) // Devuelve lista limpia de mensajes
        });
    }
    next();
};

// Reglas de validación para REGISTRO
const registerRules = [
    body('email')
        .isEmail().withMessage('El formato del correo electrónico no es válido')
        .normalizeEmail(), // Convierte a minúsculas, quita espacios, etc.

    body('password')
        .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
        .matches(/\d/).withMessage('La contraseña debe contener al menos un número'),
    // .matches(/[A-Z]/).withMessage('Debe contener una mayúscula (Opcional por ahora)'),

    body('nombre')
        .optional()
        .trim()
        .notEmpty().withMessage('El nombre no puede estar vacío si se envía')
];

// Reglas de validación para LOGIN
const loginRules = [
    body('email')
        .isEmail().withMessage('Ingrese un correo electrónico válido')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('La contraseña es obligatoria')
];

module.exports = {
    validate,
    registerRules,
    loginRules
};

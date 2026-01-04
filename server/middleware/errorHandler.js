// Manejador de errores global
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Error interno del servidor';

    res.status(statusCode).json({
        success: false,
        error: message,
        // Solo enviar el stack en desarrollo si fuera necesario, 
        // pero por ahora mantenemos simplicidad
    });
};

module.exports = errorHandler;

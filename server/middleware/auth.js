// Middleware de autenticación
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.loggedIn) return next();
    res.status(401).json({ error: 'No autenticado' });
};

// Middleware de roles
const hasRole = (roles) => (req, res, next) => {
    if (req.session.role && roles.includes(req.session.role)) return next();
    res.status(403).json({ error: 'Acceso denegado' });
};

module.exports = {
    isAuthenticated,
    hasRole
};

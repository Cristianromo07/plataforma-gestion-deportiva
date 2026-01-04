const express = require('express');
const router = express.Router();
const reservaController = require('../controllers/reservaController');
const { isAuthenticated } = require('../middleware/auth');

router.get('/reservas', reservaController.getReservas);
router.post('/reservas', isAuthenticated, reservaController.createReserva);
router.put('/reservas/:id', isAuthenticated, reservaController.updateReserva);
router.delete('/reservas/:id', isAuthenticated, reservaController.deleteReserva);
router.get('/escenarios', reservaController.getEscenarios);

module.exports = router;

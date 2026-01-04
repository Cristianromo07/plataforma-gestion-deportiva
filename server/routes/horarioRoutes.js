const express = require('express');
const router = express.Router();
const horarioController = require('../controllers/horarioController');
const { isAuthenticated } = require('../middleware/auth');

router.get('/horarios', horarioController.getHorarios);
router.post('/horarios', isAuthenticated, horarioController.saveHorarios);
router.delete('/horarios/:escenario/:nombre', isAuthenticated, horarioController.deleteHorario);

module.exports = router;

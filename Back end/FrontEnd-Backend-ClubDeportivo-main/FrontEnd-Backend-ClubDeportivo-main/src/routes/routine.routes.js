const { Router } = require('express');
const controller = require('../controllers/routine.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/authorize.middleware');

const router = Router();

router.get('/', authenticate, controller.getAll);
router.post('/', authenticate, authorize('coach', 'admin'), controller.create);
router.put('/:id', authenticate, authorize('coach', 'admin'), controller.update);
router.delete('/:id', authenticate, authorize('coach', 'admin'), controller.remove);

module.exports = router;
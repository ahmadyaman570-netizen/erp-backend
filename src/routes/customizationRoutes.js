const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const permissionMiddleware = require('../middlewares/permissionMiddleware');
const controller = require('../controllers/customizationController');
const router = express.Router();

router.use(authMiddleware);
router.get('/next-number/:documentType', permissionMiddleware('manage_settings'), controller.nextNumber);
router.get('/account-statement/:accountId', permissionMiddleware('view_reports'), controller.accountStatement);
router.get('/:type', permissionMiddleware('manage_settings'), controller.list);
router.get('/:type/:id', permissionMiddleware('manage_settings'), controller.getOne);
router.post('/:type', permissionMiddleware('manage_settings'), controller.create);
router.put('/:type/:id', permissionMiddleware('manage_settings'), controller.update);
router.delete('/:type/:id', permissionMiddleware('manage_settings'), controller.remove);

module.exports = router;

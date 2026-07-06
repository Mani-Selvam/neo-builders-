import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { authenticate, checkCompanyStatus, authorize } from '../middleware/authenticate.js';
import { stripTenantFields } from '../middleware/validateRequest.js';

const router = Router();

router.use(authenticate, checkCompanyStatus);

router.get('/', authorize('users', 'view'), userController.list);
router.get('/:id', authorize('users', 'view'), userController.getOne);
router.post('/', authorize('users', 'create'), stripTenantFields, userController.create);
router.put('/:id', authorize('users', 'edit'), stripTenantFields, userController.update);
router.delete('/:id', authorize('users', 'delete'), userController.remove);

export default router;

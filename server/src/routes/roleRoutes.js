import { Router } from 'express';
import * as roleController from '../controllers/roleController.js';
import { authenticate, checkCompanyStatus, authorize } from '../middleware/authenticate.js';

const router = Router();

router.use(authenticate, checkCompanyStatus);

router.get('/', authorize('roles', 'view'), roleController.list);
router.get('/:id', authorize('roles', 'view'), roleController.getOne);
router.post('/', authorize('roles', 'create'), roleController.create);
router.put('/:id', authorize('roles', 'edit'), roleController.update);
router.delete('/:id', authorize('roles', 'delete'), roleController.remove);

export default router;

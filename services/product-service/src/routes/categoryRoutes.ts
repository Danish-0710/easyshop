import { Router } from 'express';
import { categoryController } from '../controllers/categoryController';
import { validateRequest } from '../middleware/validateRequest';
import { categoryValidation } from '../validations/categoryValidation';
import { authMiddleware } from '../middleware/authMiddleware';
import { roleMiddleware } from '../middleware/roleMiddleware';
import { upload } from '../utils/upload';

const router = Router();

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/tree', categoryController.getCategoryTree);
router.get('/:slug', categoryController.getCategoryBySlug);
router.get('/:categoryId/subcategories', categoryController.getSubcategories);

// Protected routes
router.use(authMiddleware);
router.use(roleMiddleware(['admin']));

router.post(
  '/',
  upload.single('image'),
  validateRequest(categoryValidation.createCategory),
  categoryController.createCategory
);

router.patch(
  '/:categoryId',
  upload.single('image'),
  validateRequest(categoryValidation.updateCategory),
  categoryController.updateCategory
);

router.delete(
  '/:categoryId',
  categoryController.deleteCategory
);

export const categoryRoutes = router;

import { Router } from 'express';
import { productController } from '../controllers/productController';
import { validateRequest } from '../middleware/validateRequest';
import { productValidation } from '../validations/productValidation';
import { authMiddleware } from '../middleware/authMiddleware';
import { roleMiddleware } from '../middleware/roleMiddleware';
import { upload } from '../utils/upload';

const router = Router();

// Public routes
router.get('/', productController.getAllProducts);
router.get('/search', productController.searchProducts);
router.get('/category/:category', productController.getProductsByCategory);
router.get('/shop/:shopId', productController.getProductsByShop);
router.get('/:slug', productController.getProductBySlug);
router.get('/related/:productId', productController.getRelatedProducts);

// Protected routes
router.use(authMiddleware);

// Vendor routes
router.post(
  '/',
  roleMiddleware(['vendor', 'admin']),
  upload.array('images', 5),
  validateRequest(productValidation.createProduct),
  productController.createProduct
);

router.patch(
  '/:productId',
  roleMiddleware(['vendor', 'admin']),
  upload.array('images', 5),
  validateRequest(productValidation.updateProduct),
  productController.updateProduct
);

router.delete(
  '/:productId',
  roleMiddleware(['vendor', 'admin']),
  productController.deleteProduct
);

// Review routes
router.post(
  '/:productId/reviews',
  validateRequest(productValidation.createReview),
  productController.createProductReview
);

router.get('/:productId/reviews', productController.getProductReviews);

router.delete(
  '/:productId/reviews/:reviewId',
  roleMiddleware(['user', 'vendor', 'admin']),
  productController.deleteProductReview
);

export const productRoutes = router;

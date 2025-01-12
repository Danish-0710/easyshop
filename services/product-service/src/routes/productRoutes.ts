import { Router } from 'express';
import { productController } from '../controllers/productController';
import { validateRequest } from '../middleware/validateRequest';
import { productValidation } from '../validations/productValidation';
import { authMiddleware } from '../middleware/authMiddleware';
import { roleMiddleware } from '../middleware/roleMiddleware';
import { upload } from '../utils/upload';
import { cacheMiddleware, clearCache } from '../middleware/cache';
import { logger } from '../utils/logger';

const router = Router();

// Public routes
router.get('/', cacheMiddleware('products', 3600), productController.getAllProducts);
router.get('/search', cacheMiddleware('products', 3600), productController.searchProducts);

// Category routes
router.get('/:category', cacheMiddleware('products', 3600), productController.getProductsByCategory);
router.get('/:category/:subcategory', cacheMiddleware('products', 3600), productController.getProductsBySubcategory);

// Other routes
router.get('/shop/:shopId', cacheMiddleware('products', 3600), productController.getProductsByShop);
router.get('/product/:slug', cacheMiddleware('product', 3600), productController.getProductBySlug);
router.get('/related/:productId', cacheMiddleware('products', 3600), productController.getRelatedProducts);

// Protected routes
router.use(authMiddleware);

// Vendor routes
router.post(
  '/',
  roleMiddleware(['vendor', 'admin']),
  upload.array('images', 5),
  validateRequest(productValidation.createProduct),
  async (req, res) => {
    try {
      await productController.createProduct(req, res);
      await clearCache('products:*');
    } catch (error) {
      logger.error('Error creating product:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

router.patch(
  '/:productId',
  roleMiddleware(['vendor', 'admin']),
  upload.array('images', 5),
  validateRequest(productValidation.updateProduct),
  async (req, res) => {
    try {
      await productController.updateProduct(req, res);
      await clearCache('products:*');
      await clearCache(`product:*${req.params.productId}*`);
    } catch (error) {
      logger.error('Error updating product:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

router.delete(
  '/:productId',
  roleMiddleware(['vendor', 'admin']),
  async (req, res) => {
    try {
      await productController.deleteProduct(req, res);
      await clearCache('products:*');
      await clearCache(`product:*${req.params.productId}*`);
    } catch (error) {
      logger.error('Error deleting product:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// Review routes
router.post(
  '/:productId/reviews',
  validateRequest(productValidation.createReview),
  productController.createProductReview
);

router.get('/:productId/reviews', cacheMiddleware('reviews', 3600), productController.getProductReviews);

router.delete(
  '/:productId/reviews/:reviewId',
  roleMiddleware(['user', 'vendor', 'admin']),
  productController.deleteProductReview
);

export const productRoutes = router;

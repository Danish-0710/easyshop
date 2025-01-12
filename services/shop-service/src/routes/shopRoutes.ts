import { Router } from 'express';
import { shopController } from '../controllers/shopController';
import { reviewController } from '../controllers/reviewController';
import { validateRequest } from '../middleware/validateRequest';
import { shopValidation } from '../validations/shopValidation';
import { reviewValidation } from '../validations/reviewValidation';
import { authMiddleware } from '../middleware/authMiddleware';
import { upload } from '../utils/upload';

const router = Router();

// Public routes
router.get('/', shopController.getShops);
router.get('/:shopId', shopController.getShop);
router.get('/slug/:slug', shopController.getShopBySlug);
router.get('/:shopId/reviews', reviewController.getShopReviews);

// Protected routes
router.use(authMiddleware);

// Shop management
router.post(
  '/',
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'banner', maxCount: 1 },
  ]),
  validateRequest(shopValidation.createShop),
  shopController.createShop
);

router.patch(
  '/:shopId',
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'banner', maxCount: 1 },
  ]),
  validateRequest(shopValidation.updateShop),
  shopController.updateShop
);

router.get('/my/shop', shopController.getMyShop);

router.patch(
  '/:shopId/settings',
  validateRequest(shopValidation.updateSettings),
  shopController.updateShopSettings
);

router.patch(
  '/:shopId/business-hours',
  validateRequest(shopValidation.updateBusinessHours),
  shopController.updateBusinessHours
);

router.patch('/:shopId/toggle-status', shopController.toggleShopStatus);

router.get('/:shopId/analytics', shopController.getShopAnalytics);

// Reviews
router.post(
  '/:shopId/reviews',
  validateRequest(reviewValidation.createReview),
  reviewController.createReview
);

router.patch(
  '/reviews/:reviewId',
  validateRequest(reviewValidation.updateReview),
  reviewController.updateReview
);

router.delete('/reviews/:reviewId', reviewController.deleteReview);

router.patch('/reviews/:reviewId/verify', reviewController.verifyReview);

export const shopRoutes = router;

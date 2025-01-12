import { Router } from 'express';
import { cartController } from '../controllers/cartController';
import { validateRequest } from '../middleware/validateRequest';
import { cartValidation } from '../validations/cartValidation';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// All cart routes require authentication
router.use(authMiddleware);

// Get user's cart
router.get('/', cartController.getCart);

// Add item to cart
router.post(
  '/items',
  validateRequest(cartValidation.addItem),
  cartController.addItem
);

// Update item quantity
router.patch(
  '/items',
  validateRequest(cartValidation.updateQuantity),
  cartController.updateItemQuantity
);

// Remove item from cart
router.delete('/items/:productId', cartController.removeItem);

// Clear cart
router.delete('/', cartController.clearCart);

export const cartRoutes = router;

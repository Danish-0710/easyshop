import { Router } from 'express';
import { orderController } from '../controllers/orderController';
import { validateRequest } from '../middleware/validateRequest';
import { orderValidation } from '../validations/orderValidation';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Stripe webhook endpoint (no auth required)
router.post('/webhook', orderController.handleStripeWebhook);

// Protected routes
router.use(authMiddleware);

// Create order
router.post(
  '/',
  validateRequest(orderValidation.createOrder),
  orderController.createOrder
);

// Get all orders for user
router.get('/', orderController.getOrders);

// Get specific order
router.get('/:orderId', orderController.getOrder);

// Update order status
router.patch(
  '/:orderId/status',
  validateRequest(orderValidation.updateOrderStatus),
  orderController.updateOrderStatus
);

// Cancel order
router.post('/:orderId/cancel', orderController.cancelOrder);

export const orderRoutes = router;

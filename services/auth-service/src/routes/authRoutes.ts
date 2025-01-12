import { Router } from 'express';
import { authController } from '../controllers/authController';
import { validateRequest } from '../middleware/validateRequest';
import { authValidation } from '../validations/authValidation';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.post(
  '/register',
  validateRequest(authValidation.register),
  authController.register
);

router.post(
  '/login',
  validateRequest(authValidation.login),
  authController.login
);

router.post('/logout', authController.logout);

// Protected routes
router.use(authMiddleware);

router.get('/me', authController.getCurrentUser);

router.patch(
  '/profile',
  validateRequest(authValidation.updateProfile),
  authController.updateProfile
);

router.patch(
  '/password',
  validateRequest(authValidation.changePassword),
  authController.changePassword
);

export const authRoutes = router;

import { Router } from 'express';
import { userController } from '../controllers/userController';
import { validateRequest } from '../middleware/validateRequest';
import { userValidation } from '../validations/userValidation';
import { authMiddleware } from '../middleware/authMiddleware';
import { roleMiddleware } from '../middleware/roleMiddleware';

const router = Router();

router.get(
  '/me',
  authMiddleware,
  userController.getCurrentUser
);

router.patch(
  '/me',
  authMiddleware,
  validateRequest(userValidation.updateUser),
  userController.updateCurrentUser
);

router.patch(
  '/me/password',
  authMiddleware,
  validateRequest(userValidation.updatePassword),
  userController.updatePassword
);

// Admin routes
router.get(
  '/',
  authMiddleware,
  roleMiddleware(['admin']),
  userController.getAllUsers
);

router.get(
  '/:userId',
  authMiddleware,
  roleMiddleware(['admin']),
  userController.getUserById
);

router.patch(
  '/:userId',
  authMiddleware,
  roleMiddleware(['admin']),
  validateRequest(userValidation.updateUser),
  userController.updateUser
);

router.delete(
  '/:userId',
  authMiddleware,
  roleMiddleware(['admin']),
  userController.deleteUser
);

export const userRoutes = router;

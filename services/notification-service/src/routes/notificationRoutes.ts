import { Router } from 'express';
import { notificationController } from '../controllers/notificationController';
import { templateController } from '../controllers/templateController';
import { preferenceController } from '../controllers/preferenceController';
import { validateRequest } from '../middleware/validateRequest';
import { notificationValidation } from '../validations/notificationValidation';
import { templateValidation } from '../validations/templateValidation';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.get('/unsubscribe/:token', preferenceController.unsubscribe);

// Protected routes
router.use(authMiddleware);

// Notifications
router.post(
  '/',
  validateRequest(notificationValidation.createNotification),
  notificationController.createNotification
);
router.get('/', notificationController.getNotifications);
router.patch('/:notificationId/read', notificationController.markAsRead);
router.patch('/read-all', notificationController.markAllAsRead);
router.get('/unread-count', notificationController.getUnreadCount);
router.delete('/:notificationId', notificationController.deleteNotification);

// Templates
router.post(
  '/templates',
  validateRequest(templateValidation.createTemplate),
  templateController.createTemplate
);
router.patch(
  '/templates/:templateId',
  validateRequest(templateValidation.updateTemplate),
  templateController.updateTemplate
);
router.get('/templates/:templateId', templateController.getTemplate);
router.get('/templates', templateController.getTemplates);
router.delete('/templates/:templateId', templateController.deleteTemplate);
router.patch(
  '/templates/:templateId/toggle',
  templateController.toggleTemplateStatus
);

// Preferences
router.get('/preferences', preferenceController.getPreference);
router.patch(
  '/preferences',
  validateRequest(notificationValidation.updatePreference),
  preferenceController.updatePreference
);
router.patch(
  '/preferences/channels',
  validateRequest(notificationValidation.updateChannelPreference),
  preferenceController.updateChannelPreference
);

export const notificationRoutes = router;

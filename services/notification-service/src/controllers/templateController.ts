import { Request, Response, NextFunction } from 'express';
import { NotificationTemplate } from '../models/NotificationTemplate';
import { BadRequestError, NotFoundError } from '../utils/errors';

export const templateController = {
  async createTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const templateData = req.body;

      // Check if template with same name exists
      const existingTemplate = await NotificationTemplate.findOne({
        name: templateData.name,
      });

      if (existingTemplate) {
        throw new BadRequestError('Template with this name already exists');
      }

      const template = await NotificationTemplate.create(templateData);

      res.status(201).json({
        status: 'success',
        data: { template },
      });
    } catch (error) {
      next(error);
    }
  },

  async updateTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const { templateId } = req.params;
      const updateData = req.body;

      const template = await NotificationTemplate.findByIdAndUpdate(
        templateId,
        updateData,
        { new: true }
      );

      if (!template) {
        throw new NotFoundError('Template not found');
      }

      res.json({
        status: 'success',
        data: { template },
      });
    } catch (error) {
      next(error);
    }
  },

  async getTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const { templateId } = req.params;

      const template = await NotificationTemplate.findById(templateId);
      if (!template) {
        throw new NotFoundError('Template not found');
      }

      res.json({
        status: 'success',
        data: { template },
      });
    } catch (error) {
      next(error);
    }
  },

  async getTemplates(req: Request, res: Response, next: NextFunction) {
    try {
      const { type, channel, isActive } = req.query;
      const query: any = {};

      if (type) {
        query.type = type;
      }

      if (channel) {
        query.channel = channel;
      }

      if (isActive !== undefined) {
        query.isActive = isActive === 'true';
      }

      const templates = await NotificationTemplate.find(query).sort('name');

      res.json({
        status: 'success',
        data: { templates },
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const { templateId } = req.params;

      const template = await NotificationTemplate.findByIdAndDelete(templateId);
      if (!template) {
        throw new NotFoundError('Template not found');
      }

      res.json({
        status: 'success',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  },

  async toggleTemplateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { templateId } = req.params;

      const template = await NotificationTemplate.findById(templateId);
      if (!template) {
        throw new NotFoundError('Template not found');
      }

      template.isActive = !template.isActive;
      await template.save();

      res.json({
        status: 'success',
        data: { template },
      });
    } catch (error) {
      next(error);
    }
  },
};

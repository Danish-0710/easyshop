import { Request, Response, NextFunction } from 'express';
import { Category } from '../models/Category';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary';
import { NotFoundError } from '../utils/errors';

export const categoryController = {
  async getAllCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await Category.find({ isActive: true })
        .sort('name')
        .populate('parent');

      res.json({
        status: 'success',
        data: { categories },
      });
    } catch (error) {
      next(error);
    }
  },

  async getCategoryTree(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await Category.find({ isActive: true, level: 1 })
        .sort('name');

      const categoryTree = await Promise.all(
        categories.map(async (category) => {
          const subcategories = await Category.find({
            parent: category._id,
            isActive: true,
          }).sort('name');

          return {
            ...category.toObject(),
            subcategories,
          };
        })
      );

      res.json({
        status: 'success',
        data: { categories: categoryTree },
      });
    } catch (error) {
      next(error);
    }
  },

  async getCategoryBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await Category.findOne({
        slug: req.params.slug,
        isActive: true,
      }).populate('parent');

      if (!category) {
        throw new NotFoundError('Category not found');
      }

      res.json({
        status: 'success',
        data: { category },
      });
    } catch (error) {
      next(error);
    }
  },

  async getSubcategories(req: Request, res: Response, next: NextFunction) {
    try {
      const subcategories = await Category.find({
        parent: req.params.categoryId,
        isActive: true,
      }).sort('name');

      res.json({
        status: 'success',
        data: { categories: subcategories },
      });
    } catch (error) {
      next(error);
    }
  },

  async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const file = req.file;
      let image;

      if (file) {
        const result = await uploadToCloudinary(file);
        image = result.secure_url;
      }

      const category = await Category.create({
        ...req.body,
        image,
      });

      res.status(201).json({
        status: 'success',
        data: { category },
      });
    } catch (error) {
      next(error);
    }
  },

  async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await Category.findById(req.params.categoryId);
      if (!category) {
        throw new NotFoundError('Category not found');
      }

      const file = req.file;
      if (file) {
        if (category.image) {
          await deleteFromCloudinary(category.image);
        }
        const result = await uploadToCloudinary(file);
        req.body.image = result.secure_url;
      }

      const updatedCategory = await Category.findByIdAndUpdate(
        req.params.categoryId,
        req.body,
        { new: true }
      );

      res.json({
        status: 'success',
        data: { category: updatedCategory },
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await Category.findById(req.params.categoryId);
      if (!category) {
        throw new NotFoundError('Category not found');
      }

      // Delete category image if exists
      if (category.image) {
        await deleteFromCloudinary(category.image);
      }

      // Instead of deleting, mark as inactive
      category.isActive = false;
      await category.save();

      res.json({
        status: 'success',
        message: 'Category deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },
};

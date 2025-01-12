import { Request, Response, NextFunction } from 'express';
import { Product } from '../models/Product';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/errors';
import { buildQuery } from '../utils/queryBuilder';

export const productController = {
  async getAllProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { query, pagination } = buildQuery(req.query);
      const products = await Product.find(query)
        .sort(pagination.sort)
        .skip(pagination.skip)
        .limit(pagination.limit);

      const total = await Product.countDocuments(query);

      res.json({
        status: 'success',
        data: {
          products,
          pagination: {
            ...pagination,
            total,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async getProductBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await Product.findOne({ slug: req.params.slug });
      if (!product) {
        throw new NotFoundError('Product not found');
      }

      res.json({
        status: 'success',
        data: { product },
      });
    } catch (error) {
      next(error);
    }
  },

  async searchProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { q } = req.query;
      const { query, pagination } = buildQuery(req.query);

      if (q) {
        query.$text = { $search: q as string };
      }

      const products = await Product.find(query)
        .sort(pagination.sort)
        .skip(pagination.skip)
        .limit(pagination.limit);

      const total = await Product.countDocuments(query);

      res.json({
        status: 'success',
        data: {
          products,
          pagination: {
            ...pagination,
            total,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async getProductsByCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { query, pagination } = buildQuery(req.query);
      query.category = req.params.category;

      const products = await Product.find(query)
        .sort(pagination.sort)
        .skip(pagination.skip)
        .limit(pagination.limit);

      const total = await Product.countDocuments(query);

      res.json({
        status: 'success',
        data: {
          products,
          pagination: {
            ...pagination,
            total,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async getProductsByShop(req: Request, res: Response, next: NextFunction) {
    try {
      const { query, pagination } = buildQuery(req.query);
      query.shopId = req.params.shopId;

      const products = await Product.find(query)
        .sort(pagination.sort)
        .skip(pagination.skip)
        .limit(pagination.limit);

      const total = await Product.countDocuments(query);

      res.json({
        status: 'success',
        data: {
          products,
          pagination: {
            ...pagination,
            total,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const files = req.files as Express.Multer.File[];
      const images = [];

      for (const file of files) {
        const result = await uploadToCloudinary(file);
        images.push(result.secure_url);
      }

      const product = await Product.create({
        ...req.body,
        images,
        shopId: req.user.shopId,
      });

      res.status(201).json({
        status: 'success',
        data: { product },
      });
    } catch (error) {
      next(error);
    }
  },

  async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await Product.findById(req.params.productId);
      if (!product) {
        throw new NotFoundError('Product not found');
      }

      if (product.shopId.toString() !== req.user.shopId && req.user.role !== 'admin') {
        throw new ForbiddenError('Not authorized to update this product');
      }

      const files = req.files as Express.Multer.File[];
      if (files?.length) {
        // Delete old images
        for (const imageUrl of product.images) {
          await deleteFromCloudinary(imageUrl);
        }

        // Upload new images
        const images = [];
        for (const file of files) {
          const result = await uploadToCloudinary(file);
          images.push(result.secure_url);
        }
        req.body.images = images;
      }

      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.productId,
        req.body,
        { new: true }
      );

      res.json({
        status: 'success',
        data: { product: updatedProduct },
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await Product.findById(req.params.productId);
      if (!product) {
        throw new NotFoundError('Product not found');
      }

      if (product.shopId.toString() !== req.user.shopId && req.user.role !== 'admin') {
        throw new ForbiddenError('Not authorized to delete this product');
      }

      // Delete images from cloudinary
      for (const imageUrl of product.images) {
        await deleteFromCloudinary(imageUrl);
      }

      await product.deleteOne();

      res.json({
        status: 'success',
        message: 'Product deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  async createProductReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { rating, comment } = req.body;
      const product = await Product.findById(req.params.productId);

      if (!product) {
        throw new NotFoundError('Product not found');
      }

      const alreadyReviewed = product.reviews.find(
        (r) => r.userId.toString() === req.user.userId
      );

      if (alreadyReviewed) {
        throw new BadRequestError('Product already reviewed');
      }

      const review = {
        userId: req.user.userId,
        rating: Number(rating),
        comment,
      };

      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

      await product.save();

      res.status(201).json({
        status: 'success',
        data: { review },
      });
    } catch (error) {
      next(error);
    }
  },

  async getProductReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await Product.findById(req.params.productId)
        .populate('reviews.userId', 'firstName lastName');

      if (!product) {
        throw new NotFoundError('Product not found');
      }

      res.json({
        status: 'success',
        data: { reviews: product.reviews },
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteProductReview(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await Product.findById(req.params.productId);
      if (!product) {
        throw new NotFoundError('Product not found');
      }

      const review = product.reviews.id(req.params.reviewId);
      if (!review) {
        throw new NotFoundError('Review not found');
      }

      if (review.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
        throw new ForbiddenError('Not authorized to delete this review');
      }

      await review.deleteOne();

      product.numReviews = product.reviews.length;
      if (product.numReviews > 0) {
        product.rating =
          product.reviews.reduce((acc, item) => item.rating + acc, 0) /
          product.reviews.length;
      } else {
        product.rating = 0;
      }

      await product.save();

      res.json({
        status: 'success',
        message: 'Review deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  async getRelatedProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await Product.findById(req.params.productId);
      if (!product) {
        throw new NotFoundError('Product not found');
      }

      const relatedProducts = await Product.find({
        _id: { $ne: product._id },
        category: product.category,
      })
        .limit(4);

      res.json({
        status: 'success',
        data: { products: relatedProducts },
      });
    } catch (error) {
      next(error);
    }
  },
};

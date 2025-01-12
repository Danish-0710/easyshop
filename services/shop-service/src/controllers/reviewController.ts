import { Request, Response, NextFunction } from 'express';
import { Review } from '../models/Review';
import { Shop } from '../models/Shop';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/errors';

export const reviewController = {
  async createReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { shopId } = req.params;
      const { rating, comment, orderId } = req.body;

      // Check if shop exists
      const shop = await Shop.findById(shopId);
      if (!shop) {
        throw new NotFoundError('Shop not found');
      }

      // Check if user has already reviewed this shop for this order
      const existingReview = await Review.findOne({
        shopId,
        userId: req.user.userId,
        orderId,
      });

      if (existingReview) {
        throw new BadRequestError(
          'You have already reviewed this shop for this order'
        );
      }

      // Create review
      const review = await Review.create({
        shopId,
        userId: req.user.userId,
        rating,
        comment,
        orderId,
      });

      // Update shop rating
      shop.totalRatings += 1;
      shop.rating =
        (shop.rating * (shop.totalRatings - 1) + rating) / shop.totalRatings;
      await shop.save();

      res.status(201).json({
        status: 'success',
        data: { review },
      });
    } catch (error) {
      next(error);
    }
  },

  async updateReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { reviewId } = req.params;
      const { rating, comment } = req.body;

      const review = await Review.findById(reviewId);
      if (!review) {
        throw new NotFoundError('Review not found');
      }

      if (review.userId.toString() !== req.user.userId) {
        throw new ForbiddenError('Not authorized to update this review');
      }

      // Update shop rating
      const shop = await Shop.findById(review.shopId);
      if (shop) {
        shop.rating =
          (shop.rating * shop.totalRatings - review.rating + rating) /
          shop.totalRatings;
        await shop.save();
      }

      // Update review
      review.rating = rating;
      review.comment = comment;
      await review.save();

      res.json({
        status: 'success',
        data: { review },
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { reviewId } = req.params;

      const review = await Review.findById(reviewId);
      if (!review) {
        throw new NotFoundError('Review not found');
      }

      if (review.userId.toString() !== req.user.userId) {
        throw new ForbiddenError('Not authorized to delete this review');
      }

      // Update shop rating
      const shop = await Shop.findById(review.shopId);
      if (shop) {
        shop.totalRatings -= 1;
        if (shop.totalRatings > 0) {
          shop.rating =
            (shop.rating * (shop.totalRatings + 1) - review.rating) /
            shop.totalRatings;
        } else {
          shop.rating = 0;
        }
        await shop.save();
      }

      await review.deleteOne();

      res.json({
        status: 'success',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  },

  async getShopReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const { shopId } = req.params;
      const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

      const reviews = await Review.find({ shopId })
        .sort(sort)
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .populate('userId', 'name');

      const total = await Review.countDocuments({ shopId });

      res.json({
        status: 'success',
        data: {
          reviews,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit)),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async verifyReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { reviewId } = req.params;

      const review = await Review.findById(reviewId);
      if (!review) {
        throw new NotFoundError('Review not found');
      }

      const shop = await Shop.findById(review.shopId);
      if (!shop) {
        throw new NotFoundError('Shop not found');
      }

      if (shop.ownerId.toString() !== req.user.userId) {
        throw new ForbiddenError('Not authorized to verify this review');
      }

      review.isVerified = true;
      await review.save();

      res.json({
        status: 'success',
        data: { review },
      });
    } catch (error) {
      next(error);
    }
  },
};

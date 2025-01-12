import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { Cart } from '../models/Cart';
import { config } from '../config';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';

export const cartController = {
  async getCart(req: Request, res: Response, next: NextFunction) {
    try {
      const cart = await Cart.findOne({ userId: req.user.userId });
      if (!cart) {
        // Create a new cart if it doesn't exist
        const newCart = await Cart.create({
          userId: req.user.userId,
          items: [],
          total: 0,
        });
        return res.json({
          status: 'success',
          data: { cart: newCart },
        });
      }

      res.json({
        status: 'success',
        data: { cart },
      });
    } catch (error) {
      logger.error('Error getting cart:', error);
      next(error);
    }
  },

  async addItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId, quantity } = req.body;

      // Fetch product details from product service
      const productResponse = await axios.get(
        `${config.services.product}/api/products/${productId}`
      );
      const product = productResponse.data.data.product;

      if (!product) {
        throw new NotFoundError('Product not found');
      }

      let cart = await Cart.findOne({ userId: req.user.userId });
      if (!cart) {
        cart = await Cart.create({
          userId: req.user.userId,
          items: [],
          total: 0,
        });
      }

      // Check if item already exists in cart
      const existingItem = cart.items.find(
        (item) => item.productId.toString() === productId
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({
          productId,
          quantity,
          price: product.price,
          name: product.name,
        });
      }

      // Recalculate total
      cart.total = cart.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      await cart.save();

      res.json({
        status: 'success',
        data: { cart },
      });
    } catch (error) {
      logger.error('Error adding item to cart:', error);
      next(error);
    }
  },

  async updateItemQuantity(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId, quantity } = req.body;

      const cart = await Cart.findOne({ userId: req.user.userId });
      if (!cart) {
        throw new NotFoundError('Cart not found');
      }

      const item = cart.items.find(
        (item) => item.productId.toString() === productId
      );

      if (!item) {
        throw new NotFoundError('Item not found in cart');
      }

      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        cart.items = cart.items.filter(
          (item) => item.productId.toString() !== productId
        );
      } else {
        item.quantity = quantity;
      }

      // Recalculate total
      cart.total = cart.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      await cart.save();

      res.json({
        status: 'success',
        data: { cart },
      });
    } catch (error) {
      logger.error('Error updating item quantity:', error);
      next(error);
    }
  },

  async removeItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId } = req.params;

      const cart = await Cart.findOne({ userId: req.user.userId });
      if (!cart) {
        throw new NotFoundError('Cart not found');
      }

      cart.items = cart.items.filter(
        (item) => item.productId.toString() !== productId
      );

      // Recalculate total
      cart.total = cart.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      await cart.save();

      res.json({
        status: 'success',
        data: { cart },
      });
    } catch (error) {
      logger.error('Error removing item from cart:', error);
      next(error);
    }
  },

  async clearCart(req: Request, res: Response, next: NextFunction) {
    try {
      const cart = await Cart.findOne({ userId: req.user.userId });
      if (!cart) {
        throw new NotFoundError('Cart not found');
      }

      cart.items = [];
      cart.total = 0;
      await cart.save();

      res.json({
        status: 'success',
        data: { cart },
      });
    } catch (error) {
      logger.error('Error clearing cart:', error);
      next(error);
    }
  },
};

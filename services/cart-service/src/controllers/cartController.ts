import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { Cart } from '../models/Cart';
import { config } from '../config';
import { BadRequestError, NotFoundError } from '../utils/errors';

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
      const existingItemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (existingItemIndex > -1) {
        // Update quantity if item exists
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        // Add new item
        cart.items.push({
          productId,
          quantity,
          price: product.price,
          name: product.name,
          image: product.images[0],
        });
      }

      await cart.save();

      res.json({
        status: 'success',
        data: { cart },
      });
    } catch (error) {
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

      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (itemIndex === -1) {
        throw new NotFoundError('Item not found in cart');
      }

      if (quantity === 0) {
        // Remove item if quantity is 0
        cart.items.splice(itemIndex, 1);
      } else {
        // Update quantity
        cart.items[itemIndex].quantity = quantity;
      }

      await cart.save();

      res.json({
        status: 'success',
        data: { cart },
      });
    } catch (error) {
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

      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (itemIndex === -1) {
        throw new NotFoundError('Item not found in cart');
      }

      cart.items.splice(itemIndex, 1);
      await cart.save();

      res.json({
        status: 'success',
        data: { cart },
      });
    } catch (error) {
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
      await cart.save();

      res.json({
        status: 'success',
        data: { cart },
      });
    } catch (error) {
      next(error);
    }
  },
};

import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { Order } from '../models/Order';
import { config } from '../config';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { createPaymentIntent, confirmPaymentIntent } from '../utils/stripe';

export const orderController = {
  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { shippingAddress } = req.body;

      // Get cart from cart service
      const cartResponse = await axios.get(
        `${config.services.cart}/api/cart`,
        {
          headers: { Authorization: req.headers.authorization },
        }
      );

      const cart = cartResponse.data.data.cart;
      if (!cart || cart.items.length === 0) {
        throw new BadRequestError('Cart is empty');
      }

      // Create order
      const order = await Order.create({
        userId: req.user.userId,
        items: cart.items,
        total: cart.total,
        shippingAddress,
        paymentStatus: 'pending',
        orderStatus: 'pending',
      });

      // Create payment intent
      const paymentIntent = await createPaymentIntent(order.total);
      order.paymentIntentId = paymentIntent.id;
      await order.save();

      // Clear cart
      await axios.delete(
        `${config.services.cart}/api/cart`,
        {
          headers: { Authorization: req.headers.authorization },
        }
      );

      res.status(201).json({
        status: 'success',
        data: {
          order,
          clientSecret: paymentIntent.client_secret,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const orders = await Order.find({ userId: req.user.userId })
        .sort({ createdAt: -1 });

      res.json({
        status: 'success',
        data: { orders },
      });
    } catch (error) {
      next(error);
    }
  },

  async getOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await Order.findOne({
        _id: req.params.orderId,
        userId: req.user.userId,
      });

      if (!order) {
        throw new NotFoundError('Order not found');
      }

      res.json({
        status: 'success',
        data: { order },
      });
    } catch (error) {
      next(error);
    }
  },

  async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderStatus } = req.body;

      const order = await Order.findOne({
        _id: req.params.orderId,
        userId: req.user.userId,
      });

      if (!order) {
        throw new NotFoundError('Order not found');
      }

      order.orderStatus = orderStatus;
      await order.save();

      res.json({
        status: 'success',
        data: { order },
      });
    } catch (error) {
      next(error);
    }
  },

  async cancelOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await Order.findOne({
        _id: req.params.orderId,
        userId: req.user.userId,
      });

      if (!order) {
        throw new NotFoundError('Order not found');
      }

      if (
        order.orderStatus !== 'pending' &&
        order.orderStatus !== 'processing'
      ) {
        throw new BadRequestError(
          'Order cannot be cancelled in current status'
        );
      }

      order.orderStatus = 'cancelled';
      await order.save();

      res.json({
        status: 'success',
        data: { order },
      });
    } catch (error) {
      next(error);
    }
  },

  async handleStripeWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const sig = req.headers['stripe-signature'] as string;
      const event = req.body;

      switch (event.type) {
        case 'payment_intent.succeeded': {
          const paymentIntent = event.data.object;
          const order = await Order.findOne({
            paymentIntentId: paymentIntent.id,
          });

          if (order) {
            order.paymentStatus = 'paid';
            order.orderStatus = 'processing';
            await order.save();
          }
          break;
        }

        case 'payment_intent.payment_failed': {
          const paymentIntent = event.data.object;
          const order = await Order.findOne({
            paymentIntentId: paymentIntent.id,
          });

          if (order) {
            order.paymentStatus = 'failed';
            await order.save();
          }
          break;
        }
      }

      res.json({ received: true });
    } catch (error) {
      next(error);
    }
  },
};

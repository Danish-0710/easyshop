import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { Order } from '../models/Order';
import { config } from '../config';
import Stripe from 'stripe';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { createPaymentIntent, confirmPaymentIntent } from '../utils/stripe';

const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2023-10-16',
});

export const orderController = {
  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { billingAddress, shippingAddress, paymentMethod } = req.body;

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
      const orderData = {
        userId: req.user.userId,
        items: cart.items,
        total: cart.total,
        billingAddress,
        shippingAddress,
        paymentMethod,
        paymentStatus: paymentMethod === 'cash on delivery' ? 'pending' : 'awaiting_payment',
        orderStatus: 'pending',
      };

      const order = await Order.create(orderData);

      // Handle payment based on method
      if (paymentMethod === 'cash on delivery') {
        // No payment intent needed for COD
      } else {
        // Create payment intent for other methods
        const paymentIntent = await createPaymentIntent(order.total);
        order.paymentIntentId = paymentIntent.id;
        order.clientSecret = paymentIntent.client_secret;
        await order.save();
      }

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
          clientSecret: order.paymentIntentId ? order.clientSecret : null,
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
        data: {
          orders,
        },
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
        data: {
          order,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      const order = await Order.findOne({
        _id: req.params.orderId,
        userId: req.user.userId,
      });

      if (!order) {
        throw new NotFoundError('Order not found');
      }

      order.orderStatus = status;
      await order.save();

      res.json({
        status: 'success',
        data: {
          order,
        },
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

      if (order.orderStatus === 'delivered') {
        throw new BadRequestError('Cannot cancel delivered order');
      }

      // If payment was made, initiate refund
      if (order.paymentIntentId && order.paymentStatus === 'paid') {
        // Handle refund logic here
      }

      order.orderStatus = 'cancelled';
      order.paymentStatus = 'cancelled';
      await order.save();

      res.json({
        status: 'success',
        data: {
          order,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async handleStripeWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const sig = req.headers['stripe-signature'];
      const event = await stripe.webhooks.constructEvent(
        req.body,
        sig,
        config.stripe.webhookSecret
      );

      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object;
          const order = await Order.findOne({
            paymentIntentId: paymentIntent.id,
          });

          if (order) {
            order.paymentStatus = 'paid';
            await order.save();
          }
          break;

        case 'payment_intent.payment_failed':
          const failedPayment = event.data.object;
          const failedOrder = await Order.findOne({
            paymentIntentId: failedPayment.id,
          });

          if (failedOrder) {
            failedOrder.paymentStatus = 'failed';
            await failedOrder.save();
          }
          break;
      }

      res.json({ received: true });
    } catch (error) {
      next(error);
    }
  },
};

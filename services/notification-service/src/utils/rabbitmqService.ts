import amqp from 'amqplib';
import { config } from '../config';
import { logger } from './logger';
import { notificationController } from '../controllers/notificationController';

class RabbitMQService {
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;

  async initialize() {
    try {
      // Connect to RabbitMQ
      this.connection = await amqp.connect(config.rabbitmq.url);
      this.channel = await this.connection.createChannel();

      // Assert exchange
      await this.channel.assertExchange(config.rabbitmq.exchangeName, 'topic', {
        durable: true,
      });

      // Assert queue
      await this.channel.assertQueue(config.rabbitmq.queueName, {
        durable: true,
      });

      // Bind queue to exchange with routing patterns
      const routingPatterns = [
        'notification.#',
        'order.created',
        'order.updated',
        'payment.completed',
        'payment.failed',
        'shipping.updated',
      ];

      for (const pattern of routingPatterns) {
        await this.channel.bindQueue(
          config.rabbitmq.queueName,
          config.rabbitmq.exchangeName,
          pattern
        );
      }

      // Start consuming messages
      await this.consume();

      logger.info('RabbitMQ connection established');
    } catch (error) {
      logger.error('Failed to initialize RabbitMQ:', error);
      throw error;
    }
  }

  private async consume() {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }

    await this.channel.consume(
      config.rabbitmq.queueName,
      async (msg) => {
        if (!msg) return;

        try {
          const content = JSON.parse(msg.content.toString());
          const routingKey = msg.fields.routingKey;

          logger.info(`Received message with routing key: ${routingKey}`);

          // Process message based on routing key
          await this.processMessage(routingKey, content);

          // Acknowledge message
          this.channel?.ack(msg);
        } catch (error) {
          logger.error('Error processing message:', error);
          // Reject message and requeue if it's a temporary failure
          this.channel?.nack(msg, false, true);
        }
      },
      {
        noAck: false,
      }
    );
  }

  private async processMessage(routingKey: string, content: any) {
    // Create mock request and response objects
    const req = {
      body: {
        userId: content.userId,
        type: this.getNotificationType(routingKey),
        channel: content.channel || 'in_app',
        templateName: this.getTemplateName(routingKey),
        variables: content,
      },
    };

    const res = {
      status: (code: number) => ({
        json: (data: any) => {
          logger.info('Notification processed:', data);
        },
      }),
    };

    const next = (error: any) => {
      if (error) {
        throw error;
      }
    };

    // Process notification using the controller
    await notificationController.createNotification(
      req as any,
      res as any,
      next as any
    );
  }

  private getNotificationType(routingKey: string): string {
    const [category] = routingKey.split('.');
    return category;
  }

  private getTemplateName(routingKey: string): string {
    return routingKey.replace(/\./g, '_');
  }

  async publish(routingKey: string, message: any) {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }

    try {
      await this.channel.publish(
        config.rabbitmq.exchangeName,
        routingKey,
        Buffer.from(JSON.stringify(message)),
        {
          persistent: true,
        }
      );

      logger.info(`Message published to ${routingKey}`);
    } catch (error) {
      logger.error('Failed to publish message:', error);
      throw error;
    }
  }

  async close() {
    try {
      await this.channel?.close();
      await this.connection?.close();
      logger.info('RabbitMQ connection closed');
    } catch (error) {
      logger.error('Error closing RabbitMQ connection:', error);
      throw error;
    }
  }
}

export const rabbitmqService = new RabbitMQService();

import mongoose, { Document, Schema } from 'mongoose';

export interface OrderItem {
  productId: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
  name: string;
  image: string;
}

export interface Address {
  title: string;
  phone: string;
  country: string;
  city: string;
  state: string;
  zip: string;
  streetAddress: string;
}

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  items: OrderItem[];
  total: number;
  billingAddress: Address;
  shippingAddress: Address;
  paymentMethod: 'cash on delivery' | 'card' | 'paypal';
  paymentStatus: 'pending' | 'awaiting_payment' | 'paid' | 'failed' | 'cancelled';
  orderStatus:
    | 'pending'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
    | 'refunded';
  paymentIntentId?: string;
  clientSecret?: string;
  trackingNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<Address>({
  title: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  zip: {
    type: String,
    required: true,
  },
  streetAddress: {
    type: String,
    required: true,
  },
});

const orderItemSchema = new Schema<OrderItem>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
});

const orderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [orderItemSchema],
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    billingAddress: {
      type: addressSchema,
      required: true,
    },
    shippingAddress: {
      type: addressSchema,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['cash on delivery', 'card', 'paypal'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'awaiting_payment', 'paid', 'failed', 'cancelled'],
      default: 'pending',
    },
    orderStatus: {
      type: String,
      enum: [
        'pending',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
        'refunded',
      ],
      default: 'pending',
    },
    paymentIntentId: { type: String },
    clientSecret: { type: String },
    trackingNumber: String,
    notes: String,
  },
  {
    timestamps: true,
  }
);

// Create indexes
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });

export const Order = mongoose.model<IOrder>('Order', orderSchema);

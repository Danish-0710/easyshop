import mongoose, { Document, Schema } from 'mongoose';
import slugify from 'slugify';

export interface BusinessHours {
  day: string;
  open: string;
  close: string;
  isClosed: boolean;
}

export interface ShopSettings {
  minimumOrderAmount: number;
  freeShippingThreshold: number;
  shippingFee: number;
  taxRate: number;
  returnPeriod: number;
  autoAcceptOrders: boolean;
}

export interface IShop extends Document {
  name: string;
  slug: string;
  description: string;
  logo: string;
  banner: string;
  ownerId: mongoose.Types.ObjectId;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  businessHours: BusinessHours[];
  settings: ShopSettings;
  categories: string[];
  isActive: boolean;
  rating: number;
  totalRatings: number;
  totalOrders: number;
  totalProducts: number;
  createdAt: Date;
  updatedAt: Date;
}

const businessHoursSchema = new Schema<BusinessHours>({
  day: {
    type: String,
    required: true,
    enum: [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ],
  },
  open: {
    type: String,
    required: true,
  },
  close: {
    type: String,
    required: true,
  },
  isClosed: {
    type: Boolean,
    default: false,
  },
});

const shopSettingsSchema = new Schema<ShopSettings>({
  minimumOrderAmount: {
    type: Number,
    default: 0,
  },
  freeShippingThreshold: {
    type: Number,
    default: 0,
  },
  shippingFee: {
    type: Number,
    default: 0,
  },
  taxRate: {
    type: Number,
    default: 0,
  },
  returnPeriod: {
    type: Number,
    default: 30,
  },
  autoAcceptOrders: {
    type: Boolean,
    default: false,
  },
});

const shopSchema = new Schema<IShop>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    logo: {
      type: String,
      required: true,
    },
    banner: {
      type: String,
      required: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      street: {
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
      postalCode: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
    },
    businessHours: [businessHoursSchema],
    settings: {
      type: shopSettingsSchema,
      default: () => ({}),
    },
    categories: [{
      type: String,
      required: true,
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
    totalProducts: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create slug from name
shopSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true });
  }
  next();
});

// Create indexes
shopSchema.index({ slug: 1 });
shopSchema.index({ ownerId: 1 });
shopSchema.index({ categories: 1 });
shopSchema.index({ isActive: 1 });
shopSchema.index(
  {
    name: 'text',
    description: 'text',
  },
  {
    weights: {
      name: 2,
      description: 1,
    },
  }
);

export const Shop = mongoose.model<IShop>('Shop', shopSchema);

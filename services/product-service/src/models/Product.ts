import mongoose, { Document, Schema } from 'mongoose';
import slugify from 'slugify';

export interface IProduct extends Document {
  title: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  images: string[];
  category: string;
  subcategory?: string;
  brand?: string;
  stock: number;
  rating: number;
  numReviews: number;
  reviews: Array<{
    userId: string;
    rating: number;
    comment: string;
    createdAt: Date;
  }>;
  variants?: Array<{
    name: string;
    options: string[];
  }>;
  shopId: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    title: {
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
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    comparePrice: {
      type: Number,
      min: 0,
    },
    images: [{
      type: String,
      required: true,
    }],
    category: {
      type: String,
      required: true,
    },
    subcategory: String,
    brand: String,
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    reviews: [{
      userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User',
      },
      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      comment: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
    variants: [{
      name: String,
      options: [String],
    }],
    shopId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Shop',
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Generate slug before saving
productSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true });
  }
  next();
});

// Add indexes for better query performance
productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });
productSchema.index({ shopId: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 
  title: 'text', 
  description: 'text',
  category: 'text',
  brand: 'text' 
});

export const Product = mongoose.model<IProduct>('Product', productSchema);

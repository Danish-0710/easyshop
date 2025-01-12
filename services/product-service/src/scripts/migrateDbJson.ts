import mongoose from 'mongoose';
import { config } from '../config';
import { Product } from '../models/Product';
import { logger } from '../utils/logger';
import fs from 'fs';
import path from 'path';
import slugify from 'slugify';

interface DbJsonProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  categories: string[];
  image: string[];
  unit_of_measure?: string;
  amount?: number;
  rating: number;
  shop_category: string;
}

function generateUniqueSlug(title: string, existingSlugs: Set<string>): string {
  let slug = slugify(title, { lower: true });
  let counter = 1;
  let uniqueSlug = slug;

  while (existingSlugs.has(uniqueSlug)) {
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  existingSlugs.add(uniqueSlug);
  return uniqueSlug;
}

async function migrateProducts() {
  try {
    // Read the db.json file
    const dbJsonPath = path.join(__dirname, '../../../../.db/db.json');
    const dbJson = JSON.parse(fs.readFileSync(dbJsonPath, 'utf-8'));
    const products = dbJson.products as DbJsonProduct[];

    // Connect to MongoDB
    await mongoose.connect(config.mongoUri);
    logger.info('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    logger.info('Cleared existing products');

    // Keep track of used slugs
    const existingSlugs = new Set<string>();

    // Transform and insert products
    const transformedProducts = products.map(product => ({
      title: product.title,
      slug: generateUniqueSlug(product.title, existingSlugs),
      description: product.description,
      price: product.price,
      category: product.shop_category,
      subcategory: product.categories[0], // Using first category as subcategory
      brand: 'EasyShop', // Default brand
      images: product.image,
      stock: product.amount || 100, // Default stock if amount not provided
      rating: product.rating,
      numReviews: 0, // Default value
      reviews: [],
      variants: [
        {
          name: 'unit',
          options: [product.unit_of_measure || 'piece']
        }
      ],
      shopId: '65a16e9c8a6f2cfde6969e1a', // Default shop ID
      isPublished: true
    }));

    // Insert products in batches of 100
    const batchSize = 100;
    for (let i = 0; i < transformedProducts.length; i += batchSize) {
      const batch = transformedProducts.slice(i, i + batchSize);
      await Product.insertMany(batch);
      logger.info(`Inserted batch ${i / batchSize + 1} of ${Math.ceil(transformedProducts.length / batchSize)}`);
    }

    logger.info(`Successfully migrated ${transformedProducts.length} products`);
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  } catch (error) {
    logger.error('Error migrating products:', error);
    process.exit(1);
  }
}

migrateProducts();

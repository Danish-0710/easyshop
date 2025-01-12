import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import { Product } from '../models/Product';

interface IProductData {
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

async function migrateProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Read the JSON file
    const dbPath = path.join(process.cwd(), '..', '..', '.db', 'db.json');
    const data = await fs.readFile(dbPath, 'utf-8');
    const { products } = JSON.parse(data);

    // Delete existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Transform and insert products
    const transformedProducts = products.map((product: IProductData) => {
      const baseSlug = product.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const uniqueSlug = `${baseSlug}-${product.id}`;
      
      return {
        title: product.title,
        slug: uniqueSlug,
        description: product.description,
        price: product.price,
        comparePrice: product.price * 1.2, // Example: 20% higher compare price
        images: product.image,
        category: product.categories?.[0] || product.shop_category,
        subcategory: product.categories?.[1],
        stock: product.amount || 100,
        rating: product.rating || 0,
        numReviews: 0,
        reviews: [],
        shopId: '1', // Default shop ID
        isPublished: true,
      };
    });

    // Insert products in batches of 100
    const batchSize = 100;
    for (let i = 0; i < transformedProducts.length; i += batchSize) {
      const batch = transformedProducts.slice(i, i + batchSize);
      await Product.insertMany(batch);
      console.log(`Inserted products ${i + 1} to ${i + batch.length}`);
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run migration
migrateProducts();

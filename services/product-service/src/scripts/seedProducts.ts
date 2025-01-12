import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import { Product } from '../models/Product';
import { config } from '../config';
import { logger } from '../utils/logger';
import slugify from 'slugify';

const categories = [
  { name: 'Books', subcategories: ['Fiction', 'Non-Fiction', 'Educational', 'Comics', 'Biography'] },
  { name: 'Electronics', subcategories: ['Smartphones', 'Laptops', 'Accessories', 'Gaming', 'Audio'] },
  { name: 'Fashion', subcategories: ['Men', 'Women', 'Kids', 'Accessories', 'Footwear'] },
  { name: 'Home', subcategories: ['Furniture', 'Decor', 'Kitchen', 'Bedding', 'Storage'] },
  { name: 'Beauty', subcategories: ['Skincare', 'Makeup', 'Haircare', 'Fragrance', 'Tools'] }
];

const shopIds = [
  'shop1', 'shop2', 'shop3', 'shop4', 'shop5'
];

interface ProductDoc {
  title: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  images: string[];
  category: string;
  subcategory: string;
  brand: string;
  stock: number;
  rating: number;
  numReviews: number;
  reviews: Array<{
    userId: string;
    rating: number;
    comment: string;
    createdAt: Date;
  }>;
  variants: Array<{
    name: string;
    options: string[];
  }>;
  shopId: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const generateProduct = (category: string, subcategory: string): ProductDoc => {
  const title = faker.commerce.productName();
  const price = faker.number.float({ min: 10, max: 1000, fractionDigits: 2 });
  const hasDiscount = faker.datatype.boolean(0.3);
  const comparePrice = hasDiscount ? price * (1 + faker.number.float({ min: 0.1, max: 0.5, fractionDigits: 2 })) : undefined;
  
  const images = Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => {
    return faker.image.url();
  });

  return {
    title,
    slug: slugify(title + '-' + faker.string.alphanumeric(8), { lower: true }),
    description: faker.commerce.productDescription(),
    price,
    comparePrice,
    images,
    category,
    subcategory,
    brand: faker.company.name(),
    stock: faker.number.int({ min: 0, max: 100 }),
    rating: faker.number.float({ min: 1, max: 5, fractionDigits: 1 }),
    numReviews: faker.number.int({ min: 0, max: 500 }),
    reviews: Array.from({ length: faker.number.int({ min: 0, max: 10 }) }, () => ({
      userId: faker.string.uuid(),
      rating: faker.number.int({ min: 1, max: 5 }),
      comment: faker.lorem.paragraph(),
      createdAt: faker.date.past()
    })),
    variants: Array.from({ length: faker.number.int({ min: 0, max: 3 }) }, () => ({
      name: faker.commerce.productAdjective(),
      options: Array.from({ length: faker.number.int({ min: 2, max: 5 }) }, () => faker.commerce.productMaterial())
    })),
    shopId: faker.helpers.arrayElement(shopIds),
    isPublished: true,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent()
  };
};

const seedProducts = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    logger.info('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    logger.info('Cleared existing products');

    // Generate products for each category and subcategory
    const products: ProductDoc[] = [];
    for (const category of categories) {
      for (const subcategory of category.subcategories) {
        // Generate 40 products per subcategory
        const productsPerSubcategory = Array.from({ length: 40 }, () =>
          generateProduct(category.name, subcategory)
        );
        products.push(...productsPerSubcategory);
      }
    }

    // Insert products in batches to avoid memory issues
    const batchSize = 50;
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      await Product.insertMany(batch);
      logger.info(`Inserted batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(products.length / batchSize)}`);
    }

    logger.info(`Successfully seeded ${products.length} products`);
  } catch (error) {
    logger.error('Error seeding products:', error);
  } finally {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  }
};

seedProducts();

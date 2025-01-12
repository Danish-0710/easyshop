import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { Shop } from '../models/Shop';
import { config } from '../config';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/errors';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary';

export const shopController = {
  async createShop(req: Request, res: Response, next: NextFunction) {
    try {
      const shopData = req.body;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      if (!files.logo || !files.banner) {
        throw new BadRequestError('Logo and banner are required');
      }

      // Upload images to Cloudinary
      const logoResult = await uploadToCloudinary(files.logo[0]);
      const bannerResult = await uploadToCloudinary(files.banner[0]);

      const shop = await Shop.create({
        ...shopData,
        ownerId: req.user.userId,
        logo: logoResult.secure_url,
        banner: bannerResult.secure_url,
      });

      res.status(201).json({
        status: 'success',
        data: { shop },
      });
    } catch (error) {
      next(error);
    }
  },

  async updateShop(req: Request, res: Response, next: NextFunction) {
    try {
      const { shopId } = req.params;
      const updateData = req.body;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      const shop = await Shop.findById(shopId);
      if (!shop) {
        throw new NotFoundError('Shop not found');
      }

      if (shop.ownerId.toString() !== req.user.userId) {
        throw new ForbiddenError('Not authorized to update this shop');
      }

      // Handle image uploads if present
      if (files.logo) {
        const logoResult = await uploadToCloudinary(files.logo[0]);
        await deleteFromCloudinary(shop.logo);
        updateData.logo = logoResult.secure_url;
      }

      if (files.banner) {
        const bannerResult = await uploadToCloudinary(files.banner[0]);
        await deleteFromCloudinary(shop.banner);
        updateData.banner = bannerResult.secure_url;
      }

      const updatedShop = await Shop.findByIdAndUpdate(
        shopId,
        { $set: updateData },
        { new: true }
      );

      res.json({
        status: 'success',
        data: { shop: updatedShop },
      });
    } catch (error) {
      next(error);
    }
  },

  async getShop(req: Request, res: Response, next: NextFunction) {
    try {
      const { shopId } = req.params;

      const shop = await Shop.findById(shopId);
      if (!shop) {
        throw new NotFoundError('Shop not found');
      }

      res.json({
        status: 'success',
        data: { shop },
      });
    } catch (error) {
      next(error);
    }
  },

  async getShopBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;

      const shop = await Shop.findOne({ slug });
      if (!shop) {
        throw new NotFoundError('Shop not found');
      }

      res.json({
        status: 'success',
        data: { shop },
      });
    } catch (error) {
      next(error);
    }
  },

  async getShops(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        page = 1,
        limit = 10,
        category,
        search,
        sort = 'rating',
      } = req.query;

      const query: any = { isActive: true };

      if (category) {
        query.categories = category;
      }

      if (search) {
        query.$text = { $search: search as string };
      }

      const sortOptions: any = {};
      switch (sort) {
        case 'rating':
          sortOptions.rating = -1;
          break;
        case 'orders':
          sortOptions.totalOrders = -1;
          break;
        case 'newest':
          sortOptions.createdAt = -1;
          break;
        default:
          sortOptions.rating = -1;
      }

      const shops = await Shop.find(query)
        .sort(sortOptions)
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit));

      const total = await Shop.countDocuments(query);

      res.json({
        status: 'success',
        data: {
          shops,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit)),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async getMyShop(req: Request, res: Response, next: NextFunction) {
    try {
      const shop = await Shop.findOne({ ownerId: req.user.userId });
      if (!shop) {
        throw new NotFoundError('Shop not found');
      }

      res.json({
        status: 'success',
        data: { shop },
      });
    } catch (error) {
      next(error);
    }
  },

  async updateShopSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const { shopId } = req.params;
      const settings = req.body;

      const shop = await Shop.findById(shopId);
      if (!shop) {
        throw new NotFoundError('Shop not found');
      }

      if (shop.ownerId.toString() !== req.user.userId) {
        throw new ForbiddenError('Not authorized to update this shop');
      }

      shop.settings = { ...shop.settings, ...settings };
      await shop.save();

      res.json({
        status: 'success',
        data: { shop },
      });
    } catch (error) {
      next(error);
    }
  },

  async updateBusinessHours(req: Request, res: Response, next: NextFunction) {
    try {
      const { shopId } = req.params;
      const { businessHours } = req.body;

      const shop = await Shop.findById(shopId);
      if (!shop) {
        throw new NotFoundError('Shop not found');
      }

      if (shop.ownerId.toString() !== req.user.userId) {
        throw new ForbiddenError('Not authorized to update this shop');
      }

      shop.businessHours = businessHours;
      await shop.save();

      res.json({
        status: 'success',
        data: { shop },
      });
    } catch (error) {
      next(error);
    }
  },

  async toggleShopStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { shopId } = req.params;

      const shop = await Shop.findById(shopId);
      if (!shop) {
        throw new NotFoundError('Shop not found');
      }

      if (shop.ownerId.toString() !== req.user.userId) {
        throw new ForbiddenError('Not authorized to update this shop');
      }

      shop.isActive = !shop.isActive;
      await shop.save();

      res.json({
        status: 'success',
        data: { shop },
      });
    } catch (error) {
      next(error);
    }
  },

  async getShopAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const { shopId } = req.params;
      const { period = '7d' } = req.query;

      const shop = await Shop.findById(shopId);
      if (!shop) {
        throw new NotFoundError('Shop not found');
      }

      if (shop.ownerId.toString() !== req.user.userId) {
        throw new ForbiddenError('Not authorized to view analytics');
      }

      // Get orders from order service
      const ordersResponse = await axios.get(
        `${config.services.order}/api/orders/analytics/${shopId}`,
        {
          params: { period },
          headers: { Authorization: req.headers.authorization },
        }
      );

      // Get products from product service
      const productsResponse = await axios.get(
        `${config.services.product}/api/products/analytics/${shopId}`,
        {
          params: { period },
          headers: { Authorization: req.headers.authorization },
        }
      );

      res.json({
        status: 'success',
        data: {
          orders: ordersResponse.data.data,
          products: productsResponse.data.data,
          shop: {
            totalOrders: shop.totalOrders,
            totalProducts: shop.totalProducts,
            rating: shop.rating,
            totalRatings: shop.totalRatings,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },
};

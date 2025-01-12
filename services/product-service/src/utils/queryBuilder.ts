interface QueryParams {
  [key: string]: any;
}

interface PaginationOptions {
  page: number;
  limit: number;
  skip: number;
  sort: { [key: string]: 1 | -1 };
}

export const buildQuery = (params: QueryParams) => {
  const query: QueryParams = {};
  const pagination: PaginationOptions = {
    page: 1,
    limit: 10,
    skip: 0,
    sort: { createdAt: -1 },
  };

  // Extract pagination params
  if (params.page) {
    pagination.page = parseInt(params.page as string);
  }
  if (params.limit) {
    pagination.limit = parseInt(params.limit as string);
  }
  pagination.skip = (pagination.page - 1) * pagination.limit;

  // Extract sorting
  if (params.sort) {
    const [field, order] = (params.sort as string).split(':');
    pagination.sort = { [field]: order === 'desc' ? -1 : 1 };
  }

  // Filter params
  const filterableFields = [
    'category',
    'subcategory',
    'brand',
    'shopId',
    'isPublished',
  ];

  filterableFields.forEach((field) => {
    if (params[field]) {
      query[field] = params[field];
    }
  });

  // Search query
  if (params.q) {
    query.$or = [
      { name: { $regex: params.q, $options: 'i' } },
      { description: { $regex: params.q, $options: 'i' } },
      { category: { $regex: params.q, $options: 'i' } },
      { subcategory: { $regex: params.q, $options: 'i' } },
    ];
  }

  // Price range
  if (params.minPrice || params.maxPrice) {
    query.price = {};
    if (params.minPrice) {
      query.price.$gte = parseFloat(params.minPrice);
    }
    if (params.maxPrice) {
      query.price.$lte = parseFloat(params.maxPrice);
    }
  }

  // Color filter
  if (params.color) {
    query.colors = params.color;
  }

  // Size filter
  if (params.size) {
    query.sizes = params.size;
  }

  // Rating filter
  if (params.rating) {
    query.rating = { $gte: parseFloat(params.rating) };
  }

  return { query, pagination };
};

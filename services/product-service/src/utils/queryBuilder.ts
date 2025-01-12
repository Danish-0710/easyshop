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

  // Price range
  if (params.minPrice || params.maxPrice) {
    query.price = {};
    if (params.minPrice) {
      query.price.$gte = parseFloat(params.minPrice as string);
    }
    if (params.maxPrice) {
      query.price.$lte = parseFloat(params.maxPrice as string);
    }
  }

  // Rating filter
  if (params.rating) {
    query.rating = { $gte: parseFloat(params.rating as string) };
  }

  return { query, pagination };
};

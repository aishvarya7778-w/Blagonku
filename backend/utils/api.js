export const buildPagination = (query) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 9, 1), 30);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

export const sendPaginated = (res, { data, total, page, limit }) =>
  res.status(200).json({
    data,
    meta: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1
    }
  });

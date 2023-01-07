import ProductsStatsModal from '../models/productsStats.js';
import UsersModal from '../models/users.js';
import ProductsModal from '../models/products.js';

export const getProductsStats = async (req, res) => {
  try {
    const query = {};
    const page = Number(req.query.page) || 1;
    const perPage = Number(req.query.per_page) || 10;
    const filters = {};
    let total;

    const startIndex = (page - 1) * perPage;

    const user = await UsersModal.findOne({ _id: req.userId });

    if (req.query.store !== '') {
      filters.store = req.query.store;
    }

    let productsStats;
    query.$or = [
      {
        name: { $regex: req.query.search_keyword || '', $options: 'i' },
      },
    ];

    if (user.role === 'superAdmin') {
      if (filters?.store) {
        total = await ProductsStatsModal.countDocuments({ store: filters.store });
      } else {
        total = await ProductsStatsModal.countDocuments({});
      }
    } else {
      total = await ProductsStatsModal.countDocuments({ store: user?.store });
    }

    const product = await ProductsModal.find(query);

    filters.product = product.map((e) => e._id);

    if (user && user.role === 'superAdmin') {
      total = await ProductsStatsModal.countDocuments({});
      productsStats = await ProductsStatsModal.find()
        .where(filters)
        .populate('product')
        .limit(perPage)
        .skip(startIndex);
    } else {
      productsStats = await ProductsStatsModal.find({ store: user.store, product: product.map((e) => e._id) })
        .populate('product')
        .limit(perPage)
        .skip(startIndex);
    }
    res.status(200).json({ stats: productsStats, currentPage: page, totalPages: Math.ceil(total / perPage) });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

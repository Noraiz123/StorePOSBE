import mongoose from 'mongoose';
import Cashflow from '../models/cashflow.js';
import UsersModal from '../models/users.js';

export const getCashFlows = async (req, res) => {
  try {
    const user = await UsersModal.findOne({ _id: req.userId });
    const page = Number(req.query.page) || 1;
    const perPage = Number(req.query.per_page) || 10;

    const startIndex = (page - 1) * perPage;
    const query = JSON.parse(req.query.query);

    let cashflow;
    let filters = {};
    let total;
    let totalCashflow;

    if (query.customer !== '') {
      filters.customer = mongoose.Types.ObjectId(query.customer);
    }

    if (query.type !== '') {
      filters.type = query.type;
    }

    if (query.created_at_gteq !== '' && query.created_at_lteq !== '') {
      filters.createdAt = {
        $gte: `${query.created_at_gteq}T00:00:00.000Z`,
        $lt: `${query.created_at_lteq}T23:59:59.999Z`,
      };
    }

    if (user?.store && user.role === 'admin') {
      filters.store = user.store;
    }

    if (query?.store !== '' && user.role === 'superAdmin') {
      filters.store = mongoose.Types.ObjectId(query.store);
    }

    if (user && user.role === 'superAdmin') {
      total = await Cashflow.countDocuments({});
      cashflow = await Cashflow.find()
        .where(filters)
        .limit(perPage)
        .skip(startIndex)
        .sort({ createdAt: -1 })
        .populate('customer');
    } else {
      total = await Cashflow.countDocuments({ store: user.store });
      cashflow = await Cashflow.find({ store: user.store })
        .where(filters)
        .limit(perPage)
        .skip(startIndex)
        .sort({ createdAt: -1 })
        .populate('customer');
    }

    if (total && total > 0) {
      totalCashflow = await Cashflow.aggregate([
        { $match: filters },
        {
          $group: { _id: null, total: { $sum: '$total' } },
        },
      ]);
    }

    const date = new Date();
    const month = date.getMonth();
    const year = date.getFullYear();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const statsOfFullMonth = {
      $gte: firstDayOfMonth,
      $lt: lastDayOfMonth,
    };

    const chartStatsFilters = {
      createdAt: filters?.createdAt || statsOfFullMonth,
    };

    if (filters?.store) {
      chartStatsFilters.store = filters.store;
    }

    const chartStats = await Cashflow.aggregate([
      {
        $match: chartStatsFilters,
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          totalCashflow: { $sum: '$total' },
          received: { $sum: '$received' },
          remaining: { $sum: '$remaining' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { totalCashflow: -1 },
      },
    ]);

    res.status(200).json({
      cashflow: cashflow,
      currentPage: page,
      totalPages: Math.ceil(total / perPage),
      noOfCashflow: total,
      totalCashflow: totalCashflow?.[0]?.total || 0,
      cashflowStats: chartStats,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const findCustomerPayable = async (req, res) => {
  try {
    const cashflow = await Cashflow.findOne({ type: 'Payable', customer: req.params.id });

    if (cashflow.received > req.query.total) {
      await Cashflow.updateOne({ _id: cashflow.id }, {});
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const createCashflow = async (req, res) => {
  const cashflow = req.body;
  let newCashflow;

  const user = await UsersModal.findOne({ _id: req.userId });
  const oldCashflow = await Cashflow.findOne({ customer: cashflow.customer, type: 'Payable' });

  if (cashflow.type === 'Receivable' && oldCashflow) {
    const difference = cashflow.total - Math.abs(oldCashflow.remaining) - cashflow.received;
    if (difference < 0) {
      newCashflow = new Cashflow({
        ...cashflow,
        type: 'Payable',
        remaining: difference,
        store: user?.store ? user.store : undefined,
        createdAt: new Date().toISOString(),
      });
    } else if (difference > 0) {
      newCashflow = new Cashflow({
        ...cashflow,
        type: 'Receivable',
        received: Math.abs(oldCashflow.remaining),
        remaining: difference,
        store: user?.store ? user.store : undefined,
        createdAt: new Date().toISOString(),
      });
    }
    await Cashflow.deleteOne({ _id: oldCashflow._id });
  } else {
    newCashflow = new Cashflow({
      ...cashflow,
      store: user?.store ? user.store : undefined,
      createdAt: new Date().toISOString(),
    });
  }

  try {
    newCashflow && (await newCashflow.save());
    res.status(201).json(newCashflow);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const updateCashflow = async (req, res) => {
  const { id } = req.params;
  const updateCashflow = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No Cashflow with id: ${id}`);

  const updatedCashflow = { ...updateCashflow, _id: id };

  await Cashflow.findByIdAndUpdate(id, updatedCashflow, { new: true });

  res.json(updatedCashflow);
};

export const deleteCashflow = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No cashflow with id: ${id}`);

  await Cashflow.findByIdAndRemove(id);

  res.json({ message: 'Cashflow deleted successfully.' });
};

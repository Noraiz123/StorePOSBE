import ExpenseModal from '../models/expenses.js';
import UsersModal from '../models/users.js';
import mongoose from 'mongoose';

export const getExpenses = async (req, res) => {
  try {
    const user = await UsersModal.findOne({ _id: req.userId });
    const page = Number(req.query.page) || 1;
    const perPage = Number(req.query.per_page) || 10;

    const startIndex = (page - 1) * perPage;
    const query = JSON.parse(req.query.query);

    let filters = {};
    let expenseModals;
    let total;
    let totalExpense;

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
      total = await ExpenseModal.countDocuments({});
      expenseModals = await ExpenseModal.find().where(filters).limit(perPage).skip(startIndex).sort({ createdAt: -1 });
    } else if (user && user.role === 'admin') {
      total = await ExpenseModal.countDocuments({ store: user.store });
      expenseModals = await ExpenseModal.find().where(filters).limit(perPage).skip(startIndex).sort({ createdAt: -1 });
    } else {
      return res.status(400).json({ message: 'You are not allowed to access orders' });
    }

    if (total && total > 0) {
      totalExpense = await ExpenseModal.aggregate([
        { $match: filters },
        {
          $group: { _id: null, total: { $sum: '$amount' } },
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

    const chartStats = await ExpenseModal.aggregate([
      {
        $match: chartStatsFilters,
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          totalExpense: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { totalExpense: -1 },
      },
    ]);
    res.status(200).json({
      expenses: expenseModals,
      currentPage: page,
      totalPages: Math.ceil(total / perPage),
      noOfExpenses: total,
      totalExpense: totalExpense?.[0]?.total || 0,
      expenseStats: chartStats,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const createExpense = async (req, res) => {
  const expense = req.body;

  const user = await UsersModal.findOne({ _id: req.userId });

  const newExpenseModal = new ExpenseModal({ ...expense, store: user?.store ? user.store : 'undefined' });
  try {
    await newExpenseModal.save();

    res.status(200).json(newExpenseModal);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No expense with id: ${id}`);

    const updatedExpense = { ...expense, _id: id };

    await ExpenseModal.findByIdAndUpdate(id, updatedExpense, { new: true, runValidators: true });

    res.json(updatedExpense);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const deleteExpense = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No expense with id: ${id}`);

  await ExpenseModal.findByIdAndRemove(id);

  res.json({ message: 'expense deleted successfully.' });
};

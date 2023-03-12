import mongoose from 'mongoose';
import OrdersModal from '../models/orders.js';
import ProductsModal from '../models/products.js';
import UsersModal from '../models/users.js';
import ProductsStatsModal from '../models/productsStats.js';
import CustomerModal from '../models/customers.js';
import expenses from '../models/expenses.js';
import digitalSales from '../models/digitalSales.js';

const decreaseQuantity = (products) => {
  let bulkOptions = products.orderItems.map((item) => {
    return {
      updateOne: {
        filter: { _id: item.product._id },
        update: { $inc: { quantity: item.variated ? -(item.quantity / item.bagQuantity) : -item.quantity } },
      },
    };
  });

  ProductsModal.bulkWrite(bulkOptions);
};

const updateProductsStats = (products) => {
  let bulkOptions = products.orderItems.map((item) => {
    return {
      updateOne: {
        filter: { product: item.product._id },
        update: {
          $inc: {
            available: item.variated ? -(item.quantity / item.bagQuantity) : -item.quantity,
            sold: item.variated ? +(item.quantity / item.bagQuantity) : +item.quantity,
            sales: +item.paidPrice,
          },
        },
      },
    };
  });

  ProductsStatsModal.bulkWrite(bulkOptions);
};

export const getOrders = async (req, res) => {
  try {
    const user = await UsersModal.findOne({ _id: req.userId });
    const page = Number(req.query.page) || 1;
    const perPage = Number(req.query.per_page) || 10;

    const startIndex = (page - 1) * perPage;
    let total;
    let totalSales;
    let totalRetailPrice;
    let totalExpenses;
    let totalDigitalSales;

    const query = JSON.parse(req.query.query);

    let ordersModals;

    const filters = {};

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

    if (query?.invoiceNo !== '') {
      filters.invoiceNo = Number(query.invoiceNo);
    }

    if (query.cashier_id_eq !== '') {
      filters.cashier = query.cashier_id_eq;
    }

    if (query.salesman_id_eq !== '') {
      filters.salesman = query.salesman_id_eq;
    }

    if (query.status_in !== '') {
      filters.status = query.status_in;
    }

    if (user && user.role === 'superAdmin') {
      total = await OrdersModal.countDocuments({}).where(filters);
      ordersModals = await OrdersModal.find()
        .where(filters)
        .populate('cashier')
        .populate('salesman')
        .populate('orderItems.product')
        .limit(perPage)
        .skip(startIndex)
        .sort({ createdAt: -1 });
    } else if (user && user.role === 'admin') {
      total = await OrdersModal.countDocuments({}).where(filters);
      ordersModals = await OrdersModal.find()
        .where(filters)
        .populate('cashier')
        .populate('salesman')
        .populate('orderItems.product')
        .populate('customer')
        .limit(perPage)
        .skip(startIndex)
        .sort({ createdAt: -1 });
    } else {
      return res.status(400).json({ message: 'You are not allowed to access orders' });
    }

    const totalFilters = { ...filters };

    if (filters?.cashier) {
      totalFilters.cashier = mongoose.Types.ObjectId(filters.cashier);
    }

    totalDigitalSales = await digitalSales.aggregate([
      { $match: { ...(filters?.createdAt && { createdAt: filters.createdAt }), store: filters.store } },
      {
        $group: { _id: null, total: { $sum: '$amount' } },
      },
    ]);

    if (total && total > 0) {
      totalSales = await OrdersModal.aggregate([
        { $match: totalFilters },
        {
          $group: { _id: null, total: { $sum: '$total' } },
        },
      ]);

      let expenseFilters = {};
      if (filters?.createdAt) {
        expenseFilters.createdAt = filters.createdAt;
      }
      expenseFilters.type = { $ne: 'accrued' };
      if (filters?.store) {
        expenseFilters.store = filters.store;
      }
      totalExpenses = await expenses.aggregate([
        { $match: expenseFilters },
        {
          $group: { _id: null, total: { $sum: '$amount' } },
        },
      ]);
      totalRetailPrice = await OrdersModal.aggregate([
        { $match: totalFilters },
        {
          $group: { _id: null, total: { $sum: '$totalRetailPrice' } },
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

    const chartStats = await OrdersModal.aggregate([
      {
        $match: chartStatsFilters,
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          totalSaleAmount: { $sum: '$total' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { totalSaleAmount: -1 },
      },
    ]);

    const totalProfit =
      totalSales && totalRetailPrice && totalSales.length > 0 && totalRetailPrice.length > 0
        ? totalSales[0]?.total - totalRetailPrice[0]?.total
        : 0;

    const profitWithExpense = totalExpenses?.[0]?.total ? totalProfit - totalExpenses?.[0]?.total : totalProfit;

    res.status(200).json({
      orders: ordersModals,
      currentPage: page,
      totalPages: Math.ceil(total / perPage),
      totalTransactions: total,
      totalSales: totalSales?.[0]?.total || 0,
      totalProfit: profitWithExpense,
      totalDigitalSales: totalDigitalSales?.[0]?.total || 0,
      chartStats: chartStats,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

const getRandomId = (min = 0, max = 500000) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  const num = Math.floor(Math.random() * (max - min + 1)) + min;
  return num.toString().padStart(6, '0');
};

export const createOrder = async (req, res) => {
  const order = req.body;

  const user = await UsersModal.findOne({ _id: req.userId });
  let customer;

  if (order.customerAttributes) {
    const newCustomer = new CustomerModal({ ...order.customerAttributes, store: user?.store });

    customer = await newCustomer.save();
    order.customer = customer._id;
  }

  const invoiceNo = getRandomId();

  const newOrderModal = new OrdersModal({
    ...order,
    store: user?.store ? user.store : 'undefined',
    invoiceNo: order?.invoiceNo || invoiceNo,
    cashier: req?.userId,
    createdAt: new Date().toISOString(),
  });
  try {
    await newOrderModal.save().then((t) => {
      decreaseQuantity(newOrderModal);
      updateProductsStats(newOrderModal);
      return t
        .populate('cashier')
        .populate('salesman')
        .populate('orderItems.product')
        .populate('customer')
        .execPopulate();
    });

    res.status(201).json(newOrderModal);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const updateOrder = async (req, res) => {
  const { id } = req.params;
  const order = req.body;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No order with id: ${id}`);

  let bulkOptions = order.orderItems.map((item) => {
    let quantity;
    if (item.delete) {
      quantity = +item.quantity;
    } else if (!item?.previousQuantity) {
      quantity = -item.quantity;
    } else {
      quantity =
        item.quantity > item.previousQuantity
          ? -(item.quantity - item.previousQuantity)
          : +(item.previousQuantity - item.quantity);
    }

    return {
      updateOne: {
        filter: { _id: item.product },
        update: {
          $inc: {
            quantity: quantity,
          },
        },
      },
    };
  });

  const statsBulkOptions = order.orderItems.map((item) => {
    let quantity;
    let sold;
    let sales;
    if (item.delete) {
      quantity = +item.previousQuantity;
      sold = -item.previousQuantity;
      sales = -item.previousPaid;
    } else if (!item?.previousQuantity) {
      quantity = -item.quantity;
      sold = +item.quantity;
      sales = +item.paidPrice;
    } else {
      quantity =
        item.quantity > item.previousQuantity
          ? -(item.quantity - item.previousQuantity)
          : +(item.previousQuantity - item.quantity);
      sold =
        item.quantity > item.previousQuantity
          ? +(item.quantity - item.previousQuantity)
          : -(item.previousQuantity - item.quantity);

      sales =
        item.paidPrice > item.previousPaid
          ? +(item.paidPrice - item.previousPaid)
          : -(item.previousPaid - item.paidPrice);
    }

    return {
      updateOne: {
        filter: { product: item.product },
        update: {
          $inc: {
            available: Number(quantity),
            sold: Number(sold),
            sales: Number(sales),
          },
        },
      },
    };
  });

  const filteredItems = order.orderItems.filter((e) => !e.delete);

  const updatedOrder = { ...order, orderItems: filteredItems, _id: id };

  try {
    const update = await OrdersModal.findByIdAndUpdate(id, updatedOrder, { new: true })
      .populate('cashier')
      .populate('salesman')
      .populate('orderItems.product')
      .populate('customer');
    ProductsModal.bulkWrite(bulkOptions);
    ProductsStatsModal.bulkWrite(statsBulkOptions);
    res.json(update);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const getOnHoldOrders = async (req, res) => {
  const user = await UsersModal.findOne({ _id: req.userId });

  let onHoldOrders;

  if (user.role === 'superAdmin') {
    onHoldOrders = await OrdersModal.find({ status: 'onHold' })
      .populate('cashier')
      .populate('salesman')
      .populate('orderItems.product')
      .populate('customer')
      .sort({ createdAt: -1 });
  } else {
    onHoldOrders = await OrdersModal.find({ status: 'onHold', store: user.store })
      .populate('cashier')
      .populate('salesman')
      .populate('orderItems.product')
      .populate('customer')
      .sort({ createdAt: -1 });
  }

  res.status(200).json(onHoldOrders);
};

export const deleteOrder = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No order with id: ${id}`);

  await OrdersModal.findByIdAndRemove(id);

  res.json({ message: 'Order deleted successfully.' });
};

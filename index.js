import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import userRouter from './routes/user.js';
import productsRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import categoriesRoutes from './routes/categories.js';
import storeRoutes from './routes/store.js';
import customerRoutes from './routes/customer.js';
import productsStatsRoutes from './routes/productsStats.js';
import vendorsRoutes from './routes/vendors.js';
import expenseRoutes from './routes/expenses.js';
import cashflowRoutes from './routes/cashflow.js';
import statementRoutes from './routes/statement.js';
import digitalSalesRoutes from './routes/digitalSales.js';

const app = express();

app.use(express.json({ limit: '30mb', extended: true }));
app.use(cors());

app.use('/user', userRouter);
app.use('/products', productsRoutes);
app.use('/order', orderRoutes);
app.use('/categories', categoriesRoutes);
app.use('/store', storeRoutes);
app.use('/customers', customerRoutes);
app.use('/productsStats', productsStatsRoutes);
app.use('/vendors', vendorsRoutes);
app.use('/expenses', expenseRoutes);
app.use('/cashflow', cashflowRoutes);
app.use('/statement', statementRoutes);
app.use('/digitalSales', digitalSalesRoutes);

const CONNECTION_URL =
  'mongodb+srv://noraiz:developer123@cluster0.kruef.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
const PORT = process.env.PORT || 8000;

mongoose
  .connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => app.listen(PORT, () => console.log(`Server Running on Port: http://localhost:${PORT}`)))
  .catch((error) => console.log(`${error} did not connect`));

mongoose.set('useFindAndModify', false);

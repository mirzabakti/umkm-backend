// index.js
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const customerRoutes = require('./routes/customerRoutes');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');
const discountCategoryRoutes = require('./routes/discountCategoryRoutes');
const discountRoutes = require('./routes/discountRoutes');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/products', productRoutes);
app.use('/customers', customerRoutes);
app.use('/orders', orderRoutes);
app.use('/auth', authRoutes);
app.use('/discount-categories', discountCategoryRoutes);
app.use('/discounts', discountRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Tes koneksi database
app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Jalankan server
app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});

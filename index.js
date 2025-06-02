// index.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const pool = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const customerRoutes = require('./routes/customerRoutes');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');
const discountCategoryRoutes = require('./routes/discountCategoryRoutes');
const discountRoutes = require('./routes/discountRoutes');
const productReviewRoutes = require('./routes/productReviewRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
const paymentUploadsDir = path.join(uploadsDir, 'payments');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
    console.log(`Created directory: ${uploadsDir}`);
}

if (!fs.existsSync(paymentUploadsDir)) {
    fs.mkdirSync(paymentUploadsDir);
    console.log(`Created directory: ${paymentUploadsDir}`);
}

app.use('/products', productRoutes);
app.use('/customers', customerRoutes);
app.use('/orders', orderRoutes);
app.use('/auth', authRoutes);
app.use('/discount-categories', discountCategoryRoutes);
app.use('/discounts', discountRoutes);
app.use('/product-reviews', productReviewRoutes);
app.use('/wishlists', wishlistRoutes);
app.use('/deliveries', deliveryRoutes);
app.use('/api/payments', paymentRoutes);

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
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

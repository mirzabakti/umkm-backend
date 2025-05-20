// controllers/productController.js
const pool = require('../config/db');

// Menampilkan semua produk
exports.getAllProducts = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Menambah produk baru
exports.createProduct = async (req, res) => {
  try {
    const { product_name, price, stock, category_id } = req.body;
    const result = await pool.query(
      'INSERT INTO products (product_name, price, stock, category_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [product_name, price, stock, category_id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Mengupdate produk
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { product_name, price, stock, category_id } = req.body;
    const result = await pool.query(
      'UPDATE products SET product_name=$1, price=$2, stock=$3, category_id=$4 WHERE product_id=$5 RETURNING *',
      [product_name, price, stock, category_id, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Menghapus produk
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM products WHERE product_id = $1', [id]);
    res.send('Product deleted');
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Ambil produk berdasarkan ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM products WHERE product_id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

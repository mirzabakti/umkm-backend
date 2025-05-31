const pool = require('../config/db');

// Get all product reviews (optional: filter by product_id or customer_id)
const getAllProductReviews = async (req, res) => {
  const { product_id, customer_id } = req.query; // Get filter parameters from query
  let query = 'SELECT pr.*, p.product_name, c.customer_name FROM product_reviews pr JOIN products p ON pr.product_id = p.product_id JOIN customers c ON pr.customer_id = c.customer_id';
  const queryParams = [];
  const conditions = [];

  if (product_id) {
    conditions.push('pr.product_id = $1');
    queryParams.push(product_id);
  }

  if (customer_id) {
    conditions.push(`pr.customer_id = $${queryParams.length + 1}`);
    queryParams.push(customer_id);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  try {
    const result = await pool.query(query, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get product review by ID
const getProductReviewById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT pr.*, p.product_name, c.customer_name \n       FROM product_reviews pr\n       JOIN products p ON pr.product_id = p.product_id\n       JOIN customers c ON pr.customer_id = c.customer_id\n       WHERE pr.review_id = $1'
      , [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product review not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new product review
const createProductReview = async (req, res) => {
  const { product_id, customer_id, rating, comment } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO product_reviews (product_id, customer_id, rating, comment, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *'
      , [product_id, customer_id, rating, comment]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update product review (usually only comment and rating can be updated by the original author)
const updateProductReview = async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  try {
    const result = await pool.query(
      'UPDATE product_reviews SET rating = $1, comment = $2, updated_at = NOW() WHERE review_id = $3 RETURNING *'
      , [rating, comment, id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product review not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete product review (usually only by the original author or admin/owner)
const deleteProductReview = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM product_reviews WHERE review_id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product review not found' });
    }
    res.status(200).json({ message: 'Product review deleted successfully', deletedReview: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllProductReviews,
  getProductReviewById,
  createProductReview,
  updateProductReview,
  deleteProductReview,
}; 
const pool = require('../config/db');

// Get all discounts
const getAllDiscounts = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT d.*, p.product_name, dc.discount_category_name \n       FROM discounts d\n       LEFT JOIN products p ON d.product_id = p.product_id\n       LEFT JOIN discount_categories dc ON d.discount_category_id = dc.discount_category_id'
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get discount by ID
const getDiscountById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT d.*, p.product_name, dc.discount_category_name \n       FROM discounts d\n       LEFT JOIN products p ON d.product_id = p.product_id\n       LEFT JOIN discount_categories dc ON d.discount_category_id = dc.discount_category_id\n       WHERE d.discount_id = $1'
      , [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Discount not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new discount
const createDiscount = async (req, res) => {
  const { product_id, discount_category_id, discount_percentage, start_date, end_date } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO discounts (product_id, discount_category_id, discount_percentage, start_date, end_date) VALUES ($1, $2, $3, $4, $5) RETURNING *'
      , [product_id, discount_category_id, discount_percentage, start_date, end_date]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update discount
const updateDiscount = async (req, res) => {
  const { id } = req.params;
  const { product_id, discount_category_id, discount_percentage, start_date, end_date } = req.body;
  try {
    const result = await pool.query(
      'UPDATE discounts SET product_id = $1, discount_category_id = $2, discount_percentage = $3, start_date = $4, end_date = $5 WHERE discount_id = $6 RETURNING *'
      , [product_id, discount_category_id, discount_percentage, start_date, end_date, id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Discount not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete discount
const deleteDiscount = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM discounts WHERE discount_id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Discount not found' });
    }
    res.status(200).json({ message: 'Discount deleted successfully', deletedDiscount: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllDiscounts,
  getDiscountById,
  createDiscount,
  updateDiscount,
  deleteDiscount,
}; 
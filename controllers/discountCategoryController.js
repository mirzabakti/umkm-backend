const pool = require('../config/db');

// Get all discount categories
const getAllDiscountCategories = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM discount_categories');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get discount category by ID
const getDiscountCategoryById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM discount_categories WHERE discount_category_id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Discount category not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new discount category
const createDiscountCategory = async (req, res) => {
  const { discount_category_name } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO discount_categories (discount_category_name) VALUES ($1) RETURNING *'
      , [discount_category_name]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update discount category
const updateDiscountCategory = async (req, res) => {
  const { id } = req.params;
  const { discount_category_name } = req.body;
  try {
    const result = await pool.query(
      'UPDATE discount_categories SET discount_category_name = $1 WHERE discount_category_id = $2 RETURNING *'
      , [discount_category_name, id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Discount category not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete discount category
const deleteDiscountCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM discount_categories WHERE discount_category_id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Discount category not found' });
    }
    res.status(200).json({ message: 'Discount category deleted successfully', deletedCategory: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllDiscountCategories,
  getDiscountCategoryById,
  createDiscountCategory,
  updateDiscountCategory,
  deleteDiscountCategory,
}; 
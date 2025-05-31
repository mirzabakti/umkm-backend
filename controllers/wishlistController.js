const pool = require('../config/db');

// Get wishlist by customer ID
const getWishlistByCustomerId = async (req, res) => {
  const { customer_id } = req.params;
   // In a real app, customer_id for a logged-in customer should be derived from the authenticated user (req.user)
   // If req.user.role === 'customer', use req.user.customer_id instead of req.params.customer_id
   // For admin/owner, they might access other customer wishlists, so using req.params might be okay with proper authorization checks

  try {
    const result = await pool.query(
      'SELECT w.*, p.product_name, p.price \n       FROM wishlists w\n       JOIN products p ON w.product_id = p.product_id\n       WHERE w.customer_id = $1'
      , [customer_id]);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ message: 'Server error while fetching wishlist' });
  }
};

// Add product to wishlist
const addProductToWishlist = async (req, res) => {
  const { product_id, customer_id } = req.body; // Assuming customer_id is in body for now, will use req.user later
  // const customer_id = req.user.customer_id; // Derive from authenticated user

  try {
      // Optional: Check if the product is already in the wishlist to avoid duplicates
      // const exists = await isProductInWishlist(customer_id, product_id);
      // if (exists) {
      //     return res.status(409).json({ message: 'Product already in wishlist' });
      // }

    const result = await pool.query(
      'INSERT INTO wishlists (customer_id, product_id, created_at, updated_at) VALUES ($1, $2, NOW(), NOW()) RETURNING *'
      , [customer_id, product_id]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove product from wishlist
const removeProductFromWishlist = async (req, res) => {
  const { wishlist_id } = req.params; // Assuming wishlist_id is in route params
   // Or remove by product_id and customer_id:
   // const { product_id } = req.params; 
   // const customer_id = req.user.customer_id; // Derive from authenticated user

  try {
    const result = await pool.query('DELETE FROM wishlists WHERE wishlist_id = $1 RETURNING *'
    , [wishlist_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Wishlist item not found' });
    }

    res.status(200).json({ message: 'Product removed from wishlist', deletedItem: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to check if a product is in a customer's wishlist
// This might be useful internally or for a separate endpoint
const isProductInWishlist = async (customer_id, product_id) => {
    try {
        const result = await pool.query('SELECT 1 FROM wishlists WHERE customer_id = $1 AND product_id = $2', [customer_id, product_id]);
        return result.rows.length > 0;
    } catch (error) {
        console.error('Error checking wishlist status:', error);
        throw error; // Rethrow the error for handling in the calling function
    }
};


module.exports = {
  getWishlistByCustomerId,
  addProductToWishlist,
  removeProductFromWishlist,
  isProductInWishlist // Exporting the helper for potential use elsewhere
}; 
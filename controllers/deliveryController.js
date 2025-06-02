const pool = require('../config/db');

// Create a new delivery
const createDelivery = async (req, res) => {
  const { order_id, status, tracking_number, shipping_address, city, postal_code, country } = req.body;
  try {
    // Insert the new delivery record
    const result = await pool.query(
      'INSERT INTO deliveries (order_id, shipping_date, status, tracking_number, shipping_address, city, postal_code, country, created_at, updated_at) VALUES ($1, NOW(), $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING *'
      , [order_id, status, tracking_number, shipping_address, city, postal_code, country]);

    // Update the status of the corresponding order
    // Assuming status 'Diproses' when delivery is created
    await pool.query(
        'UPDATE orders SET status = $1, updated_at = NOW() WHERE order_id = $2',
        ['Diproses', order_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating delivery:', error);
    res.status(500).json({ message: 'Server error while creating delivery' });
  }
};

// Get all deliveries (likely for admin)
const getAllDeliveries = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM deliveries');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching all deliveries:', error);
    res.status(500).json({ message: 'Server error while fetching deliveries' });
  }
};

// Get a single delivery by ID
const getDeliveryById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM deliveries WHERE delivery_id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    // TODO: Add authorization check here to ensure customer only sees their own delivery
    // Example: Check if the order_id associated with this delivery belongs to the authenticated user's customer_id

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching delivery by ID:', error);
    res.status(500).json({ message: 'Server error while fetching delivery' });
  }
};

// Get delivery by Order ID
const getDeliveryByOrderId = async (req, res) => {
  const { orderId } = req.params;
  try {
    const result = await pool.query('SELECT * FROM deliveries WHERE order_id = $1', [orderId]);

    if (result.rows.length === 0) {
      // It's possible an order doesn't have delivery info yet, so 404 might be appropriate, or an empty array
      // Let's return 404 for now if no delivery record exists for that order
      return res.status(404).json({ message: 'Delivery information not found for this order' });
    }

    // TODO: Add authorization check here to ensure customer only sees delivery for their own order
    // Example: Check if the orderId belongs to an order placed by the authenticated user's customer_id

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching delivery by Order ID:', error);
    res.status(500).json({ message: 'Server error while fetching delivery by order ID' });
  }
};

// Update a delivery (e.g., status or tracking number)
const updateDelivery = async (req, res) => {
  const { id } = req.params;
  const { shipping_date, status, tracking_number, shipping_address, city, postal_code, country } = req.body;

  try {
    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (shipping_date !== undefined) {
        updates.push(`shipping_date = $${paramIndex++}`);
        values.push(shipping_date);
    }
    if (status !== undefined) {
        updates.push(`status = $${paramIndex++}`);
        values.push(status);
    }
    if (tracking_number !== undefined) {
        updates.push(`tracking_number = $${paramIndex++}`);
        values.push(tracking_number);
    }
    if (shipping_address !== undefined) {
        updates.push(`shipping_address = $${paramIndex++}`);
        values.push(shipping_address);
    }
    if (city !== undefined) {
        updates.push(`city = $${paramIndex++}`);
        values.push(city);
    }
    if (postal_code !== undefined) {
        updates.push(`postal_code = $${paramIndex++}`);
        values.push(postal_code);
    }
     if (country !== undefined) {
        updates.push(`country = $${paramIndex++}`);
        values.push(country);
    }

    // Also update 'updated_at'
    updates.push(`updated_at = NOW()`);

    if (updates.length === 0) {
         return res.status(400).json({ message: 'Tidak ada field yang diupdate' });
    }

    // Add delivery_id to values and WHERE condition
    values.push(id);
    const query = `UPDATE deliveries SET ${updates.join(', ')} WHERE delivery_id=$${paramIndex} RETURNING *`;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating delivery:', error);
    res.status(500).json({ message: 'Server error while updating delivery' });
  }
};

// Delete a delivery
const deleteDelivery = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM deliveries WHERE delivery_id = $1 RETURNING *'
    , [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    res.status(200).json({ message: 'Delivery deleted', deletedDelivery: result.rows[0] });
  } catch (error) {
    console.error('Error deleting delivery:', error);
    res.status(500).json({ message: 'Server error while deleting delivery' });
  }
};

module.exports = {
  createDelivery,
  getAllDeliveries,
  getDeliveryById,
  getDeliveryByOrderId,
  updateDelivery,
  deleteDelivery,
}; 
// controllers/customerController.js
const pool = require('../config/db');

// Ambil semua pelanggan
exports.getAllCustomers = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customers');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Tambah pelanggan baru
exports.createCustomer = async (req, res) => {
  try {
    const { customer_name, address, phone_number, email } = req.body;
    const result = await pool.query(
      'INSERT INTO customers (customer_name, address, phone_number, email) VALUES ($1, $2, $3, $4) RETURNING *',
      [customer_name, address, phone_number, email]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Update pelanggan
exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { customer_name, address, phone_number, email } = req.body;

    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (customer_name !== undefined) {
        updates.push(`customer_name = $${paramIndex++}`);
        values.push(customer_name);
    }
     if (address !== undefined) {
        updates.push(`address = $${paramIndex++}`);
        values.push(address);
    }
     if (phone_number !== undefined) {
        updates.push(`phone_number = $${paramIndex++}`);
        values.push(phone_number);
    }
    if (email !== undefined) {
        updates.push(`email = $${paramIndex++}`);
        values.push(email);
    }

    if (updates.length === 0) {
        return res.status(400).json({ message: 'Tidak ada field yang diupdate' });
    }

    values.push(id);
    const query = `UPDATE customers SET ${updates.join(', ')} WHERE customer_id=$${paramIndex} RETURNING *`;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating customer:', err.message);
    res.status(500).json({ message: 'Server Error during customer update' });
  }
};

// Hapus pelanggan
exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM customers WHERE customer_id=$1', [id]);
    res.send('Customer deleted');
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Ambil customer berdasarkan user_id
exports.getCustomerByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;
    const result = await pool.query('SELECT * FROM customers WHERE user_id = $1', [user_id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

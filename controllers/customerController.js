// controllers/customerController.js
const pool = require('../config/db');

// Ambil semua pelanggan
exports.getAllCustomers = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM Customers');
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
      'INSERT INTO Customers (customer_name, address, phone_number, email) VALUES ($1, $2, $3, $4) RETURNING *',
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
    const result = await pool.query(
      'UPDATE Customers SET customer_name=$1, address=$2, phone_number=$3, email=$4 WHERE customer_id=$5 RETURNING *',
      [customer_name, address, phone_number, email, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Hapus pelanggan
exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM Customers WHERE customer_id=$1', [id]);
    res.send('Customer deleted');
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

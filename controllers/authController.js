const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'umkm_secret_key'; // Untuk produksi, gunakan env variable

// Register (khusus customer)
exports.register = async (req, res) => {
  const client = await pool.connect();
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    // Cek email sudah terdaftar
    const userCheck = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    await client.query('BEGIN');
    // Simpan user dengan role 'customer'
    const userResult = await client.query(
      'INSERT INTO users (name, email, password, roles, aktif) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, email, hashedPassword, 'customer', 1]
    );
    const user = userResult.rows[0];
    // Simpan profil customer (alamat & phone_number bisa diupdate nanti)
    try {
      await client.query(
        'INSERT INTO customers (customer_name, email, address, phone_number, user_id) VALUES ($1, $2, $3, $4, $5)',
        [name, email, '', '', user.user_id]
      );
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Gagal insert ke tabel customers:', err.message);
      return res.status(500).json({ message: 'Register gagal pada tahap insert ke customers', error: err.message });
    }
    await client.query('COMMIT');
    res.status(201).json({ message: 'Register success', user });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Register error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    client.release();
  }
};

// Login (admin/customer)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }
    // Cari user, lakukan JOIN dengan tabel customers jika user adalah customer
    const userRes = await pool.query(
      'SELECT u.user_id, u.name, u.email, u.password, u.roles, c.customer_id \n       FROM users u\n       LEFT JOIN customers c ON u.user_id = c.user_id\n       WHERE u.email = $1'
      , [email]);

    if (userRes.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const user = userRes.rows[0];

    // Cek password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT dengan user_id dan role
    const token = jwt.sign({ user_id: user.user_id, role: user.roles }, JWT_SECRET, { expiresIn: '1d' });

    // Kirim data user beserta customer_id (jika ada)
    res.json({ token, user: { id: user.user_id, name: user.name, email: user.email, role: user.roles, customer_id: user.customer_id } });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
}; 
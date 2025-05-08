// config/db.js
const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres", // username PostgreSQL
  host: "localhost", // server lokal
  database: "umkm_db", // nama database
  password: "postgre123", // ganti dengan password PostgreSQL Bapak
  port: 5432, // port default PostgreSQL
});

module.exports = pool;

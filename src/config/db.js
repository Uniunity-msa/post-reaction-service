// db.js
// MySQL 연결 풀 생성
const mysql = require('mysql2');

// 추후 수정(테스트용)
const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'post-reaction-service-db',      
  user: process.env.DB_USER,             
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 3306
});

module.exports = { pool };
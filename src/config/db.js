// db.js
// MySQL 연결 풀 생성
const mysql = require('mysql2');

// 추후 수정(테스트용)
const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.POST_SERVICE_DB_HOST,
  user: process.env.POST_SERVICE_DB_USER,             
  password: process.env.POST_SERVICE_DB_PASSWORD,
  database: process.env.POST_SERVICE_DB_NAME,
  port: 3306
});

module.exports = { pool };
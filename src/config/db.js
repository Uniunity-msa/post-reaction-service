// db.js
// MySQL 연결 풀 생성
const mysql = require('mysql2');

// 추후 수정(테스트용)
const pool = mysql.createPool({
  connectionLimit: 10,
  host: '127.0.0.1',
  user: 'root',
  password: 'leejiwon0176', 
  database: 'post_reaction_service_db'
});

module.exports = { pool };
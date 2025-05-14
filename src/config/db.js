// db.js
// MySQL 연결 풀 생성
const mysql = require('mysql2');

// 추후 수정(테스트용)
const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'post-reaction-service-db',      // ✅ 컨테이너 이름 사용
  user: process.env.DB_USER,             // .env 또는 docker 환경변수에서 주입
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT   
});

module.exports = { pool };
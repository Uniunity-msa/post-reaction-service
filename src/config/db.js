
const mysql = require('mysql2');

// Connection Pool 설정
const pool = mysql.createPool({
  host: '127.0.0.1',         // MySQL 서버 주소
  port: 3306,                // MySQL 포트
  user: 'root',              // MySQL 사용자
  password: '2379',          // 비밀번호
  database: 'PostReactionDB',// 사용할 데이터베이스
  waitForConnections: true,  // 커넥션이 없을 때 대기 여부
  connectionLimit: 10,       // 최대 커넥션 수
  queueLimit: 0              // 대기열 제한 없음
});

// 연결 테스트 (optional)
pool.getConnection((err, connection) => {
  if (err) {
    console.error('PostReactionDB 풀 연결 실패:', err.message);
  } else {
    console.log('PostReactionDB 풀 연결 성공!');
    connection.release(); // 테스트 후 커넥션 반환
  }
});

module.exports = pool;
const mysql = require('mysql2');

// PostReactionDB 연결 설정
const connection = mysql.createConnection({
    host: '127.0.0.1',  // MySQL 서버 주소
  port: 3306,         // MySQL 포트 (기본 3306)
  user: 'root',       // MySQL 사용자
  database: 'PostReactionDB',  // 연결할 데이터베이스 이름 (PostReactionDB)
  password: '2379'
  });
  
  connection.connect((err) => {
    if (err) {
      console.error('PostReactionDB 연결 실패: ' + err.stack);
      return;
    }
    console.log('PostReactionDB 연결 성공!');
  });

  // 연결 객체 반환
module.exports = connection;
  
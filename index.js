const express = require("express");
const cors = require("cors");
const path = require("path");
const postRouter = require("./src/routes/postReactionRoutes");
const PostReaction = require("./src/models/post-reactionModel");
const postReaction = new PostReaction();

const app = express();
const PORT = 3002;

const mysql = require('mysql2/promise');
const amqp = require('amqplib');

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Readiness Probe용 엔드포인트: DB & RabbitMQ 연결 검사
app.get('/ready', async (req, res) => {
  try {
    // MySQL 연결 검사
    const dbConn = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      connectTimeout: 2000  // 연결 타임아웃 2초
    });

    // 간단한 쿼리로 DB ping 대체 (SELECT 1)
    await dbConn.execute('SELECT 1');
    await dbConn.end();

    // 2) RabbitMQ 연결 검사
    // 아래 URL 형식: amqp://user:password@host:port
    const rabbitUrl = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`;
    const rabbitConn = await amqp.connect(rabbitUrl, { timeout: 2000 }); 
    // 채널을 열었다가 바로 닫으면 연결 상태 확인 가능
    const channel = await rabbitConn.createChannel();
    await channel.close();
    await rabbitConn.close();

    // 둘 다 성공하면 READY
    res.status(200).json({ status: 'READY' });
  } catch (err) {
    console.error('Readiness check failed:', err.message);
    res.status(500).json({ status: 'NOT_READY', error: err.message });
  }
});

app.use(cors());

// RabbitMQ 연결 및 메시지 소비
(async () => {
  try {
      await postReaction.connectToRabbitMQ();
      postReaction.consumeMessages();
      console.log('✅ RabbitMQ 연결 완료');
  } catch (err) {
      console.error("RabbitMQ 연결 실패:", err);
      process.exit(1);
  }
})();

// 정적 파일 제공 (예: CSS, JS, 이미지 등)
app.use(express.static(path.join(__dirname, 'src', 'public'))); // 필요시 public 폴더 사용
app.use("/reaction/mypage/css",express.static(path.join(__dirname, 'src', 'public', 'css'))); 
app.use("/reaction/mypage/js",express.static(path.join(__dirname, 'src', 'public', 'js'))); 
// /mypage 경로에서 정적 HTML 제공
app.get("/reaction/mypage", (req, res) => {
  res.sendFile(path.join(__dirname, "src/views/home/mypage.html"));
});
// /contact 경로에서 정적 HTML 제공
app.get("/reaction/mypage/contact", (req, res) => {
  res.sendFile(path.join(__dirname, "src/views/home/contact.html"));
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 라우터 연결
app.use("/reaction", postRouter);


// 서버 시작
app.listen(PORT, () => {
  console.log(`✅ server running`);
});
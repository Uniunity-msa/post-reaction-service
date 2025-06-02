const express = require("express");
const cors = require("cors");
const path = require("path");
const postRouter = require("./src/routes/postReactionRoutes");
const PostReaction = require("./src/models/post-reactionModel");
const postReaction = new PostReaction();

const app = express();
const PORT = 3002;

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
app.use("/mypage/css",express.static(path.join(__dirname, 'src', 'public', 'css'))); 
app.use("/mypage/js",express.static(path.join(__dirname, 'src', 'public', 'js'))); 
// /mypage 경로에서 정적 HTML 제공
app.get("/mypage", (req, res) => {
  res.sendFile(path.join(__dirname, "src/views/home/mypage.html"));
});
// /contact 경로에서 정적 HTML 제공
app.get("/mypage/contact", (req, res) => {
  res.sendFile(path.join(__dirname, "src/views/home/contact.html"));
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 라우터 연결
app.use("/", postRouter);


// 서버 시작
app.listen(PORT, () => {
  console.log(`✅ server running`);
});
const express = require("express");
const path = require("path");
const postRouter = require("./src/routes/postReactionRoutes");
const postReaction = require("./src/models/post-reactionModel");


const app = express();
const PORT = 3002;

// RabbitMQ 연결 및 메시지 소비
(async () => {
  try {
      await postReaction.connectToRabbitMQ();
      postReaction.consumeMessages();
      console.log('✅ RabbitMQ 연결 및 메시지 소비 준비 완료');
  } catch (err) {
      console.error("RabbitMQ 연결 실패:", err);
      process.exit(1);
  }
})();



    // EJS 설정
    app.engine("html", require("ejs").renderFile);
    app.set("views", path.join(__dirname, "src/views"));  // 뷰 폴더 설정
    app.set("view engine", "ejs");                        // EJS 사용

    // 정적 리소스 제공 (CSS, JS 등)
    app.use(express.static(path.join(__dirname, "src/public")));

    // 라우터 연결
    app.use("/", postRouter);

    // 서버 시작
    app.listen(PORT, () => {
      console.log(`✅ server running: http://localhost:${PORT}`);
    });
 
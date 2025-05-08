const express = require("express");
const path = require("path");
const postRouter = require("./src/routes/postReactionRoutes");

const app = express();
const PORT = 3002;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 라우터 연결
app.use("/", postRouter);


// 서버 시작
app.listen(PORT, () => {
  console.log(`✅ server running: http://localhost:${PORT}`);
});
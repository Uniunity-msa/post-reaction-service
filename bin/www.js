"use strict";

const app = require("../main"); // main.js 또는 main/index.js에 따라 경로 확인 필요
const http = require("http");

// Constants
const PORT = process.env.PORT || 3000; // 보통 3000번으로 설정. 80은 sudo 필요

// 임시 라우터는 main에서 정의하는 게 더 일반적
// 여기서 라우터 정의보다는 서버만 띄우는 게 좋음

const server = http.createServer(app);

server.listen(PORT, () => {
    console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
});

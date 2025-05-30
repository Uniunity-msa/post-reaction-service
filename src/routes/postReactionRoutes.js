"use strict"

const express =require("express");
const router = express.Router();
const postReactionController = require("../controllers/postReactionController");


// 좋아요
router.post("/addHeart",postReactionController.addHeart); // 하트 목록 추가하기
router.get("/deleteHeart/:heart_id",postReactionController.deleteHeart); // 하트 목록 지우기

// 마이페이지 -> 스크랩
router.post("/addScrap",postReactionController.addScrap); // 스크랩 목록 추가하기
router.get("/deleteScrap/:scrap_id",postReactionController.deleteScrap); // 스크랩 목록 지우기

// 마이페이지
router.post("/checkHeart",postReactionController.checkHeart); // 특정 user_email 과 post_id에 해당하는 heart_id 확인
router.post("/checkScrap",postReactionController.checkScrap); // 특정 user_email 과 post_id에 해당하는 scrap_id 확인


// 게시글 하트 개수 반환
router.get("/postHeartNum/:post_id",postReactionController.postHeartNum);

//댓글
router.get("/showComment/postviewer/:post_id",postReactionController.showCommentListbyPostID);//댓글 목록 보이기
router.post("/uploadComment/postviewer",postReactionController.uploadComment); //댓글 작성하기

//댓글 삭제하기
router.delete('/doDeleteComment/:user_email/:comment_id', postReactionController.deleteComment); 

//댓글 개수 받아오기
router.get("/postCommentNum/:post_id",postReactionController.postCommentNum);
router.get("/getCommentWriter/:comment_id",postReactionController.commentWriter);


//마이페이지 페이지
router.get("/mypage",postReactionController.mypage);
//마이페이지 내 contact 페이지
router.get("/contact",postReactionController.contact);


module.exports=router;




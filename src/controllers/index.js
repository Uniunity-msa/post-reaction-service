"use strict"

const express =require("express");
const router = express.Router();
const cors = require('cors');
const ctrl = require("./home.ctrl");

//
router.post("/mypage/community/post/:category",ctrl.post.myCommunityPost);
//게시글 조회수 증가
router.get('/increaseViewCount/:post_id', ctrl.post.IncreaseViewCount);
//하트 목록 추가하기
router.post("/addHeart",ctrl.post.addHeart); 
//특정 user_email 과 post_id에 해당하는 heart_id 확인
router.post("/checkHeart",ctrl.post.checkHeart); 
//하트 목록 지우기
router.get("/deleteHeart/:heart_id",ctrl.post.deleteHeart);
//게시글 하트 개수 반환
router.get("/postHeartNum/:post_id",ctrl.post.postHeartNum);
//스크랩 목록 추가하기
router.post("/addScrap",ctrl.post.addScrap); 
//특정 user_email 과 post_id에 해당하는 scrap_id 확인
router.post("/checkScrap",ctrl.post.checkScrap); 
//스크랩 목록 지우기
router.get("/deleteScrap/:scrap_id",ctrl.post.deleteScrap); 
//댓글 목록 보이기
router.get("/showComment/postviewer/:post_id",ctrl.comment.showCommentListbyPostID);
//댓글 작성하기
router.post("/uploadComment/postviewer",ctrl.comment.uploadComment);
//댓글 삭제하기
router.delete('/doDeleteComment/:post_id/:user_email/:comment_id', ctrl.comment.deleteComment); 
//댓글 개수 받아오기
router.get("/postCommentNum/:post_id",ctrl.comment.postCommentNum);
//댓글 작성자 받아오기
router.get("/getCommentWriter/:comment_id",ctrl.comment.commentWriter);

module.exports=router;
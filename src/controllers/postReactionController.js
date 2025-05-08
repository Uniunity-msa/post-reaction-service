"use strict";

const PostReaction = require("../models/post-reactionModel");

const postReactionController = {


    // 마이페이지) 하트 기능
    addHeart: async (req, res) => {
        try {
            const postReaction = new PostReaction();
            const response = await postReaction.addHeart(req.body);  // PostReaction 모델의 addHeart 메서드 호출
            return res.json(response);
        } catch (error) {
            console.error('하트 추가 실패:', error);
            return res.status(500).json({ error: '하트 추가에 실패했습니다.' });
        }
    },

    checkHeart: async (req, res) => {
        try {
            const response = await PostReaction.checkHeart(req.body);  // PostReaction 모델의 checkHeart 메서드 호출
            return res.json(response);
        } catch (error) {
            console.error('하트 확인 실패:', error);
            return res.status(500).json({ error: '하트 확인에 실패했습니다.' });
        }
    },

    deleteHeart: async (req, res) => {
        try {
            const response = await PostReaction.deleteHeart(req.params.heart_id);  // PostReaction 모델의 deleteHeart 메서드 호출
            return res.json(response);
        } catch (error) {
            console.error('하트 삭제 실패:', error);
            return res.status(500).json({ error: '하트 삭제에 실패했습니다.' });
        }
    },

    // 마이페이지) 스크랩 기능
    addScrap: async (req, res) => {
        try {
            const response = await PostReaction.addScrap(req.body);  // PostReaction 모델의 addScrap 메서드 호출
            return res.json(response);
        } catch (error) {
            console.error('스크랩 추가 실패:', error);
            return res.status(500).json({ error: '스크랩 추가에 실패했습니다.' });
        }
    },

    checkScrap: async (req, res) => {
        try {
            const response = await PostReaction.checkScrap(req.body);  // PostReaction 모델의 checkScrap 메서드 호출
            return res.json(response);
        } catch (error) {
            console.error('스크랩 확인 실패:', error);
            return res.status(500).json({ error: '스크랩 확인에 실패했습니다.' });
        }
    },

    deleteScrap: async (req, res) => {
        try {
            const response = await PostReaction.deleteScrap(req.params.scrap_id);  // PostReaction 모델의 deleteScrap 메서드 호출
            return res.json(response);
        } catch (error) {
            console.error('스크랩 삭제 실패:', error);
            return res.status(500).json({ error: '스크랩 삭제에 실패했습니다.' });
        }
    },

    // 게시글 하트 개수 확인
    postHeartNum: async (req, res) => {
        try {
            const response = await PostReaction.postHeartNum(req.params.post_id);  // PostReaction 모델의 postHeartNum 메서드 호출
            return res.json(response);
        } catch (error) {
            console.error('하트 개수 확인 실패:', error);
            return res.status(500).json({ error: '하트 개수 확인에 실패했습니다.' });
        }
    },

    // 게시글 스크랩 개수 확인
    postScrapNum: async (req, res) => {
        try {
            const response = await PostReaction.postScrapNum(req.params.post_id);  // PostReaction 모델의 postScrapNum 메서드 호출
            return res.json(response);
        } catch (error) {
            console.error('스크랩 개수 확인 실패:', error);
            return res.status(500).json({ error: '스크랩 개수 확인에 실패했습니다.' });
        }
    },

    // 댓글 작성하기
    uploadComment: async (req, res) => {
        try {
            const response = await PostReaction.uploadComment(req.body);  // 댓글 생성하는 메서드
            return res.json(response);
        } catch (error) {
            console.error('댓글 작성 실패:', error);
            return res.status(500).json({ error: '댓글 작성에 실패했습니다.' });
        }
    },

    // 게시글 ID로 댓글 목록 조회
    showCommentListbyPostID: async (req, res) => {
        try {
            const response = await PostReaction.showCommentListbyPostID(req.params.post_id);  // 댓글 목록 조회
            return res.json(response);
        } catch (error) {
            console.error('댓글 목록 조회 실패:', error);
            return res.status(500).json({ error: '댓글 목록 조회에 실패했습니다.' });
        }
    },

    // 댓글 삭제하기
    deleteComment: async (req, res) => {
        try {
            const response = await PostReaction.deleteComment(req.params.user_email, req.params.comment_id, req.params.post_id);  // 댓글 삭제 메서드
            return res.json(response);
        } catch (error) {
            console.error('댓글 삭제 실패:', error);
            return res.status(500).json({ error: '댓글 삭제에 실패했습니다.' });
        }
    },

    // 게시글 댓글 개수 확인
    postCommentNum: async (req, res) => {
        try {
            const response = await PostReaction.postCommentNum(req.params.post_id);  // 댓글 개수 확인 메서드 호출
            return res.json(response);
        } catch (error) {
            console.error('댓글 개수 확인 실패:', error);
            return res.status(500).json({ error: '댓글 개수 확인에 실패했습니다.' });
        }
    },

    // 댓글 작성자 반환
    commentWriter: async (req, res) => {
        try {
            const response = await PostReaction.commentWriter(req.params.comment_id);  // 댓글 작성자 정보 조회
            return res.json(response);
        } catch (error) {
            console.error('댓글 작성자 정보 조회 실패:', error);
            return res.status(500).json({ error: '댓글 작성자 정보 조회에 실패했습니다.' });
        }
    }
}

module.exports = postReactionController;
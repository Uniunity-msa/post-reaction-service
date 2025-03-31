"use strict"

const Comment = require('../models/Comment');
const Post = require("../models/Post");

const post = {
    //마이페이지) 
    myCommunityPost: async (req, res) => {
        const category = req.params.category;
        if (category === '1') { //내 게시글 목록
            const post = new Post(req.body);
            const response = await post.myCommunityPost();
            return res.json(response);
        }
        else if (category === '2') {//댓글 목록
            const post = new Post(req.body);
            const response = await post.myCommunityCommentPost();
            return res.json(response);
        } else if (category == '3') { //내 하트 게시글 목록
            const post = new Post(req.body);
            const response = await post.getUserHeartList();
            return res.json(response);
        } else if (category == '4') { //스크랩 목록
            const post = new Post(req.body);
            const response = await post.getUserScrapList();
            return res.json(response);
        }
    },
    IncreaseViewCount: async (req, res) => {
        let post_id = req.params.post_id;


        try {
            const post = new Post();
            const response = await post.showIncreaseViewCount(post_id);
            return res.json(response);
        } catch (err) {
            console.error('조회수 증가 실패:', err);
            return res.status(500).json({ error: '조회수 증가에 실패하였습니다.' });
        }
    },
    // 마이페이지) 하트 기능
    addHeart: async (req, res) => {
        const post = new Post();
        const response = await post.addHeart(req.body);
        return res.json(response);
    },
    checkHeart: async (req, res) => {
        const post = new Post();
        const response = await post.checkHeart(req.body);
        return res.json(response);
    },
    deleteHeart: async (req, res) => {
        const post = new Post();
        const response = await post.deleteHeart(req.params.heart_id);
        return res.json(response);
    },
    // 게시글 하트 개수 확인
    postHeartNum: async (req, res) => {
        const post = new Post();
        const response = await post.postHeartNum(req.params.post_id);
        return res.json(response);
    },
    // 마이페이지) 스크랩 기능
    addScrap: async (req, res) => {
        const post = new Post();
        const response = await post.addScrap(req.body);
        return res.json(response);
    },
    checkScrap: async (req, res) => {
        const post = new Post();
        const response = await post.checkScrap(req.body);
        return res.json(response);
    },
    deleteScrap: async (req, res) => {
        const post = new Post();
        const response = await post.deleteScrap(req.params.scrap_id);
        return res.json(response);
    },
    // 게시글 스크랩 개수 확인
    postScrapNum: async (req, res) => {
        const post = new Post();
        const response = await post.postScrapNum(req.params.post_id);
        return res.json(response);
    },
}
const comment = {
    //댓글 작성하기
    uploadComment: async (req, res) => {
        const comment = new Comment(req.body);
        const response = await comment.createComment();
        return res.json(response);
    },
    //
    showComment: async (req, res) => {
        let post_id = req.params.comment_id;
        const comment = new Comment();
        const response = await comment.showComment(post_id);
        return res.json(response);
    },
    showCommentListbyPostID: async (req, res) => {
        let post_id = req.params.post_id;
        // let comment_id = req.params.comment_id;
        const comment = new Comment();
        const response = await comment.showCommentListbyPostID(post_id);
        return res.json(response);
    },
    showCommentListAll: async (req, res) => {
        let comment_id = req.params.comment_id;
        const comment = new Comment();
        const response = await comment.showCommentListAll(comment_id); //post_id
        return res.json(response);
    },
    //댓글 삭제하기
    deleteComment: async (req, res) => {
        let user_email = req.params.user_email;
        let comment_id = req.params.comment_id;
        let post_id =req.params.post_id;

        try {
            const comment = new Comment();
            const response = await comment.doDeleteComment(user_email,comment_id,post_id);
            return res.json(response);
        } catch (err) {
            console.error('댓글 삭제 실패:', err);
            return res.status(500).json({ error: '댓글 삭제에 실패하였습니다.' });
        }
    },
    postCommentNum: async (req, res) => {
        let post_id = req.params.post_id;
        try {
            const comment = new Comment();
            const response = await comment.postCommentNum(post_id);
            return res.json(response);
        } catch (err) {
            console.error('댓글 개수 받아오기 실패:', err);
            return res.status(500).json({ error: '댓글 개수 반영에 실패하였습니다.' });
        }
    },
    commentWriter: async (req, res) => {
        const comment = new Comment();
        const response = await comment.commentWriter(req.params.comment_id);
        return res.json(response);
    }
}

module.exports = {post, comment};
"use strict";

const PostReactionStorage = require("../models/post-reactionStorage");

class PostReaction {
    constructor(body) {
        this.body = body;
    }

    // 하트 기능 
    // 마이페이지) 하트 저장
    async addHeart(heartInfo) {
        try {
            const response = await PostReactionStorage.addHeart(heartInfo);
            return response;
        } catch (err) {
            return {
                result: false,
                status: 500,
                msg: err.message || String(err) 
            };
        }
    }

    // 마이페이지) 하트 삭제
    async deleteHeart(heart_id) {
        try {
            const response = await PostReactionStorage.deleteHeart(heart_id);
            return response;
        } catch (err) {
            return {
                result: false,
                status: 500,
                msg: err
            };
        }
    }
    // 마이페이지) 특정 user_email 과 post_id에 해당하는 heart_id가 존재하는지 확인
    async checkHeart(heartInfo) {
        try {
            const response = await PostReactionStorage.checkHeart(heartInfo);
            return response;
        } catch (err) {
            return {
                result: false,
                status: 500,
                msg: err
            };
        }
    }
    // 스크랩 기능 //
    // 마이페이지) 스크랩 저장
    async addScrap(scrapInfo) {
        try {
            const response = await PostReactionStorage.addScrap(scrapInfo);
            return response;
        } catch (err) {
            return {
                result: false,
                status: 500,
                msg: err
            };
        }
    }
    // 마이페이지) 스크랩 삭제
    async deleteScrap(scrap_id) {
        try {
            const response = await PostReactionStorage.deleteScrap(scrap_id);
            return response;
        } catch (err) {
            return {
                result: false,
                status: 500,
                msg: err
            };
        }
    }
    // 마이페이지) 특정 user_email 과 post_id에 해당하는 scrap_id가 존재하는지 확인
    async checkScrap(scrapInfo) {
        try {
            const response = await PostReactionStorage.checkScrap(scrapInfo);
            return response;
        } catch (err) {
            return {
                result: false,
                status: 500,
                msg: err
            };
        }
    }
    //댓글 작성하기
    async createComment() {
        const client = this.body;
        try {
            const response1 = await PostReactionStorage.saveComment(client);
            const response2 = await PostReactionStorage.updatePostCommentCount(client.post_id);
            if(response1.result==true && response2.result==true){
                return response1;
            }
        } catch (err) {
            return { result:false, err }
        }
    }
    //댓글 삭제하기
    async doDeleteComment(user_email,comment_id,post_id) {
        try {
            const response1 = await PostReactionStorage.goDeleteComment(user_email,comment_id);
            const response2 = await PostReactionStorage.reducePostCommentCount(post_id);
            if(response1.result==true && response2.result==true){
                return response1;
            }
        } catch (err) {
            return { err };
        }
    }
    //마이페이지) 내가 댓글 단 게시글 불러오기
    async myCommunityCommentPost() {
        try {
            const client = this.body;
            const response = await PostReactionStorage.getMyCommentPost(client);
            return response;
        } catch (err) {
            return {
                result: false,
                status: 500,
                msg: err
            };
        }
    }
    // 마이페이지) 내가 좋아한 게시글 불러오기
    async getUserHeartList() {
        try {
            const client = this.body;
            const response = await PostReactionStorage.getUserHeartList(client);
            return response;
        } catch (err) {
            return {
                result: false,
                status: 500,
                msg: err
            };
        }
    }
    // 마이페이지) 내가 스크랩한 게시글 불러오기
    async getUserScrapList() {
        try {
            const client = this.body;
            const response = await PostReactionStorage.getUserScrapList(client);
            return response;
        } catch (err) {
            return {
                result: false,
                status: 500,
                msg: err
            };
        }
    }
    //조회수 증가
    async showIncreaseViewCount(post_id) {
        try {
            const response = await PostReactionStorage.getIncreaseViewCount(post_id);
            return response;
        } catch (err) {
            return{err};
        }
    }
    //해당 게시글 스크랩 개수 반환
    async postScrapNum(post_id){
        try{
            const response = await PostReactionStorage.postScrapNum(post_id);
            return response;
        } catch (err) {
            return {
                result: false,
                status: 500,
                msg: err
            };
        }
    }
    //comment_id로 댓글 불러오기
    async showComment(comment_id) {
        try {
            const response = await CommentStorage.getComment(comment_id);
            return response;
        } catch (err) {
            return { err }
        }
    }
    //post_id별로 댓글들 불러오기
    async showCommentListbyPostID(post_id) {
        try {
            const response = await PostReactionStorage.getCommentListbyPostID(post_id);
            return response;
        } catch (err) {
            return { success: false, msg: err };
        }
    }
    //최신순 댓글리스트 불러오기
    async showCommentListAll(comment_id) {//post_id
        try {
            // let post_id=await PostReactionStorage.getPost(post_id);
            const response = await PostReactionStorage.getCommentListAll(post_id, comment_id);
            return response;
        } catch (err) {
            return { success: false, msg: err };
        }
    }

    //댓글 개수 반환
    async postCommentpNum(post_id) {
        try {
            const response = await PostReactionStorage.postCommentNum(post_id);
            return response;
        } catch (err) {
            return {
                result: false,
                status: 500,
                msg: err
            };
        }
    }
}

module.exports = PostReaction;
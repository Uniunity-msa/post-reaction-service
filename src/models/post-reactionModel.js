"use strict";
const amqp = require('amqplib');
const PostReactionStorage = require("../models/post-reactionStorage");

class PostReaction {
    constructor(body) {
        this.body = body;
    }

    async connectToRabbitMQ(retryCount = 5) {
        const retryDelay = 3000; // 3초
    
        for (let i = 0; i < retryCount; i++) {
            try {
                console.log(`🔌 RabbitMQ 연결 시도 (${i + 1}/${retryCount})...`);
                const connection = await amqp.connect('amqp://guest:guest@rabbit:5672');
                const channel = await connection.createChannel();
    
                await channel.assertQueue('CommentRequestQueue', { durable: true });
                await channel.assertQueue('HeartRequestQueue', { durable: true });
                await channel.assertQueue('ScrapRequestQueue', { durable: true });
    
                this.channel = channel;
                console.log("✅ RabbitMQ 연결 성공");
                return;
            } catch (err) {
                console.error(`❌ RabbitMQ 연결 실패 (${i + 1}회):`, err.message);
    
                if (i < retryCount - 1) {
                    console.log(`⏳ ${retryDelay / 1000}초 후 재시도...`);
                    await new Promise(res => setTimeout(res, retryDelay));
                } else {
                    console.error("💥 RabbitMQ 연결 재시도 모두 실패. 예외 발생!");
                    throw err;
                }
            }
        }
    }
    

    // 큐에서 메시지 소비
    consumeMessages() {

        // 댓글큐
        this.channel.consume('CommentRequestQueue', async (msg) => {
            try {
                //테스트용
                console.log('[post-reaction-service] CommentRequestQueue 메시지 수신:', msg.content.toString());
                const email = JSON.parse(msg.content.toString());
                const result = await this.getCommentPostIdsByEmail(email);
                this.channel.sendToQueue(
                    msg.properties.replyTo,
                    Buffer.from(JSON.stringify(result)),
                    { correlationId: msg.properties.correlationId }
                );
                this.channel.ack(msg);
                //테스트용
                console.log('[post-reaction-service] CommentRequestQueue 메시지 ACK 및 응답 전송 완료');
            } catch (err) {
                console.error('메시지 처리 중 에러:', err);
                this.channel.nack(msg, false, true);  // 처리 실패 시 재시도
            }
        });

        // 좋아요큐
        this.channel.consume('HeartRequestQueue', async (msg) => {
            try {
                //테스트용
                console.log('[post-reaction-service] HeartRequestQueue 메시지 수신:', msg.content.toString());
                const email = JSON.parse(msg.content.toString());
                const result = await this.getHeartPostIdsByEmail(email);
                this.channel.sendToQueue(
                    msg.properties.replyTo,
                    Buffer.from(JSON.stringify(result)),
                    { correlationId: msg.properties.correlationId }
                );
                this.channel.ack(msg);
                //테스트용
                console.log('[post-reaction-service] HeartRequestQueue 메시지 ACK 및 응답 전송 완료');
            } catch (err) {
                console.error('메시지 처리 중 에러:', err);
                this.channel.nack(msg, false, true);
            }
        });

        // 스크랩큐
        this.channel.consume('ScrapRequestQueue', async (msg) => {
            try {
                //테스트용
                console.log('[post-reaction-service] ScrapRequestQueue 메시지 수신:', msg.content.toString());
                const email = JSON.parse(msg.content.toString());
                const result = await this.getScrapPostIdsByEmail(email);
                this.channel.sendToQueue(
                    msg.properties.replyTo,
                    Buffer.from(JSON.stringify(result)),
                    { correlationId: msg.properties.correlationId }
                );
                this.channel.ack(msg);
                //테스트용
                console.log('[post-reaction-service] ScrapRequestQueue 메시지 ACK 및 응답 전송 완료');
            } catch (err) {
                console.error('메시지 처리 중 에러:', err);
                this.channel.nack(msg, false, true);
            }
        });

    }

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
    // 스크랩 기능 
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

      // 이메일로 post_id를 조회하는 함수
      async getCommentPostIdsByEmail(email) {
        try {
            // comment 테이블에서 이메일에 해당하는 post_id 추출
            const commentPosts = await PostReactionStorage.getPostIdsByEmailFromComment(email);
            const postIds = commentPosts.map(row => row.post_id);
            return postIds;
        } catch (err) {
            console.error('DB에서 comment post_id 조회 실패:', err);
            throw new Error('DB 조회 실패');
        }
    }

     // 이메일로 post_id를 조회하는 함수
     async getScrapPostIdsByEmail(email) {
        try {
            // scrap 테이블에서 이메일에 해당하는 post_id 추출
            const scrapPosts = await PostReactionStorage.getPostIdsByEmailFromScrap(email);
            const postIds = scrapPosts.map(row => row.post_id);

            return postIds;
        } catch (err) {
            console.error('DB에서 scrap post_id 조회 실패:', err);
            throw new Error('DB 조회 실패');
        }
    }

     // 이메일로 post_id를 조회하는 함수
     async getHeartPostIdsByEmail(email) {
        try {
           // heart 테이블에서 이메일에 해당하는 post_id 추출
            const heartPosts = await PostReactionStorage.getPostIdsByEmailFromHeart(email);
            const postIds = heartPosts.map(row => row.post_id);

            return postIds;
        } catch (err) {
            console.error('DB에서 heart post_id 조회 실패:', err);
            throw new Error('DB 조회 실패');
        }
    }
}

module.exports = PostReaction;
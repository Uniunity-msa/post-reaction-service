"use strict"
const { pool } = require("../config/db");
const axios = require('axios');
const amqp = require('amqplib');
const baseUrls = require("../public/js/apiUrl");


class PostReactionStorage {

    static saveComment(commentInfo) {
        return new Promise((resolve, reject) => {
            function getCurrentDateTime() {
                const now = new Date();
                const offset = 9 * 60;
                const localTime = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
                const seoulTime = new Date(localTime + offset * 60 * 1000);
                const year = seoulTime.getFullYear();
                const month = String(seoulTime.getMonth() + 1).padStart(2, '0');
                const day = String(seoulTime.getDate()).padStart(2, '0');
                const hours = String(seoulTime.getHours()).padStart(2, '0');
                const minutes = String(seoulTime.getMinutes()).padStart(2, '0');
                const seconds = String(seoulTime.getSeconds()).padStart(2, '0');
                return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
            }
    
            const formattedDateTime = getCurrentDateTime();
            const insertQuery = 'INSERT INTO Comment(user_email, post_id, comment_content, comment_date, like_count_comment) VALUES (?, ?, ?, ?, ?)';
    
            pool.query(
                insertQuery,
                [commentInfo.user_email, commentInfo.post_id, commentInfo.comment_content, formattedDateTime, 0],
                async (err) => {
                    if (err) {
                        return reject({ result: false, status: 500, err: `${err}` });
                    }
    
                    try {
                        await PostReactionStorage.commentNumControl({ post_id: commentInfo.post_id, isIncrease: true });
                        return resolve({ result: true, status: 201 });
                    } catch (e) {
                        return resolve({ result: true, status: 207, warning: '댓글 수 반영 실패' });
                    }
                }
            );
        });
    }
      

    static getComment(comment_id) {
        return new Promise((resolve, reject) => {
            pool.query("SELECT * FROM Comment WHERE comment_id = ?;", [comment_id], (err, rows) => {
                if (err) {
                    console.error('Query 함수 오류', err);
                    return reject(err);
                }
                resolve(rows[0]);
            });
        });
    }
    
    static getCommentListbyPostID(post_id) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    comment_content,
                    like_count_comment,
                    post_id,
                    comment_date,
                    comment_id,
                    user_email
                FROM Comment 
                WHERE post_id = ? 
                ORDER BY comment_date DESC;
            `;
    
            pool.query(query, [post_id], (err, rows) => {
                if (err) {
                    console.error('Query 함수 오류', err);
                    return reject(err);
                }
                resolve(rows);
            });
        });
    }
ㄴ    
static getCommentListAll(comment_id) {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM Comment WHERE comment_id = ?;"; // post_id

        pool.query(query, [comment_id], (err, data) => {
            if (err) {
                return reject(err);
            }
            resolve(data);
        });
    });
}

    static async goDeleteComment(user_email, comment_id) {
    return new Promise((resolve, reject) => {

        pool.getConnection(async (err, connection) => {
            if (err) {
                console.error('❌ MySQL 연결 오류: ', err);
                return reject(err);
            }

            try {
                // 1. 댓글 ID로 post_id 조회
                const getPostIdQuery = 'SELECT post_id FROM Comment WHERE comment_id = ? AND user_email = ?';
                const rows = await new Promise((res, rej) => {
                    connection.query(getPostIdQuery, [comment_id, user_email], (err, result) => {
                        if (err) {
                            console.error('❌ post_id 조회 쿼리 오류:', err);
                            return rej(err);
                        }
                        res(result);
                    });
                });

                if (!rows || rows.length === 0) {
                    console.warn("⚠️ 댓글이 없거나 권한 없음");
                    connection.release();
                    return reject({
                        result: false,
                        status: 404,
                        err: '해당 댓글이 없거나 권한이 없습니다.'
                    });
                }

                const post_id = rows[0].post_id;

                // 2. 댓글 삭제
                const deleteQuery = 'DELETE FROM Comment WHERE comment_id = ? AND user_email = ?';
                const deleteResult = await new Promise((res, rej) => {
                    connection.query(deleteQuery, [comment_id, user_email], (err, result) => {
                        if (err) {
                            console.error('❌ 댓글 삭제 쿼리 오류:', err);
                            return rej(err);
                        }
                        res(result);
                    });
                });

                // 3. 연결 해제
                connection.release();

                if (deleteResult.affectedRows > 0) {
                    // 4. 댓글 수 감소 요청
                    try {
                        await PostReactionStorage.commentNumControl({ post_id, isIncrease: false });
                    } catch (e) {
                        console.error('❌ 댓글 수 감소 요청 실패:', e.message);
                    }

                    return resolve({
                        result: true,
                        status: 200
                    });
                } else {
                    console.warn('⚠️ 댓글 삭제 쿼리는 실행됐으나 삭제된 행 없음');
                    return reject({
                        result: false,
                        status: 404,
                        err: '댓글 삭제에 실패했습니다.'
                    });
                }
            } catch (error) {
                console.error('❌ 전체 try 블록 에러:', error);
                connection.release();
                return reject({
                    result: false,
                    status: 500,
                    err: error.message
                });
            }
        });
    });
}
// 댓글 id로 댓글 작성자 불러오기
static commentWriter(comment_id) {
    return new Promise((resolve, reject) => {
        pool.query(
            "SELECT user_email FROM Comment WHERE comment_id = ?;",
            [comment_id],
            (err, rows) => {
                if (err) {
                    console.error('Query 함수 오류', err);
                    return reject(err);
                }
                resolve(rows[0]);
            }
        );
    });
}
 
// 마이페이지) user_email에 해당하는 사용자의 하트 목록 보여주기
static getUserHeartList(userInfo) {
    const user_email = userInfo.user_email;
    return new Promise((resolve, reject) => {
        pool.query(
            "SELECT * FROM Post WHERE post_id IN (SELECT post_id FROM Heart WHERE user_email=?) ORDER BY post_id DESC;",
            [user_email],
            (err, rows) => {
                if (err) {
                    console.error('Query 함수 오류', err);
                    return reject(err);
                }
                if (rows.length < 1) {
                    return resolve({ result: "현재 나의 좋아요 게시글이 없습니다. 게시글에 좋아요를 눌러보세요 :)", status: 202 });
                }
                resolve({ result: rows, status: 200 });
            }
        );
    });
}

// 마이페이지) 특정 user_email 과 post_id에 해당하는 heart_id가 존재하는지 확인
static checkHeart(heartInfo) {
    const post_id = heartInfo.post_id;
    const user_email = heartInfo.user_email;
    return new Promise((resolve, reject) => {
        pool.query("SELECT heart_id FROM Heart WHERE user_email=? AND post_id=?;", [user_email, post_id], (err, rows) => {
            if (err) {
                console.error('Query 함수 오류', err);
                return reject(err);
            }
            if (rows.length < 1) {
                return resolve({ result: false, status: 200 });
            }
            resolve({ result: rows[0], status: 200 });
        });
    });
}

// 마이페이지) 좋아요 삭제
static deleteHeart(heart_id) {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM Heart WHERE heart_id=?;", [heart_id], (err, check) => {
            if (err) {
                console.error('Query 함수 오류', err);
                return reject(err);
            }
            if (check.length < 1) {
                return resolve({ result: "This 'heart_id' does not exist in the 'Heart' table.", status: 202 });
            }

            pool.query("DELETE FROM Heart WHERE heart_id=?;", [heart_id], (err, rows) => {
                if (err) {
                    console.error('Query 함수 오류', err);
                    return reject(err);
                }

                // 해당 게시글 like_count 감소
                pool.query("UPDATE Post SET like_count=like_count-1 WHERE post_id=?;", [check[0].post_id], (err) => {
                    if (err) {
                        console.error('Query 함수 오류', err);
                        return reject(err);
                    }
                    resolve({ result: rows, status: 200 });
                });
            });
        });
    });
}
  
// 댓글 개수 받아오기
static postCommentNum(post_id) {
    return new Promise((resolve, reject) => {
        pool.query("SELECT COUNT(*) AS count FROM Comment WHERE post_id=?;", [post_id], (err, rows) => {
            if (err) {
                console.error('Query 함수 오류', err);
                return reject(err);
            }
            resolve({ result: rows[0], status: 200 });
        });
    });
}
 
// 마이페이지- 내가 작성한 댓글 단 게시글 불러오기
static getMyCommentPost(userInfo) {
    const user_email = userInfo.user_email;
    return new Promise((resolve, reject) => {
        pool.query(
            "SELECT * FROM Post WHERE post_id IN (SELECT post_id FROM Comment WHERE user_email =?) ORDER BY post_id DESC;",
            [user_email],
            (err, rows) => {
                if (err) {
                    console.error('Query 함수 오류', err);
                    return reject(err);
                }
                if (rows.length < 1) {
                    return resolve({ result: "현재 내가 댓글 단 게시글이 없습니다. 게시글에 댓글을 작성해 보세요 :)", status: 202 });
                }
                resolve({ result: rows, status: 200 });
            }
        );
    });
}

   
// 좋아요 기능
static async addHeart(heartInfo) {
    const post_id = heartInfo.post_id;
    const user_email = heartInfo.user_email;
  
    return new Promise(async (resolve, reject) => {
      try {
        // 게시글 존재 여부 확인
        const isValid = await this.validPostId(post_id);
        if (!isValid) {
          return resolve({ result: "Post does not exist.", status: 202 });
        }
  
        // 유저 존재 여부 확인
        const isUserValid = await this.validUser(user_email);
        if (!isUserValid) {
          return resolve({ result: "User does not exist.", status: 202 });
        }
  
        // 이미 하트 눌렀는지 확인
        pool.query("SELECT * FROM Heart WHERE post_id=? AND user_email=?", [post_id, user_email], async (err, check) => {
          if (err) return reject(err);
  
          if (check.length > 0) {
            return resolve({ result: "You have already clicked 'Heart' on this post.", status: 202 });
          }
  
          // 하트 추가
          pool.query("INSERT INTO Heart(post_id, user_email) VALUES (?, ?);", [post_id, user_email], async (err, rows) => {
            if (err) return reject(err);
  
            try {
              await this.likeNumControl({ post_id, isIncrease: true });
            } catch (e) {
              console.error('좋아요 수 증가 요청 실패:', e.message);
            }
  
            return resolve({ result: rows, status: 200 });
          });
        });
      } catch (error) {
        return reject(error);
      }
    });
  }
  
    

// 게시글 존재하는지 확인
static async validPostId(post_id) {
    try {
        const response = await axios.get(`${baseUrls.baseUrls.post}/showPost/${post_id}`);
        // 존재하면 200 OK, 데이터 포함
        return true;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return false;
        }
        console.error('Post 확인 중 에러:', error.message);
        throw error; // 예외 상황 (서버 다운 등)
    }
}

// 사용자 존재하는지 확인
static async validUser(user_email) {
    const exists = await axios.get(`${baseUrls.baseUrls.user2}/info?email=${user_email}`);
    // 응답 구조가 exists가 아닌 result.user_email 포함 여부로 확인(user 쪽 응답값에 exist가 없어서 변경)
    if (!exists.data.result || !exists.data.result.user_email) {
    throw new Error("유저가 존재하지 않습니다.");
    }
    return true;
}


// 좋아요 수 증가 및 감소
static async likeNumControl({ post_id, isIncrease }) {
    const url = isIncrease
        ? `${baseUrls.baseUrls.post}/increaseHeart`
        : `${baseUrls.baseUrls.post}/decreaseHeart`;

    try {
        const response = await axios.patch(url, { post_id }); 
        return response.data; 
    } catch (error) {
        console.error(`좋아요 수 ${isIncrease ? '증가' : '감소'} 실패:`, error.message);
        throw error;
    }
}


// 게시글 스크랩 수 증가 및 감소 
static async scrapNumControl({ post_id, isIncrease }) {
    const url = isIncrease
        ? `${baseUrls.baseUrls.post}/increaseScrap`
        : `${baseUrls.baseUrls.post}/decreaseScrap`;

    try {
        const response = await axios.patch(url, { post_id }); 
        return response.data; 
    } catch (error) {
        console.error('스크랩 수 조절 실패:', error.message);
        throw error;
    }
}

// 게시글 댓글 수 증가 및 감소 
static async commentNumControl({ post_id, isIncrease }) {
    const url = isIncrease
        ? `${baseUrls.baseUrls.post}/increaseComment`
        : `${baseUrls.baseUrls.post}/decreaseComment`;

    try {
        const response = await axios.patch(url, { post_id }); 
        return response.data; 
    } catch (error) {
        console.error('댓글 수 조절 실패:', error.message);
        throw error;
    }
}

// 유저 정보 가져오기 

static getUserHeartList(userInfo) {
    const user_email = userInfo.user_email;
    return new Promise((resolve, reject) => {
        pool.query(
            "SELECT * FROM Post WHERE post_id IN (SELECT post_id FROM Heart WHERE user_email=? ORDER BY heart_id DESC);",
            [user_email],
            (err, rows) => {
                if (err) {
                    console.error('Query 함수 오류', err);
                    return reject(err);
                }
                if (rows.length < 1) {
                    return resolve({ result: "현재 나의 좋아요 게시글이 없습니다. 게시글에 좋아요를 눌러보세요 :)", status: 202 });
                }
                resolve({ result: rows, status: 200 });
            }
        );
    });
}

    static checkHeart(heartInfo) {
        const post_id = heartInfo.post_id;
        const user_email = heartInfo.user_email;
        return new Promise((resolve, reject) => {
            pool.query(
                "SELECT heart_id FROM Heart WHERE user_email=? AND post_id=?;",
                [user_email, post_id],
                (err, rows) => {
                    if (err) {
                        console.error('Query 함수 오류', err);
                        return reject(err);
                    }
                    if (rows.length < 1) {
                        return resolve({ result: false, status: 200 });
                    }
                    resolve({ result: rows[0], status: 200 });
                }
            );
        });
    }
    
    static deleteHeart(heart_id) {
        return new Promise((resolve, reject) => {
            // 먼저 해당 하트가 존재하는지 확인
            pool.query("SELECT * FROM Heart WHERE heart_id=?;", [heart_id], async (err, check) => {
                if (err) {
                    console.error('Query 함수 오류', err);
                    return reject(err);
                }
    
                if (check.length < 1) {
                    return resolve({ result: "This 'heart_id' does not exist in the 'Heart' table.", status: 202 });
                }
    
                const post_id = check[0].post_id;
    
                // 하트 삭제
                pool.query("DELETE FROM Heart WHERE heart_id=?;", [heart_id], async (err, rows) => {
                    if (err) {
                        console.error('Query 함수 오류', err);
                        return reject(err);
                    }
    
                    // 좋아요 수 감소 요청 (post-service와 직접 통신)
                    try {
                        await this.likeNumControl({ post_id, isIncrease: false });
                    } catch (e) {
                        console.error('좋아요 수 감소 실패:', e.message);
                        // rollback 필요 시 여기에 INSERT 재처리 추가 가능
                    }
    
                    return resolve({ result: rows, status: 200 });
                });
            });
        });
    }
    
    
    
    static postHeartNum(post_id) {
        return new Promise((resolve, reject) => {
            pool.query("SELECT COUNT(*) as count FROM Heart WHERE post_id=?;", [post_id], (err, rows) => {
                if (err) {
                    console.error('Query 함수 오류', err);
                    return reject(err);
                }
                resolve({ result: rows[0], status: 200 });
            });
        });
    }
    
    static async addScrap(scrapInfo) {
        const post_id = scrapInfo.post_id;
        const user_email = scrapInfo.user_email;
    
        return new Promise(async (resolve, reject) => {
            try {
                // 게시글 존재 여부 확인
                const postExists = await this.validPostId(post_id);
                if (!postExists) {
                    return resolve({ result: "Post does not exist.", status: 202 });
                }
    
                // 사용자 존재 여부 확인
                const userExists = await this.validUser(user_email);
                if (!userExists) {
                    return resolve({ result: "User does not exist.", status: 202 });
                }
    
                // 스크랩 중복 확인
                pool.query(
                    "SELECT * FROM Scrap WHERE post_id=? AND user_email=?;",
                    [post_id, user_email],
                    async (err, check) => {
                        if (err) {
                            console.error('Query 함수 오류', err);
                            return reject(err);
                        }
    
                        if (check.length > 0) {
                            return resolve({ result: "You have already clicked 'Scrap' on this post.", status: 202 });
                        }
    
                        // Scrap 저장
                        pool.query(
                            "INSERT INTO Scrap(post_id, user_email) VALUES(?, ?);",
                            [post_id, user_email],
                            async (err, rows) => {
                                if (err) {
                                    console.error('Query 함수 오류', err);
                                    return reject(err);
                                }
    
                                // scrap_count 증가
                                try {
                                    await this.scrapNumControl({ post_id, isIncrease: true });
                                } catch (e) {
                                    console.error('스크랩 수 증가 실패:', e.message);
                                }
    
                                return resolve({ result: rows, status: 200 });
                            }
                        );
                    }
                );
            } catch (err) {
                return reject(err);
            }
        });
    }
    
    
    static getUserScrapList(userInfo) {
        const user_email = userInfo.user_email;
        return new Promise((resolve, reject) => {
            pool.query(
                "SELECT * FROM Post WHERE post_id IN (SELECT post_id FROM Scrap WHERE user_email=? ORDER BY scrap_id DESC);",
                [user_email],
                (err, rows) => {
                    if (err) {
                        console.error('Query 함수 오류', err);
                        return reject(err);
                    }
                    if (rows.length < 1) {
                        return resolve({ result: "현재 나의 스크랩 게시글이 없습니다. 게시글을 스크랩 해보세요 :)", status: 202 });
                    }
                    resolve({ result: rows, status: 200 });
                }
            );
        });
    }
    
    static checkScrap(scrapInfo) {
        const post_id = scrapInfo.post_id;
        const user_email = scrapInfo.user_email;
        return new Promise((resolve, reject) => {
            pool.query(
                "SELECT scrap_id FROM Scrap WHERE user_email=? AND post_id=?;",
                [user_email, post_id],
                (err, rows) => {
                    if (err) {
                        console.error('Query 함수 오류', err);
                        return reject(err);
                    }
                    if (rows.length < 1) {
                        return resolve({ result: false, status: 200 });
                    }
                    resolve({ result: rows[0], status: 200 });
                }
            );
        });
    }
    

    static async deleteScrap(scrap_id) {
        return new Promise((resolve, reject) => {
            pool.query("SELECT * FROM Scrap WHERE scrap_id=?;", [scrap_id], (err, check) => {
                if (err) {
                    console.error('Query 함수 오류', err);
                    return reject(err);
                }
                if (check.length < 1) {
                    return resolve({ result: "This 'scrap_id' does not exist in the 'Scrap' table.", status: 202 });
                }
    
                const post_id = check[0].post_id;
    
                pool.query("DELETE FROM Scrap WHERE scrap_id=?;", [scrap_id], async (err, rows) => {
                    if (err) {
                        console.error('Query 함수 오류', err);
                        return reject(err);
                    }
    
                    try {
                        await PostReactionStorage.scrapNumControl({ post_id, isIncrease: false });
                    } catch (e) {
                        console.error('스크랩 수 감소 실패:', e.message);
                    }
    
                    return resolve({ result: rows, status: 200 });
                });
            });
        });
    }
    

    static postScrapNum(post_id) {
        return new Promise((resolve, reject) => {
            pool.query("SELECT COUNT(*) AS count FROM Scrap WHERE post_id=?;", [post_id], (err, rows) => {
                if (err) {
                    console.error('Query 함수 오류', err);
                    return reject(err);
                }
                resolve({ result: rows[0], status: 200 });
            });
        });
    }
    

    static getPostIdsByEmailFromScrap(userEmail) {
        return new Promise((resolve, reject) => {
            const email = typeof userEmail === 'object' && userEmail.user_email
  ? userEmail.user_email.trim()
  : String(userEmail).trim();

            // 이메일에 해당하는 post_id 조회 쿼리
            const query = `
                SELECT DISTINCT post_id
                FROM Scrap
                WHERE user_email = ?
            `;

            pool.query(query, [email], (err, results) => {
                if (err) {
                    console.error('쿼리 실행 오류:', err);
                    return reject(err);
                }

                // 결과 반환
                resolve(results);
            });
        });
    }
    static getPostIdsByEmailFromHeart(userEmail) {
        return new Promise((resolve, reject) => {
            const email = typeof userEmail === 'object' && userEmail.user_email
  ? userEmail.user_email.trim()
  : String(userEmail).trim();

            // 이메일에 해당하는 post_id 조회 쿼리
            const query = `
                SELECT DISTINCT post_id
                FROM Heart
                WHERE user_email = ?
            `;

            pool.query(query, [email], (err, results) => {
                if (err) {
                    console.error('쿼리 실행 오류:', err);
                    return reject(err);
                }

                // 결과 반환
                resolve(results);
            });
        });
    }
    static getPostIdsByEmailFromComment(userEmail) {
    return new Promise((resolve, reject) => {
        const email = typeof userEmail === 'object' && userEmail.user_email
  ? userEmail.user_email.trim()
  : String(userEmail).trim();

        // 이메일에 해당하는 post_id 조회 쿼리
        const query = `
            SELECT DISTINCT post_id
            FROM Comment
            WHERE user_email = ?
        `;

        pool.query(query, [email], (err, results) => {
            if (err) {
                console.error('쿼리 실행 오류:', err);
                return reject(err);
            }
            // 결과 반환
            resolve(results);
        });
    });
}
}

module.exports = PostReactionStorage;

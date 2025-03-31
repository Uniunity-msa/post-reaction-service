"use strict"
// const { reject } = require("underscore");
const { pool } = require("../../config/db");

class PostReactionStorage {
    //댓글 작성
    static saveComment(commentInfo) {
        return new Promise((resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    console.error('MySQL 연결 오류: ', err);
                    reject(err);
                    return;
                }
                function getCurrentDateTime() {
                    const now = new Date();
                    const offset = 9 * 60; // 9시간을 분 단위로 변환
                    const localTime = now.getTime() + now.getTimezoneOffset() * 60 * 1000; // 로컬 시간을 밀리초 단위로 변환
                    const seoulTime = new Date(localTime + offset * 60 * 1000); // 서울 시간 계산
                    const year = seoulTime.getFullYear();
                    const month = String(seoulTime.getMonth() + 1).padStart(2, '0');
                    const day = String(seoulTime.getDate()).padStart(2, '0');
                    const hours = String(seoulTime.getHours()).padStart(2, '0');
                    const minutes = String(seoulTime.getMinutes()).padStart(2, '0');
                    const seconds = String(seoulTime.getSeconds()).padStart(2, '0');
                    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
                }
                // 현재 시간을 YYYY-MM-DD HH:MM:SS 형식으로 포맷팅
                const formattedDateTime = getCurrentDateTime();
            
                const query = 'INSERT INTO Comment(user_email, post_id, comment_content, comment_date) VALUES ( ?, ?, ?, ?);';
                // const updateQuery = 'UPDATE Post SET comment_count = comment_count + 1 WHERE post_id = ?';

                connection.query(query, [ commentInfo.user_email, commentInfo.post_id, commentInfo.comment_content, formattedDateTime], (err) => {
                    if (err) {
                        pool.releaseConnection(connection);
                        console.error('INSERT Query 함수 오류', err);
                        reject({ result:false, status: 500, err: `${err}` });

                    }
                    else resolve({ result:true, status: 201 });
                });
            });
        });
    }
    //게시글 댓글 수 증가
    static updatePostCommentCount(post_id){
        return new Promise((resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    console.error('MySQL 연결 오류: ', err);
                    reject(err);
                    return;
                }

                const query = 'UPDATE Post SET comment_count = comment_count + 1 WHERE post_id = ?';

                connection.query(query, [ post_id], (err) => {
                    if (err) {
                        pool.releaseConnection(connection);
                        console.error('INSERT Query 함수 오류', err);
                        reject({ result:false, err: `${err}` });

                    }
                    else resolve({ result:true});
                });
            });
        });
    }
    //게시글 댓글 수 감소
    static reducePostCommentCount(post_id){
        return new Promise((resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    console.error('MySQL 연결 오류: ', err);
                    reject(err);
                    return;
                }

                const query = 'UPDATE Post SET comment_count = comment_count - 1 WHERE post_id = ?';

                connection.query(query, [ post_id], (err) => {
                    if (err) {
                        pool.releaseConnection(connection);
                        console.error('INSERT Query 함수 오류', err);
                        reject({ result:false, err: `${err}` });

                    }
                    else resolve({ result:true});
                });
            });
        });

    }
    //comment_id로 댓글 불러오기
    static getComment(comment_id) { //(4)
        return new Promise(async (resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    console.error('MySQL 연결 오류: ', err);
                    reject(err)
                }
                pool.query("SELECT * FROM Comment WHERE comment_id=?;", [comment_id], function (err, rows) {
                    pool.releaseConnection(connection);
                    if (err) {
                        console.error('Query 함수 오류', err);
                        reject(err)
                    }
                    resolve(rows[0]);
                })
            })
        });
    }
    //게시글 id로 댓글 정렬
    static getCommentListbyPostID(post_id) {
        return new Promise(async (resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    console.error('MySQL 연결 오류: ', err);
                    reject(err)
                }

                pool.query("select comment_content,like_count_comment,post_id,comment_date,comment_id,user_nickname,user.user_email from Comment comm LEFT JOIN User user ON comm.user_email=user.user_email where post_id=?;", [post_id], function (err, rows) {
                    pool.releaseConnection(connection);
                    if (err) {
                        console.error('Query 함수 오류', err);
                        reject(err)
                    }
                    resolve(rows);
                })
            })
        });
    }
    //댓글 불러오기(등록순)
    static getCommentListAll(comment_id) {
        return new Promise(async (resolve, reject) => {

            pool.getConnection((err, connection) => {
                if (err) {
                    console.error('MySQL 연결 오류: ', err);
                    reject(err)
                }

                const query = "SELECT * FROM Comment Where comment_id =?;"; //post_id
                pool.query(query, [comment_id], (err, data) => {
                    pool.releaseConnection(connection);
                    if (err) {
                        reject(`${err}`);
                    } else {
                        resolve(data);
                    }
                });
            });
        });
    }
    //댓글 삭제
    static goDeleteComment(user_email, comment_id) {
        return new Promise(async (resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    console.error('MySQL 연결 오류: ', err);
                    reject(err);
                }

                const query = 'DELETE FROM Comment WHERE user_email = ? AND comment_id =?';
                pool.query(query, [user_email, comment_id], (err, result) => {
                    pool.releaseConnection(connection);
                    if (err) {
                        reject({
                            result: false,
                            status: 500,
                            err: `${err}`
                        });
                    } else {
                        if (result.affectedRows > 0) {
                            resolve({
                                result: true,
                                status: 200
                            });
                        } else {
                            reject({
                                result: false,
                                status: 404,
                                err: '댓글을 찾을 수 없거나 삭제 권한이 없습니다.'
                            });
                        }
                    }
                });
            });
        });
    } 
    //댓글 id로 댓글 작성자 불러오기
    static commentWriter(comment_id) {
        return new Promise((resolve, reject) => {
          pool.getConnection((err, connection) => {
            if (err) {
              console.error('MySQL 연결 오류: ', err);
              reject(err);
            }
            pool.query("SELECT user_email FROM Comment WHERE comment_id = ?;", [comment_id], function (err, rows) {
              pool.releaseConnection(connection);
              if (err) {
                console.error('Query 함수 오류', err);
                reject(err);
              }
              resolve(rows[0]);
            });
          });
        });
    }   
    // 마이페이지) user_email에 해당하는 사용자의 하트 목록 보여주기
    static getUserHeartList(userInfo) {
        const user_email = userInfo.user_email;
        return new Promise(async (resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    console.error('MySQL 연결 오류: ', err);
                    reject(err)
                }
                pool.query("SELECT * FROM Post WHERE post_id IN (SELECT post_id FROM Heart WHERE user_email=?);", [user_email], function (err, rows) {
                    if (err) {
                        console.error('Query 함수 오류', err);
                        reject(err)
                    }
                    else if (rows.length < 1) {
                        pool.releaseConnection(connection);
                        resolve({ result: "현재 나의 좋아요 게시글이 없습니다. 게시글에 좋아요를 눌러보세요 :)", status: 202 });
                    }
                    pool.releaseConnection(connection);
                    resolve({ result: rows, status: 200 });
                })
            })
        });
    } 
     // 마이페이지) 특정 user_email 과 post_id에 해당하는 heart_id가 존재하는지 확인
     static checkHeart(heartInfo) {
        const post_id = heartInfo.post_id;
        const user_email = heartInfo.user_email;
        return new Promise(async (resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    console.error('MySQL 연결 오류: ', err);
                    reject(err)
                }
                pool.query("SELECT heart_id FROM Heart WHERE user_email=? AND post_id=?;", [user_email, post_id], function (err, rows) {
                    if (err) {
                        console.error('Query 함수 오류', err);
                        reject(err)
                    }
                    else if (rows.length < 1) {
                        pool.releaseConnection(connection);
                        resolve({ result: false, status: 200 });
                    }
                    pool.releaseConnection(connection);
                    resolve({ result: rows[0], status: 200 });
                })
            })
        });
    }  
    // 마이페이지) 좋아요 삭제
    static deleteHeart(heart_id) {
        return new Promise(async (resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    console.error('MySQL 연결 오류: ', err);
                    reject(err)
                }
                pool.query("SELECT * FROM Heart WHERE heart_id=?;", [heart_id], function (err, check) {
                    if (err) {
                        console.error('Query 함수 오류', err);
                        reject(err)
                    }
                    else if (check.length < 1) {
                        pool.releaseConnection(connection);
                        resolve({ result: "This 'heart_id' does not exist in the 'Heart' table.", status: 202 });
                    }
                    pool.query("DELETE FROM Heart WHERE heart_id=?;", [heart_id], function (err, rows) {
                        if (err) {
                            console.error('Query 함수 오류', err);
                            reject(err)
                        }
                        // 해당 게시글 like_count 감소
                        pool.query("UPDATE Post SET like_count=like_count-1 WHERE post_id=?;", [check[0].post_id], function (err) {
                            pool.releaseConnection(connection);
                            if (err) {
                                console.error('Query 함수 오류', err);
                                reject(err)
                            }
                        })
                        resolve({ result: rows, status: 200 });
                    })
                })
            })
        });
    }   
    //댓글 개수 받아오기
    static postCommentNum(post_id) {
        return new Promise(async (resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    console.error('MySQL 연결 오류: ', err);
                    reject(err)
                }
                pool.query("SELECT COUNT(*) FROM Comment WHERE post_id=?;", [post_id], function (err, rows) {
                    pool.releaseConnection(connection);
                    if (err) {
                        console.error('Query 함수 오류', err);
                        reject(err)
                    }
                    resolve({ result: rows[0], status: 200 });
                })
            })
        });
    }   
    //마이페이지- 내가 작성한 댓글 단 게시글 불러오기
    static getMyCommentPost(userInfo) {
        const user_email = userInfo.user_email;
        return new Promise(async (resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    console.error('MySQL 연결 오류: ', err);
                    reject(err)
                }

                pool.query("SELECT * FROM Post WHERE post_id IN (SELECT post_id FROM Comment WHERE user_email =?) ORDER BY post_id DESC;"
                    , [user_email], function (err, rows) {
                        pool.releaseConnection(connection);
                        if (err) {
                            console.error('Query 함수 오류', err);
                            reject(err)
                        }
                        else if (rows.length < 1) {
                            pool.releaseConnection(connection);
                            resolve({ result: "현재 내가 댓글 단 게시글이 없습니다. 게시글에 댓글을 작성해 보세요 :)", status: 202 });
                        }
                        resolve({ result: rows, status: 200 });
                    })
            })
        });
    }
    //조회수 증가
    static getIncreaseViewCount(post_id) {
        return new Promise((resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    console.error('MySQL 연결 오류: ', err);
                    reject({
                        result: false,
                        status: 500,
                        err: `${err}`
                    });
                }

                const query = 'UPDATE Post SET view_count = view_count + 1 WHERE post_id = ?';
                pool.query(query, [post_id], (err, result) => {
                    pool.releaseConnection(connection);
                    if (err) {
                        reject({
                            result: false,
                            status: 500,
                            err: `${err}`
                        });
                    } else {
                        if (result.affectedRows > 0) {
                            resolve({
                                result: true,
                                status: 200

                            });
                        } else {
                            reject({
                                result: false,
                                status: 404,
                                err: '게시글을 찾을 수 없습니다.'
                            });
                        }
                    }
                });
            });
        });
    }
    // 하트 기능 //
    // 마이페이지) (하트 버튼 클릭 시)Heart 테이블에 정보 저장
    static addHeart(heartInfo) {
        const post_id = heartInfo.post_id;
        const user_email = heartInfo.user_email;
        return new Promise(async (resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    console.error('MySQL 연결 오류: ', err);
                    reject(err)
                }
                // 해당 게시글이 존재하는지 확인
                pool.query("SELECT * FROM Post WHERE post_id=?;", [post_id], function (err, posts) {
                    if (err) {
                        console.error('Query 함수 오류', err);
                        reject(err)
                    }
                    else if (posts.length < 1) {
                        pool.releaseConnection(connection);
                        resolve({ result: "Post does not exist.", status: 202 });
                    }
                    else {
                        // 해당 사용자가 존재하는지 확인
                        pool.query("SELECT * FROM User WHERE user_email=?", [user_email], function (err, users) {
                            if (err) {
                                console.error('Query 함수 오류', err);
                                reject(err)
                            }
                            else if (users.length < 1) {
                                pool.releaseConnection(connection);
                                resolve({ result: "User does not exist.", status: 202 });
                            }
                            else {
                                // 게시글이 존재하고 사용자가 존재할 때 하트 추가 가능
                                pool.query("SELECT * FROM Heart WHERE post_id=? AND user_email=?;", [post_id, user_email], function (err, check) {
                                    if (err) {
                                        console.error('Query 함수 오류', err);
                                        reject(err)
                                    }
                                    else if (check.length > 0) {
                                        pool.releaseConnection(connection);
                                        resolve({ result: "You have already clicked 'Heart' on this post.", status: 202 });
                                    }
                                    else {
                                        pool.query("INSERT INTO Heart(post_id, user_email) values(?,?);", [post_id, user_email], function (err, rows) {
                                            if (err) {
                                                console.error('Query 함수 오류', err);
                                                reject(err)
                                            }
                                            // 해당 게시글 like_count 증가
                                            pool.query("UPDATE Post SET like_count=like_count+1 WHERE post_id=?;", [post_id], function (err) {
                                                pool.releaseConnection(connection);
                                                if (err) {
                                                    console.error('Query 함수 오류', err);
                                                    reject(err)
                                                }
                                            })
                                            resolve({ result: rows, status: 200 });
                                        })
                                    }
                                })
                            }
                        })
                    }
                })
            })
        });
    }
    // 마이페이지) user_email에 해당하는 사용자의 하트 목록 보여주기
    static getUserHeartList(userInfo) {
        const user_email = userInfo.user_email;
        return new Promise(async (resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    console.error('MySQL 연결 오류: ', err);
                    reject(err)
                }
                pool.query("SELECT * FROM Post WHERE post_id IN (SELECT post_id FROM Heart WHERE user_email=? ORDER BY heart_id DESC);", [user_email], function (err, rows) {
                    if (err) {
                        console.error('Query 함수 오류', err);
                        reject(err)
                    }
                    else if (rows.length < 1) {
                        pool.releaseConnection(connection);
                        resolve({ result: "현재 나의 좋아요 게시글이 없습니다. 게시글에 좋아요를 눌러보세요 :)", status: 202 });
                    }
                    pool.releaseConnection(connection);
                    resolve({ result: rows, status: 200 });
                })
            })
        });
    }
    // 마이페이지) 특정 user_email 과 post_id에 해당하는 heart_id가 존재하는지 확인
    static checkHeart(heartInfo) {
        const post_id = heartInfo.post_id;
        const user_email = heartInfo.user_email;
        return new Promise(async (resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    console.error('MySQL 연결 오류: ', err);
                    reject(err)
                }
                pool.query("SELECT heart_id FROM Heart WHERE user_email=? AND post_id=?;", [user_email, post_id], function (err, rows) {
                    if (err) {
                        console.error('Query 함수 오류', err);
                        reject(err)
                    }
                    else if (rows.length < 1) {
                        pool.releaseConnection(connection);
                        resolve({ result: false, status: 200 });
                    }
                    pool.releaseConnection(connection);
                    resolve({ result: rows[0], status: 200 });
                })
            })
        });
    }
    // 마이페이지) Heart 테이블에 정보 삭제
    static deleteHeart(heart_id) {
        return new Promise(async (resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    console.error('MySQL 연결 오류: ', err);
                    reject(err)
                }
                pool.query("SELECT * FROM Heart WHERE heart_id=?;", [heart_id], function (err, check) {
                    if (err) {
                        console.error('Query 함수 오류', err);
                        reject(err)
                    }
                    else if (check.length < 1) {
                        pool.releaseConnection(connection);
                        resolve({ result: "This 'heart_id' does not exist in the 'Heart' table.", status: 202 });
                    }
                    pool.query("DELETE FROM Heart WHERE heart_id=?;", [heart_id], function (err, rows) {
                        if (err) {
                            console.error('Query 함수 오류', err);
                            reject(err)
                        }
                        // 해당 게시글 like_count 감소
                        pool.query("UPDATE Post SET like_count=like_count-1 WHERE post_id=?;", [check[0].post_id], function (err) {
                            pool.releaseConnection(connection);
                            if (err) {
                                console.error('Query 함수 오류', err);
                                reject(err)
                            }
                        })
                        resolve({ result: rows, status: 200 });
                    })
                })
            })
        });
    }
    // 해당 게시글에 heart 개수 반환
    static postHeartNum(post_id) {
        return new Promise(async (resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    console.error('MySQL 연결 오류: ', err);
                    reject(err)
                }
                pool.query("SELECT COUNT(*) FROM Heart WHERE post_id=?;", [post_id], function (err, rows) {
                    pool.releaseConnection(connection);
                    if (err) {
                        console.error('Query 함수 오류', err);
                        reject(err)
                    }
                    resolve({ result: rows[0], status: 200 });
                })
            })
        });
    }
    // 스크랩 기능 //
    // 마이페이지) (스크랩 버튼 클릭 시)Scrap 테이블에 정보 저장
    static addScrap(scrapInfo) {
        const post_id = scrapInfo.post_id;
        const user_email = scrapInfo.user_email;
        return new Promise(async (resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    console.error('MySQL 연결 오류: ', err);
                    reject(err)
                }
                // 해당 게시글이 존재하는지 확인
                pool.query("SELECT * FROM Post WHERE post_id=?;", [post_id], function (err, posts) {
                    if (err) {
                        console.error('Query 함수 오류', err);
                        reject(err)
                    }
                    else if (posts.length < 1) {
                        pool.releaseConnection(connection);
                        resolve({ result: "Post does not exist.", status: 202 });
                    }
                    else {
                        // 해당 사용자가 존재하는지 확인
                        pool.query("SELECT * FROM User WHERE user_email=?", [user_email], function (err, users) {
                            if (err) {
                                console.error('Query 함수 오류', err);
                                reject(err)
                            }
                            else if (users.length < 1) {
                                pool.releaseConnection(connection);
                                resolve({ result: "User does not exist.", status: 202 });
                            }
                            else {
                                // 게시글이 존재하고 사용자가 존재할 때 스크랩 추가 가능
                                pool.query("SELECT * FROM Scrap WHERE post_id=? AND user_email=?;", [post_id, user_email], function (err, check) {
                                    if (err) {
                                        console.error('Query 함수 오류', err);
                                        reject(err)
                                    }
                                    else if (check.length > 0) {
                                        pool.releaseConnection(connection);
                                        resolve({ result: "You have already clicked 'Scrap' on this post.", status: 202 });
                                    }
                                    else {
                                        pool.query("INSERT INTO Scrap(post_id, user_email) values(?,?);", [post_id, user_email], function (err, rows) {
                                            if (err) {
                                                console.error('Query 함수 오류', err);
                                                reject(err)
                                            }
                                            // 해당 게시글 scrap_count 증가
                                            pool.query("UPDATE Post SET scrap_count=scrap_count+1 WHERE post_id=?;", [post_id], function (err) {
                                                pool.releaseConnection(connection);
                                                if (err) {
                                                    console.error('Query 함수 오류', err);
                                                    reject(err)
                                                }
                                            })
                                            resolve({ result: rows, status: 200 });
                                        })
                                    }
                                })
                            }
                        })
                    }
                })
            })
        });
    }
     // 마이페이지) user_email에 해당하는 사용자의 스크랩 목록 보여주기
     static getUserScrapList(userInfo) {
        const user_email = userInfo.user_email;
        return new Promise(async (resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    console.error('MySQL 연결 오류: ', err);
                    reject(err)
                }
                pool.query("SELECT * FROM Post WHERE post_id IN (SELECT post_id FROM Scrap WHERE user_email=? ORDER BY scrap_id DESC);", [user_email], function (err, rows) {
                    if (err) {
                        console.error('Query 함수 오류', err);
                        reject(err)
                    }
                    else if (rows.length < 1) {
                        pool.releaseConnection(connection);
                        resolve({ result: "현재 나의 스크랩 게시글이 없습니다. 게시글을 스크랩 해보세요 :)", status: 202 });
                    }
                    pool.releaseConnection(connection);
                    resolve({ result: rows, status: 200 });
                })
            })
        });
    }
    // 마이페이지) 특정 user_email 과 post_id에 해당하는 scrap_id가 존재하는지 확인
    static checkScrap(scrapInfo) {
        const post_id = scrapInfo.post_id;
        const user_email = scrapInfo.user_email;
        return new Promise(async (resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    console.error('MySQL 연결 오류: ', err);
                    reject(err)
                }
                pool.query("SELECT scrap_id FROM Scrap WHERE user_email=? AND post_id=?;", [user_email, post_id], function (err, rows) {
                    if (err) {
                        console.error('Query 함수 오류', err);
                        reject(err)
                    }
                    else if (rows.length < 1) {
                        pool.releaseConnection(connection);
                        resolve({ result: false, status: 200 });
                    }
                    pool.releaseConnection(connection);
                    resolve({ result: rows[0], status: 200 });
                })
            })
        });
    }
    // 마이페이지) Scrap 테이블에 정보 삭제
    static deleteScrap(scrap_id) {
        return new Promise(async (resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    console.error('MySQL 연결 오류: ', err);
                    reject(err)
                }
                pool.query("SELECT * FROM Scrap WHERE scrap_id=?;", [scrap_id], function (err, check) {
                    if (err) {
                        console.error('Query 함수 오류', err);
                        reject(err)
                    }
                    else if (check.length < 1) {
                        pool.releaseConnection(connection);
                        resolve({ result: "This 'scrap_id' does not exist in the 'Scrap' table.", status: 202 });
                    }
                    pool.query("DELETE FROM Scrap WHERE scrap_id=?;", [scrap_id], function (err, rows) {
                        if (err) {
                            console.error('Query 함수 오류', err);
                            reject(err)
                        }
                         // 해당 게시글 scrap_count 감소
                         pool.query("UPDATE Post SET scrap_count=scrap_count-1 WHERE post_id=?;", [check[0].post_id], function (err) {
                            pool.releaseConnection(connection);
                            if (err) {
                                console.error('Query 함수 오류', err);
                                reject(err)
                            }
                        })
                        resolve({ result: rows, status: 200 });
                    })
                })
            })
        });
    }
    // 해당 게시글에 scrap 개수 반환
    static postScrapNum(post_id) {
        return new Promise(async (resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    console.error('MySQL 연결 오류: ', err);
                    reject(err)
                }
                pool.query("SELECT COUNT(*) FROM Scrap WHERE post_id=?;", [post_id], function (err, rows) {
                    pool.releaseConnection(connection);
                    if (err) {
                        console.error('Query 함수 오류', err);
                        reject(err)
                    }
                    resolve({ result: rows[0], status: 200 });
                })
            })
        });
    }
}

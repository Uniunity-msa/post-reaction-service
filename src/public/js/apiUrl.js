const apiUrl = 'http://uniunity.store';

const baseUrls = {
  post: `${apiUrl}/post`, // post-service
  reaction: `${apiUrl}/mypage`,   // post-reaction-service
  user: `${apiUrl}/auth`,     // user-service
  start: `${apiUrl}/council`     // start-service
};

// Node.js 환경이면 module.exports 사용
if (typeof module !== 'undefined' && module.exports) { 
  module.exports = { baseUrls, apiUrl };
}

// 브라우저 환경이면 window에 등록
if (typeof window !== 'undefined') {
  window.baseUrls = baseUrls;
  window.apiUrl = apiUrl;
}
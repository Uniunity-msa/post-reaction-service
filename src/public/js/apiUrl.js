const apiUrl = 'http://34.22.87.148';

const baseUrls = {
  post: `${apiUrl}:3000`, // post-service
  reaction: `${apiUrl}:3002`,   // post-reaction-service
  user: `${apiUrl}:3004`,     // user-service
  start: `${apiUrl}:3001`     // start-service
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
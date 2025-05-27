//로그인(로그아웃), 회원가입(마이페이지)버튼
const loginStatusBtn = document.getElementById("loginStatusBtn");
const signUpBtn = document.getElementById("signUpBtn");

const user_email = document.getElementById("user_email");
const user_nickname = document.getElementById("user_nickname");
const user_type = document.getElementById("user_type");
const user_name = document.getElementById("user_name");
const university_name = document.getElementById("university_name");
const navBar=document.getElementById("navbar");

const loadloginData = async () => {
    try {
        const url = `${userServiceUrl}/auth/me`;  // user-service 유저정보 API
        const res = await fetch(url, {
            credentials: "include", // 쿠키 포함
        });

        if (!res.ok) {
            // 로그인 안 된 상태 처리
            setLoginHeader({ loginStatus: false });
            return;
        }

        const data = await res.json();
        // 로그인 상태 및 유저정보 세팅
        setLoginHeader({
            loginStatus: true,
            user_email: data.user_email,
            user_nickname: data.user_nickname,
            user_type: data.user_type,
            user_name: data.user_name,
            university_name: data.university_name,
            university_url: data.university_url,
        });
    } catch (err) {
        console.error("유저 정보 로드 실패:", err);
        setLoginHeader({ loginStatus: false });
    }
};

const setLoginHeader = (res) => {
    navBar.setAttribute("href", `${startServiceUrl}`);

    if (res.loginStatus) {
        user_email.innerText = res.user_email || "";
        user_type.innerText = res.user_type || "";
        user_name.innerText = res.user_name || "";
        user_nickname.innerText = res.user_nickname || "";
        university_name.innerText = res.university_name || "";

        loginStatusBtn.setAttribute("href", `${userServiceUrl}/logout`);
        loginStatusBtn.innerText = "로그아웃";
        signUpBtn.setAttribute("href", `${startServiceUrl}/council/${res.university_url || ""}`);
        signUpBtn.innerText = "나의학교";
    } else {
         // 비로그인 시 정보 초기화
         user_email.innerText = "";
         user_nickname.innerText = "";
         user_type.innerText = "";
         user_name.innerText = "";
         university_name.innerText = "";
         
        loginStatusBtn.setAttribute("href", `${userServiceUrl}/login`);
        loginStatusBtn.innerText = "로그인";
        signUpBtn.setAttribute("href", `${userServiceUrl}/signup`);
        signUpBtn.innerText = "회원가입";
    }
};

const loadLinkData=()=>{

    console.log("loadLinkData 실행됨");
    const nicknameLink = document.getElementById("nickname_modify_btn");
    const pswordLink = document.getElementById("psword_modify_btn");
    const withdrawalLink = document.getElementById("withdrawal_btn");

    const communityLink1= document.getElementById("community1_btn");
    const communityLink2= document.getElementById("community2_btn");
    const communityLink3= document.getElementById("community3_btn");
    const communityLink4= document.getElementById("community4_btn");

    nicknameLink.addEventListener("click", function () {
        window.location.href = `${userServiceUrl}/modify/nickname`; //user-service의 닉네임변경 화면 호출//
    });
    pswordLink.addEventListener("click", function () {
        window.location.href = `${userServiceUrl}/modify/password`; //user-service의 비밀번호변경 화면 호출//
    });
    withdrawalLink.addEventListener("click", function () {
        window.location.href = `${userServiceUrl}/withdrawal`; //user-service의 회원탈퇴 화면 호출//
    });
    communityLink1.addEventListener("click", function () {
        window.location.href = `${postServiceUrl}/mypage/community/post/1`; //post-service//
    });
    communityLink2.addEventListener("click", function () {
        window.location.href = `${postServiceUrl}/mypage/community/post/2`; //post-service//
    });
    communityLink3.addEventListener("click", function () {
        window.location.href = `${postServiceUrl}/mypage/community/post/3`; //post-service//
    });
    communityLink4.addEventListener("click", function () {
        window.location.href = `${postServiceUrl}/mypage/community/post/4`; //post-service//
    });
}

// 로드 후 loadData()실행
window.addEventListener('DOMContentLoaded', function () {
    console.log("DOM Content Loaded");
    loadloginData();
    loadLinkData();
});
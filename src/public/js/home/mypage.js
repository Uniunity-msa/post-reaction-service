//로그인(로그아웃), 회원가입(마이페이지)버튼
const loginStatusBtn = document.getElementById("loginStatusBtn");
const signUpBtn = document.getElementById("signUpBtn");

const user_email = document.getElementById("user_email");
const user_nickname = document.getElementById("user_nickname");
const user_type = document.getElementById("user_type");
const user_name = document.getElementById("user_name");
const university_name = document.getElementById("university_name");
const navBar=document.getElementById("navbar");

const loadloginData = () => {
    const url = `${apiUrl}/loginStatus`;
    fetch(url)
        .then((res) => res.json())
        .then(res => {
            setLoginHeader(res);
        }
        )
}

const setLoginHeader = (res) => {
    navBar.setAttribute("href", `${apiUrl}`);
    if (res.loginStatus) {
        // User jwt로 정보 받아오기
        // user_email.innerText = res.user_email
        // user_type.innerText = res.user_type
        // user_name.innerText = res.user_name
        // user_nickname.innerText = `${res.user_nickname}`
        // university_name.innerText = res.university_name

        loginStatusBtn.setAttribute("href", `${apiUrl}/logout`); //user-service의 logout 화면 호출//
        loginStatusBtn.innerText = "로그아웃"
        signUpBtn.setAttribute("href", `${apiUrl}/council/${res.university_url}`); //start-service의 메인 화면 호출//
        signUpBtn.innerText = "나의학교"
    }
    else {
        loginStatusBtn.setAttribute("href", `${apiUrl}/login`); //user-service의 login 화면 호출//
        loginStatusBtn.innerText = "로그인"
        signUpBtn.setAttribute("href", `${apiUrl}/signup`); //user-service의 signup 화면 호출//
        signUpBtn.innerText = "회원가입"
    }
}

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
        window.location.href = `${apiUrl}/mypage/modify/1`; //user-service의 닉네임변경 화면 호출//
    });
    pswordLink.addEventListener("click", function () {
        window.location.href = `${apiUrl}/mypage/modify/2`; //user-service의 비밀번호변경 화면 호출//
    });
    withdrawalLink.addEventListener("click", function () {
        window.location.href = `${apiUrl}/mypage/withdrawal`; //user-service의 회원탈퇴 화면 호출//
    });
    communityLink1.addEventListener("click", function () {
        window.location.href = "http://localhost:3000/mypage/community/post/1"; //post-service//
    });
    communityLink2.addEventListener("click", function () {
        window.location.href = "http://localhost:3000/mypage/community/post/2"; //post-service//
    });
    communityLink3.addEventListener("click", function () {
        window.location.href = "http://localhost:3000/mypage/community/post/3"; //post-service//
    });
    communityLink4.addEventListener("click", function () {
        window.location.href = "http://localhost:3000/mypage/community/post/4"; //post-service//
    });
}

// 로드 후 loadData()실행
window.addEventListener('DOMContentLoaded', function () {
    console.log("DOM Content Loaded");
    loadloginData();
    loadLinkData();
});
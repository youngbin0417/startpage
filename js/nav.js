const $searchWrap = document.querySelector(".nav-wrap__search");
const $searchInput = document.querySelector(".nav-wrap__search input");
const $matchedWrap = document.querySelector(".dropdown-wrap .matched");
const $recentWrap = document.querySelector(".dropdown-wrap .recent");
const $dropdownWrap = document.querySelector(".dropdown-wrap");
const $searchImg = document.querySelector(".nav-wrap__search__img");

// 검색
const search = (value) => {
  if (typeof value === "string" && value.trim() === "") {
    return $matchedWrap.classList.add("empty");
  }
  const DUMMY_LIST = [
    { name: "정자동파크뷰(경기도 성남시 분당구 정자일로 248)" },
    { name: "수내동파크뷰(경기도 성남시 분당구 수내동123)" },
    { name: "정자동파크뷰(경기도 성남시 분당구 정자일로 248)" },
  ];

  // @@dynamic
  const matchedList = DUMMY_LIST.filter((v) => v.name.includes(value)).map(
    (v) => ({
      ...v,
      name: v.name.replace(value, `<span class="strong">${value}</span>`),
    })
  );
  $recentWrap.classList.add("hide");
  $matchedWrap.classList.remove("hide");

  if (!matchedList.length) {
      $matchedWrap.classList.add("empty");
    } else {
      $matchedWrap.classList.remove("empty");
      const $matchedList = document.querySelector(".matched__list");
      $matchedList.innerHTML = matchedList
        .map((v) => {
          return /*html*/ `
          <div class="dropdown-wrap__item">
            <img src="/assets/finder_g.svg" class="dropdown-wrap__item__img" />
            <div class="dropdown-wrap__item__name">${v.name}</div>
          </div>
        `;
        })
        .join("");

      // 검색 결과가 완료된 후 검색창을 닫는 로직 추가
      $searchWrap.classList.remove("active");
      $recentWrap.classList.remove("hide");
      $matchedWrap.classList.add("hide");
    }
  };

const registerEvent = () => {
  $searchInput.addEventListener("focus", (e) => {
    $searchWrap.classList.add("active");
  });

  // Enter 시 검색 내용 숨김
  $searchInput.addEventListener("keyup", (e) => {
    if (e.code === "Enter") {
        // 클릭 이벤트에 대한 추가 로직
        search(e.target.value);

        // 검색이 완료된 후 검색창을 닫는 로직 추가
        $searchWrap.classList.remove("active");
        $recentWrap.classList.remove("hide");
        $matchedWrap.classList.add("hide");
    }
  });

  // 검색목록 클릭시 검색 내용 숨김
  $dropdownWrap.addEventListener("click", (e) => {
      if (e.button === 0) {
          // 클릭 이벤트에 대한 추가 로직
          search(e.target.value);

          // 검색이 완료된 후 검색창을 닫는 로직 추가
          $searchWrap.classList.remove("active");
          $recentWrap.classList.remove("hide");
          $matchedWrap.classList.add("hide");
      }
  });

  // 돋보기 모양 클릭 시 검색 내용 숨김
  $searchImg.addEventListener("click", (e) => {
      if(e.button === 0){
          // 클릭 이벤트에 대한 추가 로직
          search(e.target.value);

          // 검색이 완료된 후 검색창을 닫는 로직 추가
          $searchWrap.classList.remove("active");
          $recentWrap.classList.remove("hide");
          $matchedWrap.classList.add("hide");
      }
  });


  // 회원가입 모달 열기 및 이벤트 등록
  const $joinButton = document.querySelector(".nav-wrap__auth__join");
  $joinButton.addEventListener("click", () => {
    const $joinModal = document.querySelector(".join-modal");
    $joinModal?.classList.toggle("hide");
  });

  // 로그인 모달 열기 및 이벤트 등록
  const $loginButton = document.querySelector(".nav-wrap__auth__login");
  $loginButton.addEventListener("click", () => {
    const $loginModal = document.querySelector(".login-modal");
    $loginModal?.classList.toggle("hide");
  });

  // auth관련 모달(회원가입, 아이디찾기, 비번찾기) 에서 쓰이는 auth-input엘리먼트 focus in/out시 active처리
  document.addEventListener("focusin", ({ target }) => {
    if (target.closest(".auth-input")) {
      target.closest(".auth-input").classList.add("active");
    }
  });
  document.addEventListener("input", ({ target }) => {
    if (target.classList.contains('auth-input__input') && target.value.trim() !== "") {
      target.closest(".auth-input").classList.add("active");
    }
  });
  document.addEventListener("focusout", ({ target }) => {
    if (target.closest(".auth-input") && target.value.trim() === "") {
      target.closest(".auth-input").classList.remove("active");
    }
  });
  // auth관련 모달(회원가입, 아이디찾기, 비번찾기) 에서 쓰이는 auth-input엘리먼트 focus in/out시 active처리
};
const init = () => {
  registerEvent();
  // click outside event (전역)
  window.addEventListener("keyup", (e) => {
    if (!$searchWrap.contains(e.target)) {
        console.log("Closing search history");
        $searchWrap && $searchWrap.classList.remove("active");
        $recentWrap && $recentWrap.classList.remove("hide");
        $matchedWrap && $matchedWrap.classList.add("hide");
    }
  });

  window.addEventListener("click", (e) => {
      if (!$searchWrap.contains(e.target)) {
          console.log("Closing search history");
          $searchWrap && $searchWrap.classList.remove("active");
          $recentWrap && $recentWrap.classList.remove("hide");
          $matchedWrap && $matchedWrap.classList.add("hide");
      }
    });
};

export default { init };


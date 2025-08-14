let $root;

let $searchWrap;
let $searchInput;
let $recentWrap;
let $matchedWrap;

// 검색
const search = (value) => {
  const $matchedWrap = $root.querySelector(
    ".panel-search-wrap .dropdown-wrap .matched"
  );
  const $recentWrap = $root.querySelector(
    ".panel-search-wrap .dropdown-wrap .recent"
  );
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
    // 매칭되는 검색어 없을 경우
    $matchedWrap.classList.add("empty");
  } else {
    $matchedWrap.classList.remove("empty");
    const $matchedList = $root.querySelector(".matched__list");
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
  }
};

const registerEvent = () => {
  if (!$root) return;
  const $searchInput = $root.querySelector(
    ".panel-search-wrap .nav-wrap__search input"
  );
  const $recentWrap = $root.querySelector(
    ".panel-search-wrap .dropdown-wrap .recent"
  );
  const $matchedWrap = $root.querySelector(
    ".panel-search-wrap .dropdown-wrap .matched"
  );
  const $closeButton = $root.querySelector(".tab-panel-close");

  $searchInput.addEventListener("focus", (e) => {
    const $searchWrap = $root.querySelector(
      ".panel-search-wrap .nav-wrap__search"
    );
    $searchWrap.classList.add("active");
  });

  $searchInput.addEventListener("keyup", (e) => {
    if (e.code === "Enter") {
      $recentWrap.classList.add("hide");
      $matchedWrap.classList.remove("hide");
      search(e.target.value);
    }
  });
  $closeButton.addEventListener("click", (e) => {
    $root.classList.add("hide");
  });
};

// viewport 800px 이하에서 주소검색버튼 활성화
const registerButtonEvent = (el) => {
  el.addEventListener("click", () => {
    $root.classList.remove("hide");
  });
};

const init = (el, searchButtonEl) => {
  $root = el;
  const $searchButton = searchButtonEl;
  registerButtonEvent($searchButton);
  $searchWrap = $root.querySelector(".panel-search-wrap .nav-wrap__search");
  $searchInput = $root.querySelector(
    ".panel-search-wrap .nav-wrap__search input"
  );
  $recentWrap = $root.querySelector(
    ".panel-search-wrap .dropdown-wrap .recent"
  );
  $matchedWrap = $root.querySelector(
    ".panel-search-wrap .dropdown-wrap .matched"
  );
  registerEvent();
  // click outside event (전역)
  window.addEventListener("click", (e) => {
    if (!$searchWrap.contains(e.target)) {
      $searchWrap && $searchWrap.classList.remove("active");
      $recentWrap && $recentWrap.classList.remove("hide");
      $matchedWrap && $matchedWrap.classList.add("hide");
    }
  });
};

export default { init };

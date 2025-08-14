const registerEvent = (el) => {
  // const $toolWrap = el;
  // $toolWrap.addEventListener("click", (e) => {
  //   const $secondBox = e.target.closest(".second-box");
  //   if ($secondBox) {
  //     return false;
  //   }
  //
  //   const $tool = e.target.closest(".tool");
  //   if (!$tool) return;
  //
  //   if ($tool.classList.contains("active")) {
  //     return $tool.classList.remove("active");
  //   }
  //
  //   // 기존 활성화 제거
  //   const hasActive = document.querySelector(".tool.active");
  //   hasActive && hasActive.classList.toggle("active");
  //
  //   if ($tool.classList.contains("has-second")) {
  //     $tool.classList.add("active");
  //   }
  // });
};

const init = (el) => {
  registerEvent(el);
};

export default { init };

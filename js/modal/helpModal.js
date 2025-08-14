let $root;

export default {
  init($findpwModal) {
    $root = $findpwModal;
    // 아이디 찾기 모달 닫기 버튼 이벤트
    $root.addEventListener("click", ({ target }) => {
      if (target.closest(".help-modal-button")) {
        const $targetModal = target.closest("span").querySelector(".help-modal");
        $targetModal && $targetModal.classList.toggle('hide');
      }

      if (target.closest(".help-modal .close")) {
        const $targetModal = target.closest(".help-modal");
        $targetModal.classList.add("hide");
      }
    });
  },
};
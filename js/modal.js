export default {
  init() {
    // 세금 컨설팅 모달 close
    document
      .querySelector(".tax-consulting-modal")
      .addEventListener("click", (e) => {
        const target = e.target;
        if (target.closest(".tax-consulting-modal .modal-title")) {
          document
            .querySelector(".tax-consulting-modal")
            .classList.toggle("hide");
        }
      });

    // 절세플랜 모달 close
    document
      .querySelector(".plan-modal")
      .addEventListener("click", (e) => {
        const target = e.target;
        if (target.closest(".plan-modal .modal-title")) {
          document
            .querySelector(".plan-modal")
            .classList.toggle("hide");
        }
      });
  },
};

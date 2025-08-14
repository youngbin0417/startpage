// toastify-js 라이브러리 커스텀
const commonStyles = {
  background: "#fff",
  //color: "#111", // color가 2번 정의되어 무시되고 있던 값
  borderRadius: "10px",
  padding: "12px",
  color: "#333c4e",
  fontWeight: "500",
};

const defaultOptions = {
  duration: 3000,
  newWindow: true,
  close: true,
  position: "center",
  stopOnFocus: true, // Prevents dismissing of toast on hover
};

const parse = (param) => {
  if (["string", "number"].includes(typeof param)) return { text: param };
  if (typeof param === "object") return param;
  return {};
};
const toast = {
  error: (param) => {
    const options = parse(param || "");
    return Toastify({
      ...defaultOptions,
      ...parse(param || ""),
      avatar: "/assets/fontawesome/circle-exclamation-solid.svg",
      className: "toast__icon toast__error",
      style: {
        ...commonStyles,
      },
      onClick: function () {}, // Callback after click
    }).showToast();
  },
  success: (param) => {
    const options = parse(param || "");
    return Toastify({
      ...defaultOptions,
      ...options,
      className: "toast__icon toast__success",
      avatar: "/assets/fontawesome/circle-check-regular.svg",
      style: {
        ...commonStyles,
      },
      onClick: function () {}, // Callback after click
    }).showToast();
  },
};
export default {
  init() {
    window.$toast = toast;
  },
};

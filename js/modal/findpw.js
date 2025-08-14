import { generatMessageDOM } from "./common.js";
import { phoneFormat } from "../_lib/format.js";
import { checkNameError, checkPhoneError, checkEmailError } from "../_lib/validator.js";

let $root;
const state = {
  checkPhoneValidation: false,
  phoneCheckTime: null,
  phoneCheckInterval: null,
  canSubmit: false,
  form: {
    phone: "",
    email: "",
    checkCode: "",
    name: "",
  },
  messages: {
    phone: null,
    email: null,
    checkCode: null,
    name: null,
  },
};

export default {
  init($findpwModal) {
    $root = $findpwModal;
    // 아이디 찾기 모달 닫기 버튼 이벤트
    $root.addEventListener("click", ({ target }) => {
      if (target.closest("button.close")) {
        $root.classList.add("hide");
      }
      // 휴대폰 인증
      const $phoneAuthButton = target.closest(".phone-auth-button");
      if ($phoneAuthButton) {
        checkPhoneValidate($root);
      }

      // 인증번호 체크
      const $phoneAuthConfirmButton = target.closest(".auth-confirm-button");
      if ($phoneAuthConfirmButton) {
        submit();
      }
    });

    $root.addEventListener("input", (e) => {
      const formKey = e.target.closest(".auth-input-wrap")?.dataset?.value;

      let value = e.target.value;
      if (formKey === "phone") {
        value = phoneFormat(value);
      }
      if (!formKey) return;

      e.target.value = value;
      state.form[formKey] = value;
    });
  },
};

async function submit() {
  if (!verifyPhoneValidation()) return;
  await checkSubmitValidate();
  updateMessageDOM();
  if (!state.checkPhoneValidation) {
    $toast.error("휴대폰 인증을 완료해 주세요.");
    return false;
  }
}

// 인증 확인
function verifyPhoneValidation() {
  if (state.form.checkCode !== "111111") {
    failAction(["checkCode", "인증번호가 일치하지 않습니다."]);
    return false;
  }

  clearInterval(state.phoneCheckInterval);
  state.checkPhoneValidation = true;
  clearMessage("phone");
  setMessage([
    "checkCode",
    {
      type: "check",
      text: "인증이 완료되었습니다.",
    },
  ]);
  return true;
}

function updateMessageDOM() {
  Object.entries(state.messages).forEach(([key, value]) => {
    if (!value) {
      const $message = $root.querySelector(`[data-value=${key}] .auth-message`);
      if ($message) $message.innerHTML = "";
      return;
    }
    if ($root.querySelector(`[data-value=${key}] .auth-message`)) {
      $root.querySelector(`[data-value=${key}] .auth-message`).innerHTML =
        generatMessageDOM(value.type, value.text, value.noIcon);
    }
  });
}
// state변화에 따른 확인 버튼 업데이트
function updateConfirmDOM($target) {
  if (state.phoneCheckTime) {
    $target.querySelector(".auth-confirm-button").classList.remove("disabled");
    $target.querySelector(".auth-confirm-button").classList.add("blue");
  } else {
    $target.querySelector(".auth-confirm-button").classList.remove("blue");
    $target.querySelector(".auth-confirm-button").classList.add("disabled");
  }
}

function setMessage([name, message]) {
  state.messages[name] = message;
  updateMessageDOM();
}
function clearMessage(name) {
  state.messages[name] = null;
}

async function checkPhoneValidate($target) {
  clearInterval(state.phoneCheckInterval);
  state.phoneCheckTime = null;
  state.phoneCheckInterval = null;
  state.checkPhoneValidation = false;

  if (!(await checkPhone())) {
    // updateMessageDOM();
    return;
  }
  state.phoneCheckTime = new Date().getTime();
  state.phoneCheckInterval = setInterval(() => {
    if (!state.phoneCheckTime) {
      clearTimeout(state.phoneCheckInterval);
      return;
    }
    const limitTime = 300;
    const diffTime = parseInt(
      (new Date().getTime() - state.phoneCheckTime) / 1000
    );
    if (limitTime < diffTime) {
      clearTimeout(state.phoneCheckInterval);
      failAction(["phone", "인증시간이 만료되었습니다."]);
      // updateMessageDOM();
      return false;
    }

    const T = limitTime - diffTime;
    const M = (Math.floor(T / 60) + "").padStart(2, "0");
    const S = ((T % 60) + "").padStart(2, "0");

    setMessage([
      "phone",
      {
        text: `인증번호를 발송했습니다. (입력시간: ${M}:${S})`,
        noIcon: true,
      },
    ]);
    updateConfirmDOM($target);
  }, 1000);
}

export async function checkSubmitValidate() {
  state.canSubmit = true;

  await Promise.all(
    ["checkPhone", "checkName", "checkEmail"].map((functionName) => eval(`${functionName}()`))
  );

  return state.canSubmit;
}

export function failAction([target, message]) {
  setMessage([target, { type: "error", text: message }]);
  state.canSubmit = false;
}

export function checkName() {
  const error = checkNameError(state.form);
  if (error) {
    failAction(["name", error]);
    return false;
  }
  clearMessage("name");
  return true;
}

export function checkPhone() {
  const error = checkPhoneError(state.form);
  if (error) {
    failAction(["phone", error]);
    return false;
  }

  clearMessage("phone");
  return true;
}

export function checkEmail() {
  const error = checkEmailError(state.form);
  if (error) {
    failAction(["email", error]);
    return false;
  }
  clearMessage("email");

  return true;
}
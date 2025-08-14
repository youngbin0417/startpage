import {
  agreementCheckList,
  brokerCheckList,
  getBrokerJoinInputs,
  generatMessageDOM,
} from "./common.js";
import { phoneFormat } from "../_lib/format.js";
import {
  checkEmailError,
  checkNameError,
  checkPassconfError,
  checkPasswordError,
  checkPhoneError,
  checkAddressError,
  checkAgentNameError,
  checkBrokerCodeError,
  checkBusinessCodeError,
  checkOfficeNameError,
  checkTelError,
} from "../_lib/validator.js";

let $root;

// 런타임에 사용되는 상태값 (state)
const state = {
  checklist: [
    { key: "all_check", checked: false },
    ...agreementCheckList.map((v) => ({ ...v, checked: false })),
    ...brokerCheckList.map((v) => ({ ...v, checked: false })),
  ],
  checkAgreement: false,
  checkPhoneValidation: false,
  phoneCheckTime: null,
  phoneCheckInterval: null,
  canSubmit: false,
  form: {
    ...Object.keys(getBrokerJoinInputs()).reduce(
      (acc, k) => ({ ...acc, [k]: "" }),
      {}
    ),
  },
  messages: {
    ...Object.keys(getBrokerJoinInputs()).reduce(
      (acc, k) => ({ ...acc, [k]: null }),
      {}
    ),
  },
};
// 런타임에 사용되는 상태값 (state)

// 회원가입 관련 동작 및 이벤트 등록
export default {
  async init($brokerJoinModal) {
    const $brokerJoinButton = document.querySelector(".broker-join-button");
    $root = $brokerJoinModal;

    // nav의 회원가입 클릭시 모달 오픈
    $brokerJoinButton.addEventListener("click", () => {
      const $existJoinModal = document.querySelector(".join-modal:not(.hide)");
      if ($existJoinModal) $existJoinModal.classList.add("hide");
      $root?.classList.remove("hide");
    });

    $eventBus.on("setBroker", setBroker);

    // 모달 내 이벤트 등록
    $root.addEventListener("click", async ({ target }) => {
      if (target.closest("button.close") || target.closest(".cancel-button")) {
        $root.classList.add("hide");
      }
      // 체크 박스 active처리
      const isCheckItem = target.closest(".checklist__item");
      if (isCheckItem) {
        const found = state.checklist.find(
          (v) => isCheckItem.dataset.value === v.key
        );
        found.checked = !found.checked;

        // description이 있는 경우 modal 오픈
        if (found.description) {
          const $agreementModal = document.querySelector(".agreement-modal");
          $agreementModal.classList.remove("hide");
          $agreementModal.querySelector(".text-wrap").innerHTML =
            found.description;
          $agreementModal
            .querySelector("button.close")
            .addEventListener("click", () => {
              $agreementModal.classList.add("hide");
            });
          $agreementModal
            .querySelector("button.confirm")
            .addEventListener("click", () => {
              $agreementModal.classList.add("hide");
            });
        }
        // 전체 체크 토글
        if (isCheckItem.dataset.value === "all_check") {
          const allChecked = state.checklist.find((v) => v.key === "all_check");
          if (allChecked.checked) {
            state.checklist.forEach((v) => (v.checked = true));
          } else {
            state.checklist.forEach((v) => (v.checked = false));
          }
        }
        state.checklist.forEach((v) => {
          const $target = $root.querySelector(
            `.broker-join-modal [data-value=${v.key}]`
          );
          const checkbox = Array.from($target.children).find((v) =>
            v.className.includes("checkbox")
          );
          if (checkbox) {
            v.checked
              ? checkbox.classList.add("active")
              : checkbox.classList.remove("active");
          }
        });
      }

      // 이메일 중복확인 체크
      const $duplicateCheckButton = target.closest(".duplicate-check-button");
      if ($duplicateCheckButton) {
        await checkOverlapEmail();
        updateMessageDOM();
      }

      // 휴대폰 인증
      const $phoneAuthButton = target.closest(".phone-auth-button");
      if ($phoneAuthButton) {
        checkPhoneValidate(document.querySelector(".broker-join-modal"));
      }

      // 인증번호 체크
      const $phoneAuthConfirmButton = target.closest(".auth-confirm-button");
      if ($phoneAuthConfirmButton) {
        verifyPhoneValidation();
      }

      // 중개사 정보조회 모달 오픈
      const $searchBrokerButton = target.closest(".search-broker-button");
      const $searchBrokerModal = document.querySelector(".search-broker-modal");
      if ($searchBrokerButton) {
        $searchBrokerModal.classList.remove("hide");
      }

      // 회원가입 버튼 클릭시 로직
      const isSignupButton = target.closest(".signup-button");
      if (isSignupButton) {
        const isPass = [...agreementCheckList, ...brokerCheckList]
          .filter((item) => item.required)
          .reduce((acc, item) => {
            return (
              acc && state.checklist.find((v) => v.key === item.key)?.checked
            );
          }, true);

        state.checkAgreement = isPass;
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

// 회원가입 클릭 프로세스
async function submit() {
  await checkSubmitValidate();
  // await joinCheckSubmitValidate();
  updateMessageDOM();
  if (!state.checkPhoneValidation) {
    $toast.error("휴대폰 인증을 완료해 주세요.");
    return false;
  }
  if (!state.canSubmit) {
    $toast.error("입력하신 가입정보를 확인해 주세요.");
    return false;
  }
  if (!state.checkAgreement) {
    $toast.error("필수 동의항목을 체크해 주세요.");
    return false;
  }
  /**
   * 회원가입 API 넣을곳
   */
}

function setBroker(broker) {
  if (!broker) return;
  Object.keys(broker).forEach((v) => {
    state.form[v] = broker[v];
  });
  updateForm();
}

function updateForm() {
  Object.entries(state.form).forEach(([key, value]) => {
    const $input = $root.querySelector(
      `[data-value=${key}] .auth-input__input`
    );
    if ($input) $input.value = value;
    const inputEvent = new Event("input", {
      bubbles: true,
      cancelable: true,
    });
    $input.dispatchEvent(inputEvent);
  });
}
// state변화에 따른 message DOM업데이트
function updateMessageDOM() {
  Object.entries(state.messages).forEach(([key, value]) => {
    if (!value) {
      const $message = document.querySelector(
        `.broker-join-modal [data-value=${key}] .auth-message`
      );
      if ($message) $message.innerHTML = "";
      return;
    }
    document.querySelector(
      `.broker-join-modal [data-value=${key}] .auth-message`
    ).innerHTML = generatMessageDOM(
      value.type,
      value.text?.text ? value.text.text : value.text,
      value.noIcon
    );
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
    updateMessageDOM();
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
      updateMessageDOM();
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
    updateMessageDOM();
    updateConfirmDOM($target);
  }, 1000);
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

async function checkSubmitValidate() {
  state.canSubmit = true;

  await Promise.all(
    [
      "checkOverlapEmail",
      "checkPhone",
      "checkPassword",
      "checkPassconf",
      "checkName",
      "checkOfficeName",
      "checkAgentName",
      "checkBusinessCode",
      "checkBrokerCode",
      "checkTel",
      "checkAddress",
    ].map((functionName) => eval(`${functionName}()`))
  );

  return state.canSubmit;
}

export function failAction([target, message]) {
  setMessage([target, { type: "error", text: message }]);
  state.canSubmit = false;
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
export async function checkOverlapEmail() {
  const email = state.form.email;

  if (!(await checkEmail())) {
    return;
  }
  /*
    @@@ 이메일 중복 체크 API가 위치 @@@
  */
  const DUMMY_RESPONSE = { is_duplication: false };
  if (DUMMY_RESPONSE?.is_duplication) {
    failAction(["email", "중복된 이메일입니다."]);
    return;
  }
  setMessage(["email", { type: "check", text: "사용가능한 이메일입니다." }]);
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
export function checkPassword() {
  const error = checkPasswordError(state.form);
  if (error) {
    failAction(["password", error]);
    return false;
  }

  clearMessage("password");
  return true;
}
export function checkPassconf() {
  const error = checkPassconfError(state.form);
  if (error) {
    failAction(["passconf", error]);
    return false;
  }
  clearMessage("passconf");
  return true;
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

function checkOfficeName() {
  const error = checkOfficeNameError(state.form);
  if (error) {
    failAction(["officeName", { type: "error", text: error }]);
    return false;
  }
  clearMessage("officeName");
  return true;
}
function checkAgentName() {
  const error = checkAgentNameError(state.form);
  if (error) {
    failAction(["agentName", { type: "error", text: error }]);
    return false;
  }
  clearMessage("agentName");
  return true;
}
function checkBusinessCode() {
  const error = checkBusinessCodeError(state.form);
  if (error) {
    failAction(["businessCode", { type: "error", text: error }]);
    return false;
  }
  clearMessage("businessCode");
  return true;
}
function checkBrokerCode() {
  const error = checkBrokerCodeError(state.form);
  if (error) {
    failAction(["brokerCode", { type: "error", text: error }]);
    return false;
  }
  clearMessage("brokerCode");
  return true;
}
function checkTel() {
  const error = checkTelError(state.form);
  if (error) {
    failAction(["tel", { type: "error", text: error }]);
    return false;
  }
  clearMessage("tel");
  return true;
}
function checkAddress() {
  const error = checkAddressError(state.form);
  if (error) {
    failAction(["address", { type: "error", text: error }]);
    return false;
  }
  clearMessage("address");
  return true;
}

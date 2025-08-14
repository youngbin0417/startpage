let $root;

const state = {
  form: {
    officeName: "",
    agentName: "",
  },
  isEmpty: false,
  resultList: [],
};

export default {
  $root: null,
  init($searchBrokerModal) {
    $root = $searchBrokerModal;
    // 입력
    $searchBrokerModal.addEventListener("input", (e) => {
      if (e.target.closest(".office-name-input")) {
        state.form.officeName = e.target.value;
      }
      if (e.target.closest(".agent-name-input")) {
        state.form.agentName = e.target.value;
      }
    });

    // 검색
    $searchBrokerModal.addEventListener("click", (e) => {
      if (e.target.closest(".search-button")) {
        handleSubmit();
      }
    });
  },
};

function renderDOM() {
  const $emptyResultBox = $root.querySelector(".empty-result");
  const $resultList = $root.querySelector(".result");
  // API 응답결과에 따른 분기
  if (state.isEmpty) {
    $emptyResultBox.classList.add("show");
    $resultList.innerHTML = '';
  } else {
    $emptyResultBox.classList.remove("show");
    $resultList.innerHTML = state.resultList.map(
      (item, i) => /* html */ `
      <div class="result-item" data-index=${i}>
        <div class="broker-code">${item.brokerCode}</div>
        <div class="office-name">${item.officeName}</div>
        <div class="broker-name">${item.agentName}</div>
        <div class="address">${item.address}</div>
        <button aria-label="선택">선택</button>
      </div>
    `).join('');
  }
  $root.addEventListener('click', ({ target }) => {
    if (target.closest('.result-item button')) {
      handleSelected(target.closest('.result-item').dataset?.index);
    }
  })
}
async function handleSubmit() {
  state.resultList.splice(0, state.resultList.length);

  if (state.form.officeName === "" && state.form.agentName === "") {
    $toast.error("검색어를 입력해 주세요.");
    return;
  }

  // @@API 임시로 상가시세추정 API 사용
  const list = await fetch(
    `https://api.ohmyrealtor.com/v1/nsdi/ebbroker?companyName=${state.form.officeName}&brokerName=${state.form.agentName}`
  ).then((res) => res.json());

  state.resultList.push(
    ...list.map((v) => ({
      brokerCode: v.jurirno,
      officeName: v.bsnmCmpnm,
      agentName: v.brkrNm,
      address: v.ldCodeNm,
    }))
  );

  state.isEmpty = state.resultList.length === 0;

  renderDOM();
}

function handleSelected(index) {
  $eventBus.emit('setBroker', state.resultList[index]);
  closeModal();
}

function closeModal() {
  $root.classList.add('hide');
}

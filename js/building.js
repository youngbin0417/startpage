const toggleActive = (target, elName, activeClassName, isDuplicate) => {
  // 중복선택이 아닌 경우
  if (!isDuplicate) {
    const hasActive = document.querySelector(`.building-wrap ${elName}.${activeClassName}`);
    hasActive && hasActive.classList.remove(activeClassName);
  }
  target.closest(elName).classList.add(activeClassName);
};

const registerEvent = (el) => {
  el.addEventListener("click", (e) => {
    const target = e.target;
    // dropdown
    if (target.closest(".dropdown:not(.disabled)")) {
      target.closest(".dropdown").classList.toggle("active");
    }

    // type 선택
    if (target.closest(".type-wrap__item")) {
      toggleActive(target, ".type-wrap__item", "active");
    }

    // trade type 선택
    if (target.closest(".trade-type__item")) {
      toggleActive(target, ".trade-type__item", "active");
    }

    if (target.closest(".trade-wrap .simple-selector__item")) {
      toggleActive(target, ".trade-wrap .simple-selector__item", "active");
    }

    // 연립/다세대가 아닌 경우 (셀렉터 사용을 위해 구분)
    if (target.closest(".trade-types:not(.villa-multi) .trade-type")) {
      toggleActive(
        target,
        ".trade-types:not(.villa-multi) .trade-type",
        "active"
      );
    }


    // 연립/다세대인 경우 (셀렉터 사용을 위해 구분)
    if (target.closest(".trade-types.villa-multi .trade-type")) {
      toggleActive(target, ".trade-types.villa-multi .trade-type", "active");
    }

    // 임시 버튼 토글
    if (target.closest(".temp-estimate-toggle")) {
      document
        .querySelector(".estimate-wrap:not(.no-value)")
        .classList.toggle("hide");
      document
        .querySelector(".estimate-wrap.no-value")
        .classList.toggle("hide");
    }
    if (target.closest(".temp-trade-list-toggle")) {
      document.querySelector(".trade-list-no-value").classList.toggle("hide");
      document.querySelector(".trade-list-table").classList.toggle("hide");
    }

    // 매매/전세 동시일 경우 UI 분기
    if (target.closest(".trade-type__item")) {
      if (["매매", "전세"].includes(target.innerHTML)) {
        document
          .querySelector(".summary-box:not(.two-types)")
          .classList.remove("hide");
        document.querySelector(".summary-box.two-types").classList.add("hide");
      } else if (["매매/전세"].includes(target.innerHTML)) {
        document
          .querySelector(".summary-box:not(.two-types)")
          .classList.add("hide");
        document
          .querySelector(".summary-box.two-types")
          .classList.remove("hide");
      }
    }


    // 층정보 모형에서 사용하는 드롭다운 셀렉터
    if (target.closest(".dropdown-selector__button")) {
      target.closest(".dropdown-selector").classList.toggle("active");
    }
    if (target.closest(".floor-wrap .dropdown-selector__item")) {
      toggleActive(target, ".floor-wrap .dropdown-selector__item", "active");
    }

    // 세금컨설팅 모달
    if (target.closest(".estimate-button-box .tax-consulting-modal-button")) {
      document.querySelector(".tax-consulting-modal").classList.toggle("show");
    }

    // 절세플랜 모달
    if (target.closest(".estimate-button-box .plan-modal-button")) {
      document.querySelector(".plan-modal").classList.toggle("show");
    }
  });

  // 231024 추정가배너 이동 후 마우스 호버 이벤트시 노출되도록 수정
  el.addEventListener("mousemove", (e) => {
    const { target } = e;
    if (target.closest(".tab-title__help-icon")) {
      const $modal = document.querySelector(".estimate-help");
      if (!$modal.classList.contains("show")) {
        $modal.classList.add("show");
        const clientHeight = $modal.clientHeight;
        $modal.style.top = e.clientY - clientHeight;
      }
    } else {
      const $modal = document.querySelector(".estimate-help");
      $modal.classList.remove("show");
    }
  });
  // 231024 추정가배너 이동 후 마우스 호버 이벤트시 노출되도록 수정
};

// 연도 슬라이더
const setSlider = () => {
  var yearSlider = document.getElementById("year-slider");
  var yearForSlider = [2006, 2010, 2014, 2019, 2023]; // 16 values

  var format = {
    to: function (value) {
      return yearForSlider[Math.round(value)];
    },
    from: function (value) {
      return yearForSlider.indexOf(Number(value));
    },
  };

  noUiSlider.create(yearSlider, {
    start: [2006, 2019],
    // A linear range from 0 to 15 (16 values)
    range: { min: 0, max: yearForSlider.length - 1 },
    // steps of 1
    step: 1,
    connect: true,
    format: format,
    pips: { mode: "steps", stepped: true, density: 100, format: format },
  });
};

// 실거래정보 그래프
const setGraph = () => {
  var options = {
    series: [
      {
        data: ["20억", "23억", "30억", "38억", "30억", "30억", "19억", "25억"],
      },
    ],
    chart: {
      type: "area",
      height: 200,
      // width: 394,
      zoom: {
        enabled: false,
      },
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "straight",
    },
    xaxis: {
      categories: [
        "06년",
        "08년",
        "10년",
        "12년",
        "14년",
        "16년",
        "18년",
        "20년",
      ],
    },
    yaxis: {
      labels: {
        show: true,
        formatter: (value) => {
          return `${value}억`;
        },
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.9,
      },
    },
    tooltip: {
      custom: function ({ series, seriesIndex, dataPointIndex, w }) {
        return /*html */ `
          <div class="apexchart__tooltip">
            <div>${w.globals.categoryLabels[dataPointIndex]}</div>
            <div>평균: ${series[seriesIndex][dataPointIndex]}억</div>
          </div>
          `;
      },
    },
  };

  var chart = new ApexCharts(document.querySelector("#summary-chart"), options);
  chart.render();
};

// 매매/전세 실거래정보 그래프
const setTradeGraph = () => {
  var options = {
    series: [
      {
        name: "매매",
        color: "#ff8401",
        data: ["20억", "23억", "30억", "38억", "30억", "30억", "19억", "25억"],
      },
      {
        name: "전세",
        color: "#2ac1bc",
        data: ["10억", "23억", "28억", "35억", "26억", "25억", "14억", "20억"],
      },
    ],
    chart: {
      type: "line",
      height: 200,
      // width: 394,
      zoom: {
        enabled: false,
      },
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "straight",
    },
    xaxis: {
      categories: [
        "06년",
        "08년",
        "10년",
        "12년",
        "14년",
        "16년",
        "18년",
        "20년",
      ],
    },
    yaxis: {
      labels: {
        show: true,
        formatter: (value) => {
          return `${value}억`;
        },
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
    },
    tooltip: {
      enabled: false,
    },
  };

  var chart = new ApexCharts(
    document.querySelector("#two-types-summary-chart"),
    options
  );
  chart.render();
};

const init = (el) => {
  registerEvent(el);
  //setSlider();
  //setGraph();
  //setTradeGraph();
};

export default { init };

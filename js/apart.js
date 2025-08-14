const toggleActive = (target, elName, activeClassName, isDuplicate) => {
  // 중복선택이 아닌 경우
  if (!isDuplicate) {
    const hasActive = document.querySelector(`${elName}.${activeClassName}`);
    hasActive && hasActive.classList.remove(activeClassName);
  }
  target.classList.add(activeClassName);
};

const registerEvent = (el) => {
  el.addEventListener("click", (e) => {
    const target = e.target;

    if (target.closest(".location-wrap .simple-selector__item")) {
      toggleActive(target, ".location-wrap .simple-selector__item", "active");
    }

    if (target.closest(".dropdown")) {
      target.closest(".dropdown").classList.toggle("active");
    }
  });
};

// 공동주택가격 그래프
const setGraph = ($graph) => {
  var options = {
    series: [
      {
        color: "#2ac1bc",
        data: ["38억", "30억", "30억", "19억", "25억"],
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
      categories: ["19년", "20년", "21년", "22년"],
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
  };

  var chart = new ApexCharts($graph, options);
  chart.render();
};

const init = (el) => {
  registerEvent(el);
  // 집합건물
  const $graph_buliding = document.querySelector("#building-price-chart");
  setGraph($graph_buliding);
  // 공동주택
  const $graph = document.querySelector("#apart-price-chart");
  setGraph($graph);
};

export default { init };

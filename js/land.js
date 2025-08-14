// js/land.js 파일의 내용입니다.
function renderLandPriceChartAndTable(priceData) {
  if (!priceData || !Array.isArray(priceData) || priceData.length === 0) {
    document.getElementById('land-price-chart').innerHTML = '<div style="text-align:center; padding: 40px 0; color:#888;">표시할 공시지가 데이터가 없습니다.</div>';
    document.getElementById('land-price-table-body').innerHTML = '';
    return;
  }

  // --- 데이터 처리 ---
  // 1. 차트용 데이터: 최신순 7개를 잘라낸 후, 차트 표시를 위해 다시 시간순(오름차순)으로 정렬
  const chartData = [...priceData]
      .sort((a, b) => b.year - a.year) // 최신순 정렬
      .slice(0, 7)                     // 상위 7개 선택
      .sort((a, b) => a.year - b.year); // 다시 시간순 정렬

  // 2. 테이블용 데이터: 차트 데이터를 복사하여 최신순(내림차순)으로 정렬
  const tableData = [...chartData].sort((a, b) => b.year - a.year);

  // --- 테이블 생성 ---
  const tableBody = document.getElementById('land-price-table-body');

  // 테이블 내용을 완전히 새로 채웁니다. (헤더 + 데이터)
  let tableHtml = `
    <li class="general-table-item">
        <div class="general-table-item__content">기준연도</div>
        <div class="general-table-item__content">공시가격 (천원/㎡)</div>
    </li>
  `;

  tableHtml += tableData.map(item => `
    <li class="general-table-item data-row">
      <div class="general-table-item__content">${item.year}</div>
      <div class="general-table-item__content price-value">${item.price.toLocaleString()}</div>
    </li>
  `).join('');

  tableBody.innerHTML = tableHtml;

  // --- 차트 생성 ---
  const chartElement = document.getElementById('land-price-chart');
  if (!chartElement) {
    console.error("오류: #land-price-chart 요소를 찾을 수 없습니다.");
    return;
  }

  const options = {
    series: [{ name: '공시지가', data: chartData.map(item => item.price) }],
    chart: { type: 'bar', height: 200, toolbar: { show: false } },
    fill: {
      type: 'gradient',
      gradient: {
        type: "vertical", // 세로 방향
        shade: 'light',   // 밝은 톤을 기반으로

        // Stops(지점)을 이용한 직접 제어 방식
        // colorStops 배열에 각 지점의 색상과 투명도를 지정합니다.
        colorStops: [
          {
            offset: 0,            // 0% 지점 (막대의 맨 위)
            color: "#FA9595",     // 밝은 색
            opacity: 1
          },
          {
            offset: 100,          // 100% 지점 (막대의 맨 아래)
            color: "#F04C4C",     // 진한 기본 색
            opacity: 1
          }
        ]
      }
    },
    plotOptions: { bar: { borderRadius: 4, dataLabels: { position: 'top' } } },
    dataLabels: { enabled: true, offsetY: -20, style: { fontSize: '12px', colors: ["#304758"] } },
    xaxis: {
      categories: chartData.map(item => item.year),
      position: 'bottom',
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false }
    },
    yaxis: { labels: { show: false } },
    grid: { show: true, borderColor: '#f1f1f1', xaxis: { lines: { show: false } }, yaxis: { lines: { show: true } } },
    colors: ['#f87171'],
  };

  // 기존 차트가 있다면 파괴하고 새로 그리기
  chartElement.innerHTML = '';
  const chart = new ApexCharts(chartElement, options);
  chart.render();
}

// --- 기존 코드 (그대로 두거나 필요에 맞게 수정) ---
// ... setAnalysisGraph, registerEvent, init 함수들 ...
const registerEvent = (el) => {
  // ...
};

const init = (el) => {
  registerEvent(el);
};

export default {
  init,
  renderLandPriceChartAndTable
};
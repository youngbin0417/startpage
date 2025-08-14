var $commonUtil = {

  /**
   * 초기화
   */
  init: function() {
    this.adjustLayoutForDeviceOnLoad();
  },

  /**
   * 비동기 지연함수
   */
  fnDelay: function(sec) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(new Date().toISOString());
      }, sec * 10);
    });
  },

  /**
   * 빈값 스트링 처리
   * -> a가 빈값일때 b로 리턴 아니면 a리턴
   */
  fnInsteadString: function(a, b) {
    if (a == null || a == 'undefined' || a == '') {
      return b;
    } else {
      return a;
    }
  },

  /**
   * 0 스트링 처리
   * -> a가 0일때 b로 리턴 아니면 a리턴
   */
  fnInsteadInt: function(a, b, c) {
    if (a == 0 || a == '0') {
      return b;
    } else {
      return a + c;
    }
  },

  /**
   * 면적값에서 평수 구하기
   * (소수점 셋째자리에서 반올림 및 맨뒤 숫자 0인경우 제거)
   */
  fnAreaDivide: function(area) {
    let totAreaF = (area / 3.3).toFixed(2).toString(); // 숫자를 문자열로 변환

    // 소수점 이하 자리가 0으로 끝나는 경우 제외하고 표현
    if (totAreaF.includes('.') && totAreaF.endsWith('0')) {
      totAreaF = totAreaF.replace(/0+$/, ''); // 소수점 이하의 0 제거
      totAreaF = totAreaF.replace(/\.$/, ''); // 소수점이 끝에 위치하면 제거
    }

    return totAreaF;
  },

  /**
   * 개월수 사이 계산
   */
  fnMonthBetween: function(openDate, endDate) {
    // openDate와 endDate를 Date 객체로 변환
    const openDateObj = new Date(openDate.slice(0, 4), parseInt(openDate.slice(4)) - 1);
    const endDateObj = new Date(endDate.slice(0, 4), parseInt(endDate.slice(4)) - 1);

    // 월 간의 차이 계산
    const monthDiff = (endDateObj.getFullYear() - openDateObj.getFullYear()) * 12 + (endDateObj.getMonth() - openDateObj.getMonth());

    return monthDiff + '개월';
  },

  // URL에서 파라미터를 가져오는 함수
  fnGetParameterByName: function(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  },

  /**
   * 1000 단위 숫자 나누기
   */
  fnFormatNumber: function(number) {
    const numberString = number.toString();
    return numberString.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },

  /**
   * 반응형 레이아웃 조정 함수 (최종 버전)
   * 데스크톱 <-> 모바일 전환 시 하단 정보 패널의 위치를 동적으로 변경합니다.
   */
  adjustLayoutForDeviceOnLoad: function() {
    // --- 1. 필요한 요소들을 미리 찾아둡니다. ---
    const wholeTableWrapper = document.getElementById('whole-table-wrapper');
    const indexWrap = document.querySelector('.index-wrap');

    if (!wholeTableWrapper || !indexWrap) {
      console.warn("반응형 레이아웃 조정에 필요한 요소를 찾을 수 없습니다.");
      return;
    }

    // --- 2. 레이아웃을 변경하는 핵심 함수 ---
    const adjustLayoutForDevice = () => {
      const activeTabWrap = document.querySelector('.tab-wrap.show');
      const isMobile = window.innerWidth <= 800;

      if (isMobile) {
        // 모바일 상태일 때
        if (activeTabWrap) {
          // wrapper의 "직계" 부모가 activeTabWrap이 아닐 경우에만 이동
          if (wholeTableWrapper.parentElement !== activeTabWrap) {
            console.log("모바일 전환: #whole-table-wrapper를 .tab-wrap.show 안으로 이동");
            activeTabWrap.appendChild(wholeTableWrapper);
          }
        }
      } else {
        // 데스크톱 상태일 때
        // wrapper의 "직계" 부모가 .index-wrap이 아닐 경우에만 이동
        if (wholeTableWrapper.parentElement !== indexWrap) {
          console.log("데스크톱 전환: #whole-table-wrapper를 원래 위치(.index-wrap)로 복귀");
          indexWrap.appendChild(wholeTableWrapper);
        }
      }
    };

    // --- 3. 디바운스 및 이벤트 리스너 등록 ---
    let resizeTimer;
    const debouncedAdjustLayout = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(adjustLayoutForDevice, 150);
    };

    window.addEventListener('load', () => {
      adjustLayoutForDevice();

      const observer = new MutationObserver(() => {
        debouncedAdjustLayout();
      });

      const allTabWraps = document.querySelectorAll('.tab-wrap');
      allTabWraps.forEach(tab => observer.observe(tab, { attributes: true, attributeFilter: ['class'] }));
    });

    window.addEventListener('resize', debouncedAdjustLayout);
  }
};
$(function() {
  $commonUtil.init();
});
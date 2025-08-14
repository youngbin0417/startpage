var $realtySearch = {
  pano: null,
  panoMarker: null,
  /**
   * 초기화
   */
  init: function() {
    kakao.maps.event.addListener(map, 'click', $realtySearch.fnMainClickEvtClick);

    $realtySearch.value.foldButton = document.querySelector('.favorable-wrap .fold-button');
    $realtySearch.value.favorableWrap = document.querySelector('.favorable-wrap');
    $realtySearch.value.favorableButton = document.querySelector('#temp-favorable');
    $realtySearch.value.closeButton = document.querySelector('.favorable-wrap .header__btn');
    $realtySearch.value.buildingFoldButton = document.querySelector('.building-wrap .fold-button');
    $realtySearch.value.buildingWrap = document.querySelector('.building-wrap');
    $realtySearch.value.buildingButton = document.querySelector('#temp-building');
    $realtySearch.value.buildingCloseButton = document.querySelector('.building-wrap .header__btn');
    $realtySearch.value.landFoldButton = document.querySelector('.land-wrap .fold-button');
    $realtySearch.value.landWrap = document.querySelector('.land-wrap');
    $realtySearch.value.landButton = document.querySelector('#temp-land');
    $realtySearch.value.landCloseButton = document.querySelector('.land-wrap .header__btn');
    $(document).on('click.realty', '.realty-item-link', function(e) {
      e.preventDefault(); // a 태그의 기본 동작(페이지 이동 등)을 막습니다.

      const $this = $(this); // 클릭된 jQuery 객체
      const originalIndex = $this.data('original-index');

      const lat = $this.data('lat');
      const lng = $this.data('lng');
      // HTML에 심어둔 원본 리스트의 인덱스를 가져옵니다.

      // 1. 지도 이동
      if (lat && lng) {
        const moveCoords = new kakao.maps.LatLng(lat, lng);
        map.panTo(moveCoords);
      }
      // 2. 상세 정보 팝업 표시 (가장 중요!)
      // originalIndex가 유효한 경우, fnOnRealtyDetail 함수를 호출합니다.
      if (originalIndex !== undefined) {
        // fnOnRealtyDetail 함수는 이제 원본 리스트의 인덱스를 받습니다.
        $realtySearch.fnOnRealtyDetail(originalIndex);
      }
    });
    // 추정가 마우스오버 이벤트
    $(document).on('mousemove', function(e) {
      const target = $(e.target);
      if (target.closest('.tab-title__help-icon').length) {
        const $modal = $('.estimate-help');
        if (!$modal.hasClass('show')) {
          $modal.addClass('show');
          const clientHeight = $modal.outerHeight();
          $modal.css('top', e.clientY - clientHeight + 'px');
        }
      } else {
        $('.estimate-help').removeClass('show');
      }
    });
              // 초기화
    $realtySearch.value.marker = new kakao.maps.Marker({});
  },

  value: {
    currentTradeList: [],
    latlng: null,
    marker: null,
    realty: {
      mapAddr: '',
      newAddr: ''
    },
    dongList: [],
    hoList: null,
    brSubJiBunList: [],
    chart: null,
    currentIndex: 0,
    legendTemp: [],
    realChartDataTemp: [],
    polygonMarker: [],

    subJiBunListMap: [],
    subPnu: '',
    brTitleList: [],

    contentMarkers: [],
    mapKind: '',
    realtyList: [],
    noticeAmt: '',

    foldButton: null,
    favorableWrap: null,
    favorableButton: null,
    closeButton: null,
    buildingFoldButton: null,
    buildingWrap: null,
    buildingButton: null,
    buildingCloseButton: null,
    landFoldButton: null,
    landWrap: null,
    landButton: null,
    landCloseButton: null,

    landPriceChart: null,

    dong: '',
    ho: '',
    price: '',
    transactionKey: '',

    // 주변지역 계산하기위한 변수
    kind7: [],
    kind9: [],
    kind10: [],
    kind: ''

  },

  _renderTradeTable: function(listToRender) {
    const $header = $('#trade-list-header');
    const $body = $('#trade-list-body');

    // 초기화
    $header.empty();
    $body.empty();

    // 헤더 생성
    const headerHtml = '<tr><th>거래일</th><th>거래</th><th>가격</th><th>거리</th></tr>';
    $header.html(headerHtml);

    // 테이블 본문 생성
    listToRender.forEach((item, index) => {
      // ★★★ 데이터로 고유 ID 생성 (계약년월+계약일+거래가격 조합 등) ★★★
      const uniqueId = `${item.contractYm}-${item.contractDate}-${item.tradePrice}`;

      const dealDate = item.contractYm.slice(2, 4) + '.' + item.contractYm.slice(4, 6) + '.' + String(item.contractDate).padStart(2, '0');
      const dealPrice = $realtySearch.fnPriceFinal(item.tradePrice * 10000);

      // ★★★ id에 index 대신 uniqueId를 사용 ★★★
      let distanceCell = `<td>-</td>`; // 기본값
      if (item.distance !== undefined && item.coords) {
        // 정보가 있으면 a 태그를 생성합니다.
        const distanceLink = `<a href="#" class="realty-item-link" data-original-index="${item.originalIndex}" data-lat="${item.coords.getLat()}" data-lng="${item.coords.getLng()}">${item.distance}m</a>`;
        distanceCell = `<td>${distanceLink}</td>`;
      }

      const rowHtml = `
            <tr id="tradeRow_${uniqueId}">
                <td>${dealDate}</td>
                <td>매매</td>
                <td class="price">${dealPrice}</td>
                ${distanceCell} 
            </tr>
        `;
      $body.append(rowHtml);
    });
  },
  /**
   * [메인 함수] 실거래가 목록을 렌더링하고, 반응형 로직을 설정하는 함수
   */
  fnRenderTradeList: function(tradeList) {
    // --- ★★★ 2. 데이터 처리 및 UI 제어 로직 수정 ★★★ ---
    const $noData = $('#no-trade-data');
    const $tableContainer = $('.trade-table-container');

    if (!tradeList || tradeList.length === 0) {
      $noData.show();
      $tableContainer.hide();
      this.value.currentTradeList = []; // 데이터가 없으면 저장된 목록도 비움
      return;
    }
    $noData.hide();
    $tableContainer.show();

    // 전체 목록을 전역 변수에 저장
    this.value.currentTradeList = tradeList;

    // --- ★★★ 3. 화면 크기에 따라 렌더링하는 함수 정의 ★★★ ---
    const updateRender = () => {
      const isMobile = window.innerWidth <= 800;
      const fullList = this.value.currentTradeList;
      const dataToRender = isMobile ? fullList.slice(0, 5) : fullList;

      // 실제 그리는 함수 호출
      this._renderTradeTable(dataToRender);
    };

    // --- ★★★ 4. resize 이벤트 리스너 등록 (최초 1회만) ★★★ ---
    // 이미 리스너가 등록되었다면, 다시 등록하지 않도록 방지
    if (!this.value.tradeListResizeListener) {
      // 디바운스 적용
      const debouncedUpdate = this._debounce(updateRender, 250);
      window.addEventListener('resize', debouncedUpdate);

      // 리스너가 등록되었다는 사실을 기록
      this.value.tradeListResizeListener = true;
    }

    // --- 5. 최초 렌더링 실행 ---
    updateRender();
  },

  _debounce: function(func, delay) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  },
  /**
   * ★★★ [추가] 정보 카드 UI를 깨끗하게 초기화하는 함수 ★★★
   */
  fnClearInfoCards: function() {
    $('#whole-table .info-box').show();

    // 토지 정보 카드 초기화
    $('#left-land .info-value').text('-'); // 모든 값을 '-'로 초기화
    $('#left-land #building-info-grid').hide();
    $('#left-land #no-building-info').hide();

    // 건물 정보 카드 초기화
    $('#center-building .info-value').text('-');
    $('#center-building #building-info-grid').show(); // 그리드는 기본적으로 보이게
    $('#center-building #no-building-info').hide();  // "정보 없음"은 숨김

    // 실거래 정보 카드 초기화 (예시)
    $('#trade-list-header').empty(); // 테이블 헤더 내용 비우기
    $('#trade-list-body').empty();   // 테이블 바디(데이터 목록) 내용 비우기

    $('.trade-table-container').show(); // 테이블을 감싸는 컨테이너는 다시 보이게
    $('#no-trade-data').hide();         // "데이터 없음" 안내문은 숨기기
  },

  /*
     * 지도 물건검색 이벤트 추가
     */
  fnMainClickEvtClick: function(mouseEvent, handler) {
    // 기존 클릭 초기화
    $realtySearch.value.marker.setMap(null);
    $realtySearch.value.polygonMarker.forEach((element) => {
      element.setMap(null);
    });
    $realtySearch.value.polygonMarker = [];
    $realtySearch.value.contentMarkers.forEach((element) => {
      element.setMap(null);
    });
    $realtySearch.value.contentMarkers = [];
    $realtySearch.value.hoList = null;
    $realtySearch.value.dong = '';
    $realtySearch.value.ho = '';

    $mainFunction.fnSearchDetailAddrFromCoords(mouseEvent.latLng, function(result, status) {
      if (status === kakao.maps.services.Status.OK) {
        // 클릭한 위도, 경도, 지도레벨 정보를 가져옵니다
        $realtySearch.value.latlng = mouseEvent.latLng;

        $realtySearch.value.marker = new kakao.maps.Marker({
          // 지도 중심좌표에 마커를 생성합니다
          position: map.getCenter()
        });

        $realtySearch.value.marker.setMap(map);
        map.setLevel(3);

        // 지도의 중심을 결과값으로 받은 위치로 이동시킵니다
        map.panTo(mouseEvent.latLng);

        // 마커 위치를 클릭한 위치로 옮깁니다
        $realtySearch.value.marker.setPosition($realtySearch.value.latlng);
        $realtySearch.value.realty.newAddr = !!result[0].road_address ? result[0].road_address.address_name : '';
        $realtySearch.value.realty.mapAddr = result[0].address.address_name;

        $realtySearch.fnAvmCalcul(result[0].address.address_name, '');
      }
    });
  },

  // 좌표로 주소검색 하기
  fnSearchAddr: function(thiz) {
    // 기존 클릭 초기화
    $realtySearch.value.marker.setMap(null);
    $realtySearch.value.polygonMarker.forEach((element) => {
      element.setMap(null);
    });
    $realtySearch.value.polygonMarker = [];
    $realtySearch.value.contentMarkers.forEach((element) => {
      element.setMap(null);
    });
    $realtySearch.value.contentMarkers = [];
    $realtySearch.value.hoList = null;
    $realtySearch.value.dong = '';
    $realtySearch.value.ho = '';

    //모바일 검색 후 창 제거
    $('.panel-wrap').addClass('hide');

    let addr = '';
    if (thiz == null || thiz == '' || thiz == 'undefined') {
      addr = $('.map_srch').val();
    } else {
      addr = $(thiz).val();
    }

    $mainFunction.value.geocoder.addressSearch(addr, function(result, status) {
      // 정상적으로 검색이 완료됐으면
      if (status === kakao.maps.services.Status.OK) {
        const coords = new kakao.maps.LatLng(result[0].y, result[0].x);

        // 결과값으로 받은 위치를 마커로 표시합니다
        $realtySearch.value.marker = new kakao.maps.Marker({
          map: map,
          position: coords
        });

        $realtySearch.value.marker.setMap(map);
        map.setLevel(3);

        // 지도의 중심을 결과값으로 받은 위치로 이동시킵니다
        map.panTo(coords);

        // 주소정보 가져오기
        $mainFunction.fnSearchDetailAddrFromCoords(coords, function(result, status) {
          if (status === kakao.maps.services.Status.OK) {
            $realtySearch.fnAvmCalcul(result[0].address.address_name, '');
            $realtySearch.value.realty.newAddr = !!result[0].road_address ? result[0].road_address.address_name : '';
          }
        });

        $realtySearch.value.latlng = coords;
        $realtySearch.value.realty.mapAddr = result[0].address.address_name;
        $('.nav-wrap__search').removeClass('active');
      } else {
        // 입력한 값이 지하철, 지역명인 경우 해당 위치로 이동하고 반환
        ps.keywordSearch(addr, function(data, status, pagination) {
          if (status === kakao.maps.services.Status.OK) {
            const placePosition = new kakao.maps.LatLng(data[0].y, data[0].x);
            map.panTo(placePosition);
          } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
            $toast.error('검색 결과가 존재하지 않습니다.');
          } else if (status === kakao.maps.services.Status.ERROR) {
            $toast.error('검색 결과 중 오류가 발생했습니다.');
          }
        });
      }
    });
  },

  // 물건검색 메인로직
  fnAvmCalcul: function() {
    $realtySearch.fnJibunLayer($realtySearch.value.realty.mapAddr);
    $realtySearch.fnBuildInfo($realtySearch.value.realty.mapAddr);
  },

  /**
   * 클릭한 지번 경계 표시하기
   */
  fnJibunLayer: function(addr) {
    $.ajax({
      type: 'POST',
      url: '/real/jibunLayer',
      traditional: true,
      cache: false,
      data: { 'addr': addr },
      dataType: 'JSON',
      beforeSend: function(xhr) {
        // const token = $("#_csrf").val();
        // const header = $("#_csrf_header").val();
        // xhr.setRequestHeader(header, token);
      },
      success: function(rtn) {
        if (rtn.result == 1) {
          let polygonPath = [];
          let hole = [];

          let a = '';
          let b = '';
          let key = 0;

          // 다각형을 구성하는 좌표 배열입니다. 이 좌표들을 이어서 다각형을 표시합니다
          const resultLayout = async (rtnTemp) => {
            for (let k = 0; k < rtnTemp.stdLatitudeListArr.length; k++) {
              await $commonUtil.fnDelay(1)
                .then(() => {
                  polygonPath = [];
                  // 다각형을 구성하는 좌표 배열입니다. 이 좌표들을 이어서 다각형을 표시합니다
                  key = 0;
                  for (let i = 0; i < rtnTemp.stdLatitudeListArr[k].length; i++) {
                    if (a == rtnTemp.stdLatitudeListArr[k][i] && b == rtnTemp.stdLongitudeListArr[k][i]) {
                      key = i + 1;
                      if (i == rtnTemp.stdLatitudeListArr[k].length - 1) {
                        polygonPath.push(hole);
                        hole = [];
                        break;
                      } else {
                        polygonPath.push(hole);
                        hole = [];
                        continue;
                      }
                    }
                    if (i == key) {
                      a = rtnTemp.stdLatitudeListArr[k][i];
                      b = rtnTemp.stdLongitudeListArr[k][i];
                    }
                    hole[hole.length] = new kakao.maps.LatLng(rtnTemp.stdLatitudeListArr[k][i], rtnTemp.stdLongitudeListArr[k][i]);
                  }

                  const path = rtn.stdLatitudeListArr[0].map((lat, i) =>
                    new kakao.maps.LatLng(lat, rtn.stdLongitudeListArr[0][i])
                  );

                  const polygon = new kakao.maps.Polygon({
                    path: [path],
                    strokeWeight: 3,
                    strokeColor: '#beaefc',
                    strokeOpacity: 0.8,
                    strokeStyle: 'solid',
                    fillColor: '#dbd5ff',
                    fillOpacity: 0.7
                  });

                  // 지도에 다각형을 표시합니다
                  polygon.setMap(map);
                  $realtySearch.value.polygonMarker.push(polygon);
                });
            }
          };

          resultLayout(rtn);

          $realtySearch.value.brSubJiBunList = [];

          if (rtn.brSubJiBunList.length != 0) {
            for (let i = 0; i < rtn.brSubJiBunList.length; i++) {
              if (rtn.brSubJiBunList[i].ji == '') {
                $realtySearch.value.brSubJiBunList.push(Number(rtn.brSubJiBunList[i].subBun));
              } else {
                $realtySearch.value.brSubJiBunList.push(Number(rtn.brSubJiBunList[i].subBun) + '-' + Number(rtn.brSubJiBunList[i].subJi));
              }
            }
          }
        } else {
          console.log('지번경계 출력 이상');
        }
      },
      error: function(request, status, rtn) {
        console.log('code:' + request.status + '\n' + 'message:' + request.responseText + '\n' + 'error:' + rtn);
      }
    });
  },

  /**
   * 해당 주소 토지, 건물 정보 가져오기
   */
  fnBuildInfo: function(addr) {
    $eventBus.emit('loadingOn');
    $commonMap.fnLayoutInit();
    $('#whole-table-wrapper').removeClass('show');
    $realtySearch.fnClearInfoCards();
    $realtySearch.value.subJiBunListMap = [];
    $realtySearch.value.subPnu = '';
    $realtySearch.value.realtyList = [];
    $realtySearch.value.transactionKey = '';

    if ($realtySearch.value.dong == '본동') {
      $realtySearch.value.dong = '';
    }

    $.ajax({
      type: 'POST',
      url: '/real/buildInfo',
      traditional: true,
      cache: false,
      data: {
        'addr': addr,
        'dong': $realtySearch.value.dong,
        'ho': $realtySearch.value.ho
      },
      dataType: 'JSON',
      beforeSend: function(xhr) {
        // const token = $("#_csrf").val();
        // const header = $("#_csrf_header").val();
        // xhr.setRequestHeader(header, token);
      },
      success: function(rtn) {
        let chart;
        let options;
        if (rtn.buildMap.result != 1 && rtn.buildMap.result != 304) {
          // $toast.error('조회할 수 없는 물건입니다.');
          return false;
        }

        if (rtn.result == 1) {
          //					console.log(rtn.addrMap);
          //					console.log(rtn.buildMap);
          //					console.log(rtn.realMap);

          $realtySearch.value.mapKind = rtn.buildMap.mapKind;

          // 1. 필지별 info 세팅
          if (rtn.buildMap.mapKind == 0 || rtn.buildMap.mapKind == 1) {
            if (rtn.buildMap.mapKind != 0) {
              $('#land-header-1').text($commonUtil.fnInsteadString(rtn.buildMap.build.brTitleList[0].bldNm, ''));
              $('#navi1').show();
            } else {
              $('#land-header-1').text('');
              $('#navi1').hide();
            }
            if (rtn.addrMap && rtn.addrMap.addr) {
              $('#land-header-2').text(rtn.addrMap.addr).show();
            } else {
              $('#land-header-2').hide();
            }
            if ($realtySearch.value.realty && $realtySearch.value.realty.newAddr &&  !($realtySearch.value.realty.newAddr == '')) {
              $('#land-header-3').text('(' + $realtySearch.value.realty.newAddr + ')').show();
            } else {
              $('#land-header-3').hide();
            }

            $realtySearch.fnInitNaverPano($realtySearch.value.latlng.Ma, $realtySearch.value.latlng.La, 'road-view2');
            // naver.maps.onJSContentLoaded = $realtySearch.fnInitNaverPano;

            if (rtn.buildMap.mapKind != 0) {
              $('#land-body1-1').text($commonUtil.fnInsteadString(rtn.buildMap.build.brTitleList[0].bldNm, ''));
            } else {
              $('#land-body1-1').text('');
            }

            $('#land-body1-2').html('');
            $('#land-body1-3').html('<i class="fas fa-home"></i>토지 ' + (rtn.buildMap.land.tArea * 3.3).toFixed(2) + '㎡(' + (rtn.buildMap.land.subJiBunListMap.length + 1) + '필지)ㆍ' + rtn.buildMap.land.spfc + 'ㆍ' + rtn.buildMap.land.landUse + 'ㆍ' + rtn.buildMap.land.jimok);
            if (rtn.buildMap.mapKind != 0) {
              $('#land-body1-4').html('<i class="fas fa-layer-group"></i>건물 ' + rtn.buildMap.build.brTitleList.length + '개동ㆍ' + rtn.buildMap.build.brTitleList.reduce((acc, curr) => acc + Number(curr.fmlyCnt), 0) + '세대ㆍB' + rtn.buildMap.build.brTitleList[0].ugrndFlrCnt + '/' + rtn.buildMap.build.brTitleList[0].grndFlrCnt + '층ㆍ' + rtn.buildMap.build.brTitleList[0].useAprDay.slice(0, 4) + '년');
              $('#land-body1-4').show();
            } else {
              $('#land-body1-4').html('');
              $('#land-body1-4').hide();
            }

            $('#land-body4-1').text(rtn.buildMap.land.jimok);
            $('#land-body4-2').text((rtn.buildMap.land.tAreaF * 3.3).toFixed(2) + '㎡');
            $('#land-body4-3').text(rtn.buildMap.land.landUse);
            $('#land-body4-4').text(rtn.buildMap.land.spfc);
            $('#land-body4-5').text(rtn.buildMap.land.geoHl);
            $('#land-body4-6').text(rtn.buildMap.land.geoForm);
            $('#land-body4-7').text(rtn.buildMap.land.roadSide);

            const pnu = rtn.addrMap.pnu;

            $('#land-body4-8').attr('href', 'http://www.eum.go.kr/web/ar/lu/luLandDet.jsp?selSido=' + pnu.substring(0, 2) + '&selSgg=' + pnu.substring(2, 5) + '&selUmd=' + pnu.substring(5, 9) + '&selRi=' + pnu.substring(8, 10) + '&landGbn=' + pnu.substring(10, 11) + '&bobn=' + String(parseInt(pnu.substring(11, 15))) + '&bubn=' + String(parseInt(pnu.substring(15, 19))) + '&pnu=' + pnu + '&scale=&isNoScr=script&chk=0&mode=search&selGbn=umd');

            let subJiBun = '';
            if (rtn.buildMap.land.subJiBunListMap.length != 0) {
              $realtySearch.value.subJiBunListMap = rtn.buildMap.land.subJiBunListMap;

              for (let i = 0; i < rtn.buildMap.land.subJiBunListMap.length; i++) {
                subJiBun += '<div class="general-table-item__content clickable" onclick="$realtySearch.fnSubJiBunSh(' + i + ')">';
                subJiBun += rtn.buildMap.land.subJiBunListMap[i].subJibun;
                subJiBun += '</div>';
              }
            } else {
              subJiBun = '-';
            }

            $('#land-body4-9').html(subJiBun);

            if (rtn.buildMap.mapKind == 1) { // '토지건물' 탭일 경우 건물 정보 처리

              // 1. 데이터 유무 확인
              const buildingList = rtn.buildMap.build ? rtn.buildMap.build.brTitleList : null;

              if (!buildingList || buildingList.length === 0) {
                // 2. 건물 데이터가 없는 경우 처리
                $('#center-building #building-info-grid').hide();
                $('#center-building #no-building-info').show();
              } else {
                // 3. 건물 데이터가 있는 경우 처리
                $('#center-building #building-info-grid').show();
                $('#center-building #no-building-info').hide();

                // 4. 대표 건물 정보(첫 번째 항목)를 변수에 저장
                const mainBuilding = buildingList[0];

                // 5. 데이터를 그리드에 채워넣기
                $('#land-body7-2').text($commonUtil.fnInsteadInt((mainBuilding.platAreaF * 3.3).toFixed(2), '-', '㎡'));
                $('#land-body7-3').text(mainBuilding.mainPurpsCdNm);
                $('#land-body7-4').text($commonUtil.fnInsteadString(mainBuilding.useAprDay, '-'));
                $('#land-body7-5').text(mainBuilding.strctCdNm);
                $('#land-body7-6').text(mainBuilding.roofCdNm);
                $('#land-body7-7').text((mainBuilding.totAreaF * 3.3).toFixed(2) + ' ㎡');
                $('#land-body7-8').text('지하' + mainBuilding.ugrndFlrCnt + '층/지상' + mainBuilding.grndFlrCnt + '층');
                $('#land-body7-9').text($commonUtil.fnInsteadInt(mainBuilding.vlRat, '-', '%'));
                $('#land-body7-11').text($commonUtil.fnInsteadInt(mainBuilding.bcRat, '-', '%'));

                // 주차, 엘리베이터 정보 계산
                let elvt = '-';
                let utcnt = '-';
                if (mainBuilding.rideUseElvtCnt != 0 || mainBuilding.emgenUseElvtCnt != 0) {
                  elvt = Number(mainBuilding.rideUseElvtCnt) + Number(mainBuilding.emgenUseElvtCnt) + '대';
                }
                if (mainBuilding.indrMechUtcnt != 0 || mainBuilding.oudrMechUtcnt != 0) {
                  const cnt = Number(mainBuilding.indrMechUtcnt) + Number(mainBuilding.oudrMechUtcnt);
                  utcnt = '기계식 ' + cnt + '대';
                }
                if (mainBuilding.indrAutoUtcnt != 0 || mainBuilding.oudrAutoUtcnt != 0) {
                  const cnt = Number(mainBuilding.indrAutoUtcnt) + Number(mainBuilding.oudrAutoUtcnt);
                  if (utcnt == '-') {
                    utcnt = '자주식 ' + cnt + '대';
                  } else {
                    utcnt += ', 자주식 ' + cnt + '대';
                  }
                }
                $('#land-body7-12').text(utcnt);
                $('#land-body7-13').text(elvt);
              }
            }
          } else {
            const buildInfo = rtn.buildMap.build;
            const landInfo = rtn.buildMap.land;
            if (rtn.realMap.result == 304) {
              $('#build-header-1').text('');
            } else {
              $('#build-header-1').text($commonUtil.fnInsteadString(rtn.buildMap.build.bldNm, ''));
            }
            $('#build-header-2').text(rtn.addrMap.addr);
            if ($realtySearch.value.realty && $realtySearch.value.realty.newAddr && !($realtySearch.value.realty.newAddr == '')) {
              $('#build-header-3').text('(' + $realtySearch.value.realty.newAddr + ')').show();
            } else {
              $('#build-header-3').hide();
            }

            if (rtn.realMap.result == 304) {
              $('.building-wrap').addClass('show');

              // 동, 호수 데이터 넣기
              $realtySearch.value.dongList = rtn.buildMap.build.dongList;
              $realtySearch.value.hoList = rtn.buildMap.build.dongHoMap;
              $realtySearch.value.dong = $realtySearch.value.dongList[0];

              let firstDong = $realtySearch.value.dongList[0];
              let firstHoList = $realtySearch.value.hoList[firstDong];

              $('#build-header-4_1').html('<div>' + firstDong + '</div><i class="fas fa-caret-down"></i><i class="fas fa-caret-up"></i>');

              if (firstHoList && firstHoList.length > 0) { // firstHoList가 존재하고 비어있지 않다면
                $('#build-header-5_1').html(firstHoList[0] + '<i class="fas fa-caret-down"></i><i class="fas fa-caret-up"></i>');
              } else {
                $('#build-header-5_1').html('-<i class="fas fa-caret-down"></i><i class="fas fa-caret-up"></i>'); // 또는 적절한 기본값 표시
              }
              let dongHtm = '';
              let hoHtm = '';

              for (let i = 0; i < $realtySearch.value.dongList.length; i++) {
                dongHtm += '<div class="dropdown-item" onclick="$realtySearch.fnUpdateHoList(\'' + $realtySearch.value.dongList[i] + '\')">' + $realtySearch.value.dongList[i] + '</div>';
              }

              if (firstHoList && firstHoList.length > 0) {
                for (let i = 0; i < firstHoList.length; i++) {
                  hoHtm += '<div class="dropdown-item" onclick="$realtySearch.fnSelectHoList(\'' + firstHoList[i] + '\')">' + firstHoList[i] + '</div>';
                }
              } else {
                hoHtm += '<div class="dropdown-item">호수 없음</div>';
              }

              $('#build-header-4').html(dongHtm);
              $('#build-header-5').html(hoHtm);

              let dongList = '';
              for (let i = 0; i < $realtySearch.value.dongList.length; i++) {
                if (i == 0) {
                  dongList += '<li class="dropdown-selector__item active" name="dong_list_li_403" onclick="$realtySearch.fnUpdateHoIcoList(\'' + $realtySearch.value.dongList[i] + '\', 403, $(this))">' + $realtySearch.value.dongList[i] + '</li>';
                } else {
                  dongList += '<li class="dropdown-selector__item" name="dong_list_li_403" onclick="$realtySearch.fnUpdateHoIcoList(\'' + $realtySearch.value.dongList[i] + '\', 403, $(this))">' + $realtySearch.value.dongList[i] + '</li>';
                }
              }

              $('#build-403-body4-2').html('');

              let icoHtm = '';
              icoHtm = '</div>' + icoHtm;
              icoHtm = '<div class="building-structure__ho empty"></div>' + icoHtm;
              icoHtm = '<div class="building-structure__ho empty"></div>' + icoHtm;
              icoHtm = '<div class="building-structure__ho empty"></div>' + icoHtm;
              icoHtm = '<div class="building-structure__ho empty"></div>' + icoHtm;
              icoHtm = '<div class="building-structure__ho empty"></div>' + icoHtm;
              icoHtm = '<div class="building-structure__floor">' + icoHtm;

              for (let i = 0; i < $realtySearch.value.hoList[$realtySearch.value.dongList[0]].length; i += 5) {
                icoHtm = '</div>' + icoHtm;

                for (let j = 0; j < 5; j++) {
                  let className = '';

                  if (i >= 5) {
                    className = 'blue_' + Math.floor(i / 5);
                  }
                  if (i + j > $realtySearch.value.hoList[$realtySearch.value.dongList[0]].length - 1) {
                    icoHtm = '<div class="building-structure__ho none"></div>' + icoHtm;
                  } else {
                    const name = $realtySearch.value.hoList[$realtySearch.value.dongList[0]][i + j].split('(')[0].trim();
                    icoHtm = '<div class="building-structure__ho blue_1 ' + className + '">' + name + '</div>' + icoHtm;
                  }
                }

                icoHtm = '<div class="building-structure__floor">' + icoHtm;
              }

              $('#build-403-body4-1').html(dongList);
              $('#build-403-body4-2').html(icoHtm);

              dongList = '';
              for (let i = 0; i < $realtySearch.value.dongList.length; i++) {
                if (i == 0) {
                  dongList += '<li class="dropdown-selector__item active" name="dong_list_li_1" onclick="$realtySearch.fnUpdateHoIcoList(\'' + $realtySearch.value.dongList[i] + '\', 1, $(this))">' + $realtySearch.value.dongList[i] + '</li>';
                } else {
                  dongList += '<li class="dropdown-selector__item" name="dong_list_li_1" onclick="$realtySearch.fnUpdateHoIcoList(\'' + $realtySearch.value.dongList[i] + '\', 1, $(this))">' + $realtySearch.value.dongList[i] + '</li>';
                }
              }

              $('#build-1-body4-1').html(dongList);
              $('#build-1-body4-2').html(icoHtm);
              $('#build-info-403').show();
              return false;
            }

            // $('#build-body0').show();

                        // $realtySearch.fnInitNaverPano($realtySearch.value.latlng.Ma, $realtySearch.value.latlng.La, 'road-view3');
            //naver.maps.onJSContentLoaded = $realtySearch.fnInitNaverPano;

            $('#build-body1-1').text($commonUtil.fnInsteadString(rtn.buildMap.build.bldNm, '-'));
            $('#build-body1-2').html('<i class="fas fa-map-marker-alt"></i>선릉역 (2호선ㆍ분당선) 도보 5분');
            $('#build-body1-3').html('<i class="fas fa-home"></i>토지 ' + (rtn.buildMap.land.tArea * 3.3).toFixed(2) + '㎡(' + (rtn.buildMap.land.subJiBunListMap.length + 1) + '필지)ㆍ' + rtn.buildMap.land.spfc + 'ㆍ' + rtn.buildMap.land.landUse + 'ㆍ' + rtn.buildMap.land.jimok);
            $('#build-body1-4').html('<i class="fas fa-layer-group"></i>건물 ' + $realtySearch.value.dongList.length + '개동ㆍ' + rtn.buildMap.build.hhldCnt + '세대ㆍB' + rtn.buildMap.build.ugrndFlrCnt + '/' + rtn.buildMap.build.grndFlrCnt + '층ㆍ' + rtn.buildMap.build.useAprDay.slice(0, 4) + '년');

            // 부동산 정보
            const pnu = rtn.addrMap.pnu;

            $('#build-body4-1').attr('href', 'http://www.eum.go.kr/web/ar/lu/luLandDet.jsp?selSido=' + pnu.substring(0, 2) + '&selSgg=' + pnu.substring(2, 5) + '&selUmd=' + pnu.substring(5, 9) + '&selRi=' + pnu.substring(8, 10) + '&landGbn=' + pnu.substring(10, 11) + '&bobn=' + String(parseInt(pnu.substring(11, 15))) + '&bubn=' + String(parseInt(pnu.substring(15, 19))) + '&pnu=' + pnu + '&scale=&isNoScr=script&chk=0&mode=search&selGbn=umd');
            $('#build-body4-2').text($commonUtil.fnInsteadString(rtn.buildMap.build.bldNm, '-'));
            $('#build-body4-3').text(rtn.buildMap.build.mainPurpsCdNm);
            $('#build-body4-4').text(rtn.buildMap.build.area + '㎡');
            $('#build-body4-5').text(rtn.buildMap.build.allArea + '㎡');
            $('#build-body4-6').text(rtn.buildMap.build.strctCdNm);
            $('#build-body4-7').text('지하' + rtn.buildMap.build.ugrndFlrCnt + '층 / 지상' + rtn.buildMap.build.grndFlrCnt + '층');
            $('#build-body4-8').text(rtn.buildMap.build.hhldCnt + '세대(해당동)');

            const useAprDay = rtn.buildMap.build.useAprDay;

            if (!useAprDay || useAprDay.length < 4) {
            } else {
              const year = parseInt(useAprDay.substring(0, 4), 10);
              const currentYear = new Date().getFullYear();

              if (year === currentYear) {
                $('#build-second-24').text('분양가 권리분석 보고서');
                $('#build-second-25').text('분양가');
              }
            }

            $('#build-body4-9').text(rtn.buildMap.build.useAprDay);

            let elvt = '-';
            let utcnt = '-';
            if (rtn.buildMap.build.rideUseElvtCnt != 0 || rtn.buildMap.build.emgenUseElvtCnt != 0) {
              elvt = Number(rtn.buildMap.build.rideUseElvtCnt) + Number(rtn.buildMap.build.emgenUseElvtCnt);
              elvt += '대';
            }

            if (rtn.buildMap.build.indrMechUtcnt != 0 || rtn.buildMap.build.oudrMechUtcnt != 0) {
              const cnt = Number(rtn.buildMap.build.indrMechUtcnt) + Number(rtn.buildMap.build.oudrMechUtcnt);
              utcnt = '기계식 ' + cnt + '대';
            }

            if (rtn.buildMap.build.indrAutoUtcnt != 0 || rtn.buildMap.build.oudrAutoUtcnt != 0) {
              const cnt = Number(rtn.buildMap.build.indrAutoUtcnt) + Number(rtn.buildMap.build.oudrAutoUtcnt);
              if (utcnt == '-') {
                utcnt = '자주식 ' + cnt + '대';
              } else {
                utcnt += ', 자주식 ' + cnt + '대';
              }
            }

            $('#build-body4-10').text(utcnt);
            $('#build-body4-11').text(elvt);
            $('#build-body4-12').html('해당없음');
            $('#build-body4-13').html('해당없음');
            if (rtn.buildMap.mapKind == 2) {
              $('#build-second-22').text('아파트');
            } else if (rtn.buildMap.mapKind == 3) {
              $('#build-second-22').text('다세대');
            } else if (rtn.buildMap.mapKind == 4) {
              $('#build-second-22').text('오피스텔');
            }

            // 위반건축물
            if (rtn.buildMap.build.violYn == 'Y') {
              $('#build-body4-14').show();
              $('#build-second-11').text('해당');
              $('#build-second-11').attr('style', 'color: red !important;');
            }
            $('#land-body4-1').text($commonUtil.fnInsteadString(landInfo.jimok, '-'));
            $('#land-body4-2').text((landInfo.tAreaF * 3.3).toFixed(2) + '㎡');
            $('#land-body4-4').text($commonUtil.fnInsteadString(landInfo.spfc, '-'));
            $('#land-body4-3, #land-body4-5, #land-body4-6, #land-body4-7, #land-body4-9').closest('.info-box').hide();

            $('#center-building #building-info-grid').show();
            $('#center-building #no-building-info').hide();

            $('#land-body7-2').text(buildInfo.area + '㎡'); // 전용면적
            $('#land-body7-3').text(buildInfo.mainPurpsCdNm); // 주용도
            $('#land-body7-4').text(buildInfo.useAprDay); // 사용승인일
            $('#land-body7-5').text(buildInfo.strctCdNm); // 주구조
            $('#land-body7-7').text(buildInfo.allArea + '㎡'); // 연면적(분양면적)
            $('#land-body7-8').text(buildInfo.hhldCnt + '세대 / ' + buildInfo.grndFlrCnt + '층');

            $('#land-body7-12').text(utcnt);
            $('#land-body7-13').text(elvt);

            $('#land-body7-6, #land-body7-9, #land-body7-11').closest('.info-box').hide();

            // 추후 보고서에 사용할 전역정보 저장
            $tilko.value.addrMap = rtn.addrMap;
            $tilko.value.addrMap.newAddr = $realtySearch.value.realty.newAddr;
            $tilko.value.buildMap = rtn.buildMap;
            $tilko.value.buildMap.dongListLength = $realtySearch.value.dongList.length;
            $tilko.value.buildMap.dong = $('#build-header-4_1').text();
            $tilko.value.buildMap.ho = $('#build-header-5_1').text();
            $tilko.value.realMap = rtn.realMap;
          }

          // 2. 가격 및 실거래 세팅
          if (rtn.buildMap.mapKind == 0 || rtn.buildMap.mapKind == 1) {
            if (rtn.realMap.result == '401') {
              $realtySearch.value.price = 0;
              $('#land-body2-2').show();
              $('.estimate-total').addClass('hide');
            } else {
              $('#main-price').text("₩ " + $realtySearch.fnPriceFinal(rtn.realMap.lowPrice));

              // 높은 가격(예: ~ 4.2억)을 작게 표시할 #sub-price 스팬에 설정
              $('#sub-price').text(" ~ ₩ " + $realtySearch.fnPriceFinal(rtn.realMap.highPrice));

              $realtySearch.value.lowPrice = rtn.realMap.lowPrice;
              $realtySearch.value.highPrice = rtn.realMap.highPrice;
              $realtySearch.value.lowPrice = Math.round($realtySearch.value.lowPrice / 1000000) * 1000000;
              $realtySearch.value.highPrice = Math.round($realtySearch.value.highPrice / 1000000) * 1000000;
              $('.estimate-total').removeClass('hide');
              // $('#land-second-3').text($realtySearch.fnPriceFinal(rtn.realMap.price));
              if (rtn.buildMap.mapKind == 1) {
                $('#land-body2-1-2').closest('li').hide();
                $('#land-body2-1-3').hide();
                $('#land-body2-1-2').text(rtn.realMap.priceAloneUnit.toLocaleString());
                $('#land-body2-1-3').text('거래면적: ' + (rtn.buildMap.build.brTitleList[0].totAreaF * 3.3).toFixed(2) + '㎡');
                $('#land-body2-1-4').text(rtn.realMap.lowpriceUnit.toLocaleString() + " ~ " + rtn.realMap.highpriceUnit.toLocaleString());
                $('#land-body2-1-2').hide();
                $('#land-body2-1-3').hide();
                $('#land-body2-1-4').closest('li').hide();
                $('#land-body2-1-4').hide();
              } else {
                $('#land-body2-1-2').closest('li').hide();
                $('#land-body2-1-3').hide();
                $('#land-body2-1-2').text('');
                $('#land-body2-1-3').text('');
                $('#land-body2-1-4').text(rtn.realMap.lowpriceUnit.toLocaleString() + " ~ " + rtn.realMap.highpriceUnit.toLocaleString());
                $('#land-body2-1-2').hide();
                $('#land-body2-1-3').hide();
                $('#land-body2-1-4').closest('li').hide();

              }
              $('#land-body2-1-5').text('거래면적: ' + (rtn.buildMap.land.tAreaF * 3.3).toFixed(2) + '㎡');
              $('#land-body2-1-5').hide();
              $('#land-body2-1').show();
            }
            const uniqueDataList = [];
            let fullDataList = [];
            if (rtn.realMap.result == '401' && !rtn.showDataList) {
              $('#no-trade-data').show();
            } else if(rtn.realMap.result == '401' && (!Array.isArray(rtn.showDataList) || rtn.showDataList.length === 0)) {
              $('#no-trade-data').show();
            } else if(!rtn.realMap.result == '401' && (!Array.isArray(rtn.realMap.showDataList) || rtn.realMap.showDataList.length === 0)){
              $('#no-trade-data').show();
            }else {
              if(rtn.realMap.result == '401' && rtn.showDataList.length !== 0)  fullDataList = rtn.showDataList;
              else fullDataList = rtn.realMap.showDataList;

              // --- 주소 중복을 제거하고 최대 10개의 고유 목록을 만드는 로직 ---

              const processedAddresses = new Set(); // 처리된 주소를 저장하기 위한 Set

              for (const data of fullDataList) {
                // 1. fnRealtyList에서와 동일한 방식으로 주소 문자열을 생성합니다.
                let tempAddr = data.platPlc + ' ' + Number(data.bun);
                if (Number(data.ji) != 0) {
                  tempAddr += '-' + Number(data.ji);
                }

                // 2. 이 주소가 아직 처리되지 않았다면
                if (!processedAddresses.has(tempAddr)) {
                  processedAddresses.add(tempAddr); // 주소를 처리된 목록에 추가
                  uniqueDataList.push(data);      // 고유 데이터 목록에 현재 데이터를 추가
                }

                // 3. 고유 데이터 목록이 10개에 도달하면 루프를 중단합니다.
                if (uniqueDataList.length >= 10) {
                  break;
                }
              }
              // --- 필터링 로직 끝 ---

              // 4. 필터링된 고유 데이터 목록(최대 10개)을 각 함수에 전달합니다.

            }
            $realtySearch.value.realtyList = fullDataList;
            $realtySearch.fnRenderTradeList(uniqueDataList);
            $realtySearch.fnRealtyList(uniqueDataList);
          } else {
            if (rtn.realMap.result == '401') {
              $('#build-body2-2').show();
              $realtySearch.value.price = 0;
              $('.estimate-total').addClass('hide');
              $('#build-second-3').text('상세검토 필요');
            } else {
              $('#build-body2-1-1').text('₩ ' + $realtySearch.fnPriceFinal(rtn.realMap.price));
              // ▼▼▼ 이 코드로 기존 if/else 블록 전체를 완전히 교체하세요 ▼▼▼

              // 먼저, '추정가' 관련 jQuery 객체들을 찾아 변수에 담아둡니다.
              var estimateTitleRow = $('.estimate-title-row');
              var estimateTab = $('.type-wrap__item:contains("추정가")');

              if (rtn.realMap.AIused === true) {
                // [조건이 참일 때: AI 로고를 반짝이게 함]

                // 1. [핵심] 재사용 가능한 AI 로고 생성 함수를 만듭니다.
                function createShiningAiLogo(width) {
                  // SVG의 기본 뼈대 코드
                  var svgTemplate =
                      // [수정] viewBox를 더 작게 최적화
                      '<svg class="logo-svg" viewBox="0 0 160 85" xmlns="http://www.w3.org/2000/svg" style="fill: {{FILL_COLOR}};">' +
                      '<g>' +
                      // [수정] font-size를 80에서 70으로 줄이고, 위치/간격 재조정
                      '<g font-family="Arial, \'Helvetica Neue\', Helvetica, sans-serif" font-size="70" font-weight="bold">' +
                      '<text x="0" y="70">A</text><text x="51" y="70">i</text>' +
                      '</g>' +
                      // [수정] 작아진 글자에 맞춰 별들의 위치와 크기를 다시 미세 조정
                      '<g>' +
                      '<path transform="translate(95, 0) scale(0.45)" d="M25,0 L35,15 L50,25 L35,35 L25,50 L15,35 L0,25 L15,15 Z" />' +
                      '<path transform="translate(75, 20) scale(0.6)" d="M25,0 L35,15 L50,25 L35,35 L25,50 L15,35 L0,25 L15,15 Z" />' +
                      '<path transform="translate(100, 35) scale(0.8)" d="M25,0 L35,15 L50,25 L35,35 L25,50 L15,35 L0,25 L15,15 Z" />' +
                      '</g>' +
                      '</g>' +
                      '</svg>';

                  // 뼈대를 이용해 노란색 로고(아래층)와 검정색 마스크용 로고(도장)를 만듭니다.
                  var yellowLogo = svgTemplate.replace('{{FILL_COLOR}}', '#FFBF00');
                  var maskSvg = svgTemplate.replace('{{FILL_COLOR}}', '#000000');

                  // Base64 인코딩을 통해 SVG 마스크를 CSS에서 사용할 수 있는 데이터 URI로 변환합니다.
                  var maskDataUri = 'url(data:image/svg+xml;base64,' + window.btoa(maskSvg) + ')';

                  // 최종 HTML 구조를 완성합니다.
                  var finalHtml =
                      '<span class="ai-logo-container-final" style="width:' + width + 'px;">' +
                      yellowLogo + // 아래층 (사용자가 보는 노란색 로고)
                      // 위층 (움직이는 빛줄기를 담고, SVG 마스크로 잘라낸 레이어)
                      '<span class="shine-layer" style="-webkit-mask-image: ' + maskDataUri + '; mask-image: ' + maskDataUri + ';"></span>' +
                      '</span>';

                  return finalHtml;
                }

                // 2. 함수를 호출하여 각각의 로고 HTML을 생성합니다.
                var logoForRow = createShiningAiLogo(60); // 제목 옆 큰 로고
                var logoForTab = createShiningAiLogo(24); // 탭의 작은 로고

                // 3. 기존 AI 로고를 먼저 지우고, 그 다음에 추가합니다.
                estimateTitleRow.find('.ai-logo-container-final').remove();
                estimateTitleRow.append(logoForRow);

                estimateTab.html('추정가' + logoForTab);

              } else {
                // [조건이 거짓일 때: AI 로고를 보여주지 않음]
                estimateTitleRow.find('.ai-logo-container-final').remove();
                estimateTab.html('추정가');
              }

              $realtySearch.value.price = rtn.realMap.price;
              $realtySearch.value.price = Math.round($realtySearch.value.price / 1000000) * 1000000;
              $('#build-second-3').text('₩ ' + $realtySearch.fnPriceFinal(rtn.realMap.price));
              $('#build-body2-1-2').text($realtySearch.fnPriceSibMan(Math.round(rtn.realMap.price / rtn.buildMap.build.allAreaF)));
              $('#build-body2-1-3').text('거래면적: ' + (rtn.buildMap.build.allAreaF * 3.3).toFixed(2) + '㎡');
              $('#build-body2-1-4').text($realtySearch.fnPriceSibMan(Math.round(rtn.realMap.price / rtn.buildMap.build.areaF)));
              $('#build-body2-1-5').text('거래면적: ' + (rtn.buildMap.build.areaF * 3.3).toFixed(2) + '㎡');

              $('#build-body2-1-5').hide();
              $('#build-body2-1-4').closest('li').hide();
              $('#build-body2-1-2').closest('li').hide();
              $('#build-body2-1-2').hide();
              $('#build-body2-1-3').hide();
              $('#build-body2-1-4').hide();

              $('#build-body2-1').show();
              $('.estimate-total').removeClass('hide');
            }
            const uniqueDataList = [];
            let fullDataList = [];

            if (rtn.realMap.result == '401' && !rtn.showDataList) {
              $('#no-trade-data').show();
            } else if(rtn.realMap.result == '401' && (!Array.isArray(rtn.showDataList) || rtn.showDataList.length === 0)) {
              $('#no-trade-data').show();
            } else if(!rtn.realMap.result == '401' && (!Array.isArray(rtn.realMap.showDataList) || rtn.realMap.showDataList.length === 0)){
              $('#no-trade-data').show();
            }else {
              if(rtn.realMap.result == '401' && rtn.showDataList.length !== 0)  fullDataList = rtn.showDataList;
              else fullDataList = rtn.realMap.showDataList;

              // --- 주소 중복을 제거하고 최대 10개의 고유 목록을 만드는 로직 ---
              const processedAddresses = new Set(); // 처리된 주소를 저장하기 위한 Set

              for (const data of fullDataList) {
                // 1. fnRealtyList에서와 동일한 방식으로 주소 문자열을 생성합니다.
                let tempAddr = data.platPlc + ' ' + Number(data.bun);
                if (Number(data.ji) != 0) {
                  tempAddr += '-' + Number(data.ji);
                }

                // 2. 이 주소가 아직 처리되지 않았다면
                if (!processedAddresses.has(tempAddr)) {
                  processedAddresses.add(tempAddr); // 주소를 처리된 목록에 추가
                  uniqueDataList.push(data);      // 고유 데이터 목록에 현재 데이터를 추가
                }

                // 3. 고유 데이터 목록이 10개에 도달하면 루프를 중단합니다.
                if (uniqueDataList.length >= 10) {
                  break;
                }
              }
              // --- 필터링 로직 끝 ---

              // 4. 필터링된 고유 데이터 목록(최대 10개)을 각 함수에 전달합니다.

            }
            $realtySearch.value.realtyList = fullDataList;
            $realtySearch.fnRenderTradeList(uniqueDataList);
            $realtySearch.fnRealtyList(uniqueDataList);
          }

          // 3. 세금 정보 그리기
          if (
            rtn.buildMap.mapKind === '2' ||
            rtn.buildMap.mapKind === '3' ||
            rtn.buildMap.mapKind === '4' &&
            (
              !rtn.buildMap.build.coApprCoPenList.length === 0 ||
              !rtn.buildMap.build.coApprCoPenOfficeList.length === 0
            )
          ) {
            if (rtn.buildMap.build.noticeAmt == 0) {
              $('#property-tax').text('-');
              $('#comprehensive-real-estate-holding-tax').text('-');
              $('#holding-tax').text('-');
            } else {
              const _noticeAmt = Number(rtn.buildMap.build.noticeAmt.replaceAll(',', ''));
              const propertyTax = _noticeAmt * 0.0011; // 재산세
              const comprehensiveRealEstateHoldingTax = 0; // 종합부동산세
              const holdingTax = _noticeAmt * 0.0011; // 보유세
              $('#property-tax')
                .text($realtySearch.fnPriceMan(propertyTax) + '원');
              $('#comprehensive-real-estate-holding-tax')
                .text(comprehensiveRealEstateHoldingTax + '원');
              $('#holding-tax')
                .text($realtySearch.fnPriceMan(holdingTax) + '원');
            }

            if (rtn.realMap.price == undefined) {
              $('#acquisition-tax').text('-');
              $('#brokerage-commission').text('-');
              $('#appraisal-commission').text('-');
            } else {
              const _estimatedPrice = Number(rtn.realMap.price.replaceAll(',', ''));
              const acquisitionTax = $realtySearch.fnPriceFinal(_estimatedPrice * 0.011); // 취득세
              const brokerageCommission = $realtySearch.fnPriceFinal(_estimatedPrice * 0.004); // 중개보수
              const appraisalCommission = $realtySearch.fnPriceSibMan(_estimatedPrice * 0.0015); // 등록세
              $('#acquisition-tax').text(acquisitionTax + '원');
              $('#brokerage-commission').text(brokerageCommission + '원');
              $('#appraisal-commission').text(appraisalCommission + '원');
            }
          }

          // 3. 공시가격 세팅
          if (rtn.buildMap.mapKind == 0 || rtn.buildMap.mapKind == 1) {
            const priceList = rtn.buildMap.land.brApmmBeforeList;

            if (priceList && Array.isArray(priceList)) {
              const processedData = priceList
                  .filter(item => item && /^\d{4}-\d{2}-\d{2}$/.test(item.pnilpDate))
                  .map(item => ({
                    year: new Date(item.pnilpDate).getFullYear(),
                    price: Math.round(Number(item.pnilp) / 1000)
                  }));

              const uniqueDataByYear = Array.from(
                  processedData.reduce((map, item) => map.set(item.year, item), new Map()).values()
              ).sort((a, b) => a.year - b.year);
              window.$eventBus.emit('landPriceUpdated', uniqueDataByYear);
            } else {
              window.$eventBus.emit('landPriceUpdated', []);
            }
          } else {
            if (rtn.buildMap.mapKind == 4) {
              $('#build-body5-1').text('공시가격');

              if (rtn.buildMap.build.coApprCoPenOfficeList.length != 0) {
                $('#build-body5-1').show();
                $('#build-body5-2').show();
                $('#build-body5-3').show();
                $('#build-body5-4').show();

                let amtHtm = '';

                for (let i = 0; i < rtn.buildMap.build.coApprCoPenOfficeList.length; i++) {
                  const item = rtn.buildMap.build.coApprCoPenOfficeList[i];

                  const noticeAmt = parseInt(item.noticeAmt, 10);
                  const mainArea = parseFloat(item.mainArea);
                  const shareArea = parseFloat(item.shareArea);

                  const total = noticeAmt * (mainArea + shareArea);

                  amtHtm += '<li class="general-table-item flex-between align-center">';
                  amtHtm += '<div class="general-table-item__content">' + item.noticeDate.substring(0, 4) + '년</div>';
                  amtHtm += '<div class="general-table-item__content dark-gray">' + $realtySearch.fnPriceFinal(total) + '</div>';
                  amtHtm += '</li>';

                  if (i == 0) {
                    $realtySearch.value.noticeAmt = total;
                    $('#build-body5-5').text($realtySearch.fnPriceFinal(total));
                  }
                }

                $('#build-body5-2').html(amtHtm);
              } else {
                $('#build-body5-1').hide();
                $('#build-body5-2').hide();
                $('#build-body5-3').hide();
                $('#build-body5-4').hide();

                $realtySearch.value.noticeAmt = '';
              }
            } else {
              $('#build-body5-1').text('공동주택가격');
              if (rtn.buildMap.build.coApprCoPenList.length != 0) {
                $('#build-body5-1').show();
                $('#build-body5-2').show();
                $('#build-body5-3').show();
                $('#build-body5-4').show();

                let amtHtm = '';

                for (let i = 0; i < rtn.buildMap.build.coApprCoPenList.length; i++) {
                  const item = rtn.buildMap.build.coApprCoPenList[i];

                  amtHtm += '<li class="general-table-item flex-between align-center">';
                  amtHtm += '<div class="general-table-item__content">' + item.baseYear + '년</div>';
                  amtHtm += '<div class="general-table-item__content dark-gray">' + $realtySearch.fnPriceFinal(item.noticeAmt) + '</div>';
                  amtHtm += '</li>';

                  if (i == 0) {
                    $realtySearch.value.noticeAmt = item.noticeAmt;
                    $('#build-body5-5').text($realtySearch.fnPriceFinal(item.noticeAmt));
                  }
                }

                $('#build-body5-2').html(amtHtm);
              } else {
                $('#build-body5-1').hide();
                $('#build-body5-2').hide();
                $('#build-body5-3').hide();

                $realtySearch.value.noticeAmt = '';
              }
            }
          }

          setTimeout(function() {

            // 1. 하단 탭(#whole-table-wrapper)을 항상 보여줍니다.
            $('#whole-table-wrapper').addClass('show');

            // 2. mapKind에 따라 오른쪽 탭(.land-wrap 또는 .building-wrap)을 제어하고, 로드뷰를 초기화합니다.
            if (rtn.buildMap.mapKind == 0 || rtn.buildMap.mapKind == 1) {
              // 토지/토지건물일 경우:
              $('.land-wrap').addClass('show');
              $('.building-wrap').removeClass('show'); // building-wrap은 확실히 숨김
              $realtySearch.fnInitNaverPano($realtySearch.value.latlng.Ma, $realtySearch.value.latlng.La, 'road-view2');
            } else {
              // 집합건물(아파트, 오피스텔 등)일 경우:
              $('#build-info-1').show();
              $('.building-wrap').addClass('show');
              $('.land-wrap').removeClass('show');     // land-wrap은 확실히 숨김
              $realtySearch.fnInitNaverPano($realtySearch.value.latlng.Ma, $realtySearch.value.latlng.La, 'road-view3');
            }

            // 3. 탭이 열렸으므로 support 이미지 숨기기
            $('.support-fixed').addClass('hidden');

            // 강제로 resize 이벤트를 발생시켜 Naver Panorama가 레이아웃을 다시 그리도록 합니다.
            window.dispatchEvent(new Event('resize'));

          }, 500);

          // 5. 주변 정보 가져오기
          if (rtn.buildMap.mapKind == 0 || rtn.buildMap.mapKind == 1) {
            $realtySearch.fnGetCloseInfo('land');
          } else {
            $realtySearch.fnGetCloseInfo('build');
          }

          // 6. 내 검색내역 저장
          const jsonString = localStorage.getItem('searchList');
          const searchListArr = jsonString ? JSON.parse(jsonString) : [];

          for (let i = 0; i < searchListArr.length; i++) {
            if (searchListArr[i].addr === $realtySearch.value.realty.mapAddr) {
              return false;
            }
          }

          const searchList = {
            addr: $realtySearch.value.realty.mapAddr,
            kind: rtn.buildMap.mapKind
          };

          searchListArr.push(searchList);

          if (searchListArr.length > 10) {
            searchListArr.shift();
          }

          localStorage.setItem('searchList', JSON.stringify(searchListArr));
          $realtySearch.fnSearchHistory();
        } else {
        }
      },
      error: function(request, status, rtn) {
      },
      complete: function(xhr, data) {
        $eventBus.emit('loadingOff');
      }
    });
  },

  /**
   * 검색기록 갱신
   */
  fnSearchHistory: function() {
    $('.search_list').html('');

    const jsonString = localStorage.getItem('searchList');
    const dataList = jsonString ? JSON.parse(jsonString) : [];
    let searchHtm = '';

    if (dataList.length === 0) {
      searchHtm += '<div class="dropdown-wrap__empty">검색이력이 없습니다</div>';
      searchHtm += '</div>';
    } else {
      for (let i = dataList.length - 1; i >= 0; i--) {
        let kindName = '';
        if (dataList[i].kind == 0) {
          kindName = '토지';
        } else if (dataList[i].kind == 1) {
          kindName = '토지건물';
        } else if (dataList[i].kind == 2) {
          kindName = '아파트';
        } else if (dataList[i].kind == 3) {
          kindName = '다세대';
        } else if (dataList[i].kind == 4) {
          kindName = '오피스텔';
        } else if (dataList[i].kind == 5) {
          kindName = '상가';
        }

        searchHtm += '<div class="dropdown-wrap__item" onclick="$realtySearch.fnSearchListClick(\'' + dataList[i].addr + '\')">';
        searchHtm += '<img src="/assets/finder_g.svg" class="dropdown-wrap__item__img" />';
        searchHtm += '<div class="dropdown-wrap__item__type">' + kindName + '</div>';
        searchHtm += '<div class="dropdown-wrap__item__name">' + dataList[i].addr + '</div>';
        searchHtm += '</div>';
      }
    }
    $('.search_list').html(searchHtm);
  },

  /**
   * 검색창 클릭시 검색 진행
   */
  fnSearchListClick: function(addr) {
    $('.map_srch').val(addr);
    $realtySearch.fnSearchAddr();
  },

  // 주소입력 엔터키 클릭
  fnMapSrchEnterkey: function(thiz) {
    if (window.event.keyCode == 13) {
      $realtySearch.fnSearchAddr(thiz);
    }
  },

  /**
   * 네이버 로드뷰 초기화 (autoResize 및 Debounce 적용 최종 버전)
   */
  fnInitNaverPano: function (targetLat, targetLng, viewName) {
    let panoContainer = document.getElementById(viewName);
    if (!panoContainer) {
      console.error(`파노라마 컨테이너 #${viewName}를 찾을 수 없습니다.`);
      return;
    }
    const self = this;

    if (this.panoMarker) {
      this.panoMarker.setMap(null);
    }
    // 이전에 등록된 리사이즈 리스너가 있다면 제거합니다.
    // this.debouncedUpdate는 이 함수가 여러 번 호출될 때를 대비해 저장해둡니다.
    if (this.debouncedUpdate) {
      window.removeEventListener('resize', this.debouncedUpdate);
    }

    this.pano = new naver.maps.Panorama(viewName, {
      position: new naver.maps.LatLng(targetLat, targetLng),
      logoControl: false,
      mapDataControl: false,
      // ★★★ 1. autoResize 옵션 활성화 ★★★
      // 파노라마 크기 조절을 API에 맡깁니다.
      autoResize: true
    });

    naver.maps.Event.addListener(this.pano, 'init', function() {
      const targetPosition = new naver.maps.LatLng(targetLat, targetLng);
      const proj = self.pano.getProjection();
      let lookAtPov = proj.fromCoordToPov(targetPosition);

      if (lookAtPov) {
        lookAtPov.tilt = 10;
        lookAtPov.fov = getFovByScreenSize(); // 초기 FOV 설정
        self.pano.setPov(lookAtPov);
      }

      self.panoMarker = new naver.maps.Marker({
        position: targetPosition,
        map: self.pano,
        icon: {
          url: '/assets/markers/roadviewmarker.png',
          size: new naver.maps.Size(50, 52),
          scaledSize: new naver.maps.Size(50, 52),
          anchor: new naver.maps.Point(25, 52)
        }
      });
    });

    function getFovByScreenSize() {
      let screenWidth = window.innerWidth;
      if (screenWidth < 768) { return 120; }
      if (screenWidth < 1200) { return 105; }
      return 90;
    }

    // ★★★ 2. FOV만 조절하는 리사이즈 핸들러 ★★★
    // 이제 이 함수는 파노라마 '크기'는 신경쓰지 않고, '화각(FOV)'만 조절합니다.
    function updatePanoFov() {
      if (!self.pano) return;

      let currentPov = self.pano.getPov();
      if (currentPov) {
        self.pano.setPov({
          pan: currentPov.pan,
          tilt: currentPov.tilt,
          fov: getFovByScreenSize()
        });
      }
    }

    // ★★★ 3. 디바운스 적용하여 리사이즈 이벤트 리스너 등록 ★★★
    // 리사이즈가 멈추고 250ms 후에 딱 한 번만 updatePanoFov 함수를 실행합니다.
    this.debouncedUpdate = this._debounce(updatePanoFov, 250);
    window.addEventListener('resize', this.debouncedUpdate);
  },

  fnPriceFinal: function(price) {
    // 1. 유효성 검사 (기존과 동일)
    if (price == null || price === 'undefined' || isNaN(price)) {
      return price; // isNaN 추가하여 숫자가 아닌 경우도 방어
    }

    price = Number(price); // 확실하게 숫자로 변환

    if (price === 0) {
      return '0원'; // 0일때는 '0원'으로 표시하는게 더 명확할 수 있습니다.
    }

    // 2. 단위 정의
    const JO = 1000000000000;  // 1조
    const UCK = 100000000;     // 1억
    const MAN = 10000;         // 1만

    let htm = '';

    // 3. 큰 단위부터 순서대로 확인
    if (price >= JO) {
      // 조 단위 계산. 소수점 첫째 자리까지 표시하고, '.0'은 제거
      const value = (price / JO).toFixed(1);
      htm = value.replace(/\.0$/, '') + '조'; // 예: 2.0조 -> 2조, 1.6조 -> 1.6조

    } else if (price >= UCK) {
      // 억 단위 계산. 조 단위와 동일한 로직 적용
      const value = (price / UCK).toFixed(1);
      htm = value.replace(/\.0$/, '') + '억'; // 예: 3.0억 -> 3억, 3.5억 -> 3.5억

    } else if (price >= MAN) {
      // 만 단위는 보통 소수점을 쓰지 않으므로 정수로 표현
      htm = Math.floor(price / MAN).toLocaleString() + '만'; // 예: 1,234만

    } else {
      // 1만 미만은 원 단위로 표시
      htm = price.toLocaleString() + '원';
    }

    return htm;
  },

  /**
   * 가격 이쁘게 나누기 - 십만단위
   */
  fnPriceSibMan: function(price) {
    if (price == null || price == 'undefined') {
      return price;
    }

    if (price == 0) {
      return 0;
    }

    // 십만 원 단위로 반올림
    price = Math.round(price / 100000) * 100000;
    price = price.toString().replace(/\B(?=(\d{4})+(?!\d))/g, ',');

    const result = price.split(',');
    let jo = '';
    let ug = '';
    let manwon = '';

    if (result.length == 4) {
      jo = result[0];
      ug = result[1];
      manwon = result[2];
    } else if (result.length == 3) {
      ug = result[0];
      manwon = result[1];
    } else if (result.length == 2) {
      manwon = result[0];
    }

    let htm = '';

    if (jo != '') {
      htm += jo + '조 ';
    }

    if (ug != '') {
      htm += Number(ug) + '억 ';
    }

    if (manwon != '' && manwon != '0000') {
      htm += Number(manwon) + '만';
    }

    return htm;
  },

  fnPriceMan: function(price) {
    if (price == null || price == 'undefined') {
      return price;
    }

    if (price == 0) {
      return 0;
    }

    // 만원 단위로 반올림
    let man = Math.round(price / 10000);
    let chun = Math.round((price % 10000) / 1000);

    return man + '만' + chun + '천';
  },

  /**
   * 조,억,만 스트링을 넘버로 변환
   */
  fnPriceToNumber: function(strPrice) {
    if (!strPrice) return null;

    let jo = 0;
    let ug = 0;
    let manwon = 0;

    // "조" 단위 처리
    const joIndex = strPrice.indexOf('조');
    if (joIndex !== -1) {
      jo = parseInt(strPrice.substring(0, joIndex)) * 1000000000000; // 조는 1조 = 1,000,000,000,000
      strPrice = strPrice.substring(joIndex + 1).trim();
    }

    // "억" 단위 처리
    const ugIndex = strPrice.indexOf('억');
    if (ugIndex !== -1) {
      ug = parseInt(strPrice.substring(0, ugIndex)) * 100000000; // 억은 1억 = 100,000,000
      strPrice = strPrice.substring(ugIndex + 1).trim();
    }

    // "만" 단위 처리
    const manwonIndex = strPrice.indexOf('만');
    if (manwonIndex !== -1) {
      manwon = parseInt(strPrice.substring(0, manwonIndex)) * 10000; // 만은 1만 = 10,000
    }

    return jo + ug + manwon;
  },

  /**
   * 더보기, 닫기 설정
   */
  fnMore: function(thiz, type) {
    const tagId = $(thiz).attr('tagId');

    if (type == 1) {
      $('ul[name=' + tagId + ']').show();
      $('li[name=' + tagId + ']').show();
      $('div[name=' + tagId + ']').show();
      $(thiz).next().show();
      $(thiz).hide();
    } else {
      $('ul[name=' + tagId + ']').hide();
      $('li[name=' + tagId + ']').hide();
      $('div[name=' + tagId + ']').hide();
      $(thiz).prev().show();
      $(thiz).hide();
    }
  },

  /**
   * 부속지번 더보기 오픈
   */
  fnSubJiBunSh: function(index) {
    if ($realtySearch.value.subPnu != $realtySearch.value.subJiBunListMap[index].pnu) {
      $realtySearch.value.subPnu = $realtySearch.value.subJiBunListMap[index].pnu;

      $('#land-body5-1').html('부속지번 정보(' + $realtySearch.value.subJiBunListMap[index].subJibun + ')<img src="/assets/close.svg" class="header__btn" onclick="$realtySearch.fnSubJiBunSh(' + index + ')" />');
      $('#land-body5-2').text($realtySearch.value.subJiBunListMap[index].jimok);
      $('#land-body5-3').text((($realtySearch.value.subJiBunListMap[index].tAreaF * 3.3).toFixed(2)) + '㎡');
      $('#land-body5-4').text($realtySearch.value.subJiBunListMap[index].landUse);
      $('#land-body5-5').text($realtySearch.value.subJiBunListMap[index].spfc);
      $('#land-body5-6').text($realtySearch.value.subJiBunListMap[index].geoHl);
      $('#land-body5-7').text($realtySearch.value.subJiBunListMap[index].geoForm);
      $('#land-body5-8').text($realtySearch.value.subJiBunListMap[index].roadSide);

      const pnu = $realtySearch.value.subJiBunListMap[index].pnu;

      $('#land-body5-9').attr('href', 'http://www.eum.go.kr/web/ar/lu/luLandDet.jsp?selSido=' + pnu.substring(0, 2) + '&selSgg=' + pnu.substring(2, 5) + '&selUmd=' + pnu.substring(5, 9) + '&selRi=' + pnu.substring(8, 10) + '&landGbn=' + pnu.substring(10, 11) + '&bobn=' + String(parseInt(pnu.substring(11, 15))) + '&bubn=' + String(parseInt(pnu.substring(15, 19))) + '&pnu=' + pnu + '&scale=&isNoScr=script&chk=0&mode=search&selGbn=umd');

      $('#land-body5').show();
    } else {
      $realtySearch.value.subPnu = '';

      $('#land-body5').hide();
    }
  },

  /**
   * 건물정보 변경 로직
   */
  fnChangeBuildInfo: function(index) {
    $('#land-body7-2').text($commonUtil.fnInsteadInt($realtySearch.value.brTitleList[index].platAreaF * 3.3, '-', '㎡'));
    $('#land-body7-3').text($realtySearch.value.brTitleList[index].mainPurpsCdNm);
    $('#land-body7-4').text($commonUtil.fnInsteadString($realtySearch.value.brTitleList[index].useAprDay, '-'));
    $('#land-body7-5').text($realtySearch.value.brTitleList[index].strctCdNm);
    $('#land-body7-6').text($realtySearch.value.brTitleList[index].roofCdNm);
    $('#land-body7-7').text($realtySearch.value.brTitleList[index].totAreaF * 3.3 + ' ㎡');
    $('#land-body7-8').text('지하' + $realtySearch.value.brTitleList[index].ugrndFlrCnt + '층/지상' + $realtySearch.value.brTitleList[index].grndFlrCnt + '층');
    $('#land-body7-9').text($commonUtil.fnInsteadInt($realtySearch.value.brTitleList[index].vlRat, '-', '%'));
    $('#land-body7-10').text($commonUtil.fnInsteadInt($realtySearch.value.brTitleList[index].vlRatEstmTotAreaF * 3.3, '-', '㎡'));
    $('#land-body7-11').text($commonUtil.fnInsteadInt($realtySearch.value.brTitleList[index].bcRat, '-', '%'));

    let elvt = '-';
    let utcnt = '-';
    if ($realtySearch.value.brTitleList[index].rideUseElvtCnt != 0 || $realtySearch.value.brTitleList[index].emgenUseElvtCnt != 0) {
      elvt = Number($realtySearch.value.brTitleList[index].rideUseElvtCnt) + Number($realtySearch.value.brTitleList[index].emgenUseElvtCnt);
      elvt += '대';
    }

    if ($realtySearch.value.brTitleList[index].indrMechUtcnt != 0 || $realtySearch.value.brTitleList[index].oudrMechUtcnt != 0) {
      const cnt = Number($realtySearch.value.brTitleList[index].indrMechUtcnt) + Number($realtySearch.value.brTitleList[index].oudrMechUtcnt);
      utcnt = '기계식 ' + cnt + '대';
    }

    if ($realtySearch.value.brTitleList[index].indrAutoUtcnt != 0 || $realtySearch.value.brTitleList[index].oudrAutoUtcnt != 0) {
      const cnt = Number($realtySearch.value.brTitleList[index].indrAutoUtcnt) + Number($realtySearch.value.brTitleList[index].oudrAutoUtcnt);
      if (utcnt == '-') {
        utcnt = '자주식 ' + cnt + '대';
      } else {
        utcnt += ', 자주식 ' + cnt + '대';
      }
    }

    $('#land-body7-12').text(utcnt);
    $('#land-body7-13').text(elvt);

    // 층정보 표기
    $('#land-body8-1').html('');

    let flrovrvwListHtm = '';
    flrovrvwListHtm += '<li class="general-table-item flex-between align-center center">';
    flrovrvwListHtm += '<div class="general-table-item__content">층수</div>';
    flrovrvwListHtm += '<div class="general-table-item__content">용도</div>';
    flrovrvwListHtm += '<div class="general-table-item__content">면적</div>';
    flrovrvwListHtm += '<div class="general-table-item__content">구조</div>';
    flrovrvwListHtm += '</li>';

    for (let i = 0; i < $realtySearch.value.brTitleList[index].brFlrovrvwList.length; i++) {
      if (i < 3) {
        flrovrvwListHtm += '<li class="general-table-item flex-between align-center center">';
      } else {
        $('#land-body8_more').show();
        flrovrvwListHtm += '<li class="general-table-item flex-between align-center center" name="land-body8_more" style="display:none">';
      }
      flrovrvwListHtm += '<div class="general-table-item__content">' + $realtySearch.value.brTitleList[index].brFlrovrvwList[i].flrGbCdNm + $realtySearch.value.brTitleList[index].brFlrovrvwList[i].flrNo + '층</div>';
      flrovrvwListHtm += '<div class="general-table-item__content">' + $realtySearch.value.brTitleList[index].brFlrovrvwList[i].mainPurpsCdNm + '</div>';
      flrovrvwListHtm += '<div class="general-table-item__content">' + $realtySearch.value.brTitleList[index].brFlrovrvwList[i].totArea + '㎡</div>';
      flrovrvwListHtm += '<div class="general-table-item__content">' + $realtySearch.value.brTitleList[index].brFlrovrvwList[i].strctCdNm + '</div>';
      flrovrvwListHtm += '</li>';
    }

    flrovrvwListHtm += '';

    $('#land-body8-1').html(flrovrvwListHtm);
    $('#land-body8_no-more').hide();
    $('#land-body8_no-more').prev().show();
  },
  /**
   * 실거래 표시 로직
   * 데이터 유효성 검사 및 이벤트 핸들러 최적화 적용
   */
  fnRealtyList: async function(list) {
    if ($realtySearch.value.contentMarkers && $realtySearch.value.contentMarkers.length > 0) {
      for (const marker of $realtySearch.value.contentMarkers) {
        marker.setMap(null);
      }
    }
    $realtySearch.value.contentMarkers = [];


    // --- 2. 목록 순회 및 마커 생성 ---
    for (const [index, data] of list.entries()) {

      // --- 3. [핵심] 데이터 유효성 검사 (Guard Clause) ---
      // 마커 표시에 필요한 필수 데이터가 하나라도 없으면 이 항목은 건너뜁니다.
      const mapKind = $realtySearch.value.mapKind;
      const requiredArea = (mapKind == 0) ? data.agreementArea : data.totArea;

      if (!data || !data.platPlc || !data.bun || !requiredArea || !data.tradePrice || !data.contractYm) {
        continue; // 다음 항목으로 넘어감
      }
      // --- 유효성 검사 끝 ---

      // 카카오 API 요청에 과부하를 주지 않기 위한 최소한의 딜레이
      await $commonUtil.fnDelay(1);

      let tempAddr = data.platPlc + ' ' + Number(data.bun);
      if (data.ji && Number(data.ji) != 0) {
        tempAddr += '-' + Number(data.ji);
      }

      // 주소 검색은 비동기 콜백으로 처리
      $mainFunction.value.geocoder.addressSearch(tempAddr, function(result, status) {
        // 정상적으로 검색이 완료됐으면
        if (status === kakao.maps.services.Status.OK) {
          const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
          const originalIndex = $realtySearch.value.realtyList.indexOf(data);

          const distanceInMeters = $commonMap.fnHaversineDistanceInMeters($realtySearch.value.latlng.Ma, $realtySearch.value.latlng.La, coords.getLat(), coords.getLng());
          const targetItem = $realtySearch.value.currentTradeList.find(item =>
              item.contractYm === data.contractYm && item.contractDate === data.contractDate && item.tradePrice === data.tradePrice
          );

          if (targetItem) {
            targetItem.distance = distanceInMeters;
            targetItem.coords = coords;
            targetItem.originalIndex = originalIndex;
          }

          // 2. 데이터가 업데이트되었으니, 테이블을 다시 그리라고 요청합니다.
          $realtySearch.fnRenderTradeList($realtySearch.value.currentTradeList);
          // 커스텀 오버레이(마커) 내용 생성
          let content = '';
          let kind = '';
          const kinds = ['토지', '토지/건물', '아파트', '연립/다세대', '오피스텔', '상가'];
          kind = kinds[mapKind] || '기타';

          content += `<div class="amount-info-window realty-item-link" data-original-index="${originalIndex}" data-lat="${coords.getLat()}" data-lng="${coords.getLng()}">`;
          content +=   '<div class="amount-info-window__top">';
          content +=     `<div class="amount-info-window__badge">${parseFloat(requiredArea).toFixed(2).replace(/\.00$/, '')}㎡</div>`;
          content +=   '</div>';
          content +=   '<div class="amount-info-window__content">';
          content +=     `<div class="amount-info-window__kind">${kind}</div>`;
          content +=     `<div class="amount-info-window__amount">${$realtySearch.fnPriceFinal(Number(data.tradePrice + '0000'))}</div>`;
          content +=     `<div class="amount-info-window__year">${data.contractYm.slice(0, 4)}년</div>`;
          content +=   '</div>';
          content += '</div>';

          // 커스텀 오버레이 생성
          const customOverlay = new kakao.maps.CustomOverlay({
            map: map,
            clickable: true,
            content: content,
            position: coords,
            xAnchor: 0.1,
            yAnchor: 0.9,
            zIndex: 3
          });

          customOverlay.setMap(map);
          $realtySearch.value.contentMarkers.push(customOverlay); // 생성된 마커(오버레이)를 관리 목록에 추가
        }
      });
    }
  },

  /**
   * 실거래 정보 세팅
   */
  fnOnRealtyDetail: function(index) {
    if ($realtySearch.value.realtyList[index] == null || $realtySearch.value.realtyList[index] == 'undefined') {
      return false;
    }

    $('#real_tag_body').html('');

    let tempAddr = '';
    let realTagBody = '';

    tempAddr += $realtySearch.value.realtyList[index].platPlc + ' ' + Number($realtySearch.value.realtyList[index].bun);
    if (Number($realtySearch.value.realtyList[index].ji) != 0) {
      tempAddr += '-' + Number($realtySearch.value.realtyList[index].ji);
    }

    const tradePriceInMan = Number($realtySearch.value.realtyList[index].tradePrice + '0000');
    const totArea = $realtySearch.value.realtyList[index].totArea;

    realTagBody += tempAddr;
    realTagBody += '<div class="general-table">';
    realTagBody += '<ul class="general-table-list">';
    realTagBody += '<li class="general-table-item flex-between align-center">';
    realTagBody += '<div class="general-table-item__content">총액</div>';
    realTagBody += '<div class="general-table-item__content">';
    realTagBody += '<div>' + $realtySearch.fnPriceFinal(tradePriceInMan) + '</div>';
    realTagBody += '</div>';
    realTagBody += '</li>';
    realTagBody += '<li class="general-table-item flex-between align-center">';
    realTagBody += '<div class="general-table-item__content">거래일</div>';
    realTagBody += '<div class="general-table-item__content">';
    realTagBody += '<div>' + $realtySearch.value.realtyList[index].contractYm.slice(2, 4) + '.' + $realtySearch.value.realtyList[index].contractYm.slice(4) + '.' + String($realtySearch.value.realtyList[index].contractDate).padStart(2, '0') + '</div>';
    realTagBody += '</div>';
    realTagBody += '</li>';
    realTagBody += '<li class="general-table-item flex-between align-center">';
    realTagBody += '<div class="general-table-item__content">전용면적</div>';
    realTagBody += '<div class="general-table-item__content">';
    realTagBody += '<div>' + totArea + '㎡</div>';
    realTagBody += '</div>';
    realTagBody += '</li>';
    realTagBody += '<li class="general-table-item flex-between align-center">';
    realTagBody += '<div class="general-table-item__content">단가</div>';
    realTagBody += '<div class="general-table-item__content">';
    realTagBody += '<div>' + $realtySearch.fnPriceFinal(Number(Math.round(tradePriceInMan / totArea / 10000) + '0000')) + '</div>';
    realTagBody += '</div>';
    realTagBody += '</li>';
    realTagBody += '<li class="general-table-item flex-between align-center">';
    realTagBody += '<div class="general-table-item__content">사용승인일</div>';
    realTagBody += '<div class="general-table-item__content">';
    realTagBody += '<div>2012.07.12</div>';
    realTagBody += '</div>';
    realTagBody += '</li>';
    realTagBody += '</ul>';
    realTagBody += '</div>';

    $('#real_tag_body').html(realTagBody);
    $('#real_tag').show();
  },

  /**
   * 호 리스트 업데이트
   */
  fnUpdateHoList: function(dongNm) {
    $('#build-header-4_1').html('<div>' + dongNm + '</div><i class="fas fa-caret-down"></i><i class="fas fa-caret-up"></i>');
    $('#build-header-5_1').html($realtySearch.value.hoList[dongNm][0] + '<i class="fas fa-caret-down"></i><i class="fas fa-caret-up"></i>');

    let hoHtm = '';

    for (let i = 0; i < $realtySearch.value.hoList[dongNm].length; i++) {
      hoHtm += '<div class="dropdown-item" onclick="$realtySearch.fnSelectHoList(\'' + $realtySearch.value.hoList[dongNm][i] + '\')">' + $realtySearch.value.hoList[dongNm][i] + '</div>';
    }

    $realtySearch.value.dong = dongNm;
    $('#build-header-5').html(hoHtm);
  },

  /**
   * 동 리스트 선택
   */
  fnSelectHoList: function(hoNm) {
    $('#build-header-5_1').html(hoNm + '<i class="fas fa-caret-down"></i><i class="fas fa-caret-up"></i>');
    const name = hoNm.split('(')[0].trim();

    $realtySearch.value.ho = name;

    // 검색진행
    $realtySearch.fnBuildInfo($realtySearch.value.realty.mapAddr);
  },

  /**
   * 호 아이콘 리스트 업데이트
   */
  fnUpdateHoIcoList: function(dongNm, type, thiz) {
    $('li[name=dong_list_li_' + type + ']').removeClass('active');
    $(thiz).addClass('active');
    $('#build-' + type + '-body4-2').html('');

    let icoHtm = '';
    icoHtm = '</div>' + icoHtm;
    icoHtm = '<div class="building-structure__ho empty"></div>' + icoHtm;
    icoHtm = '<div class="building-structure__ho empty"></div>' + icoHtm;
    icoHtm = '<div class="building-structure__ho empty"></div>' + icoHtm;
    icoHtm = '<div class="building-structure__ho empty"></div>' + icoHtm;
    icoHtm = '<div class="building-structure__ho empty"></div>' + icoHtm;
    icoHtm = '<div class="building-structure__floor">' + icoHtm;

    for (let i = 0; i < $realtySearch.value.hoList[dongNm].length; i += 5) {
      icoHtm = '</div>' + icoHtm;

      for (let j = 0; j < 5; j++) {
        let className = '';

        if (i >= 5) {
          className = 'blue_' + Math.floor(i / 5);
        }
        if (i + j > $realtySearch.value.hoList[dongNm].length - 1) {
          icoHtm = '<div class="building-structure__ho none"></div>' + icoHtm;
        } else {
          const name = $realtySearch.value.hoList[dongNm][i + j].split('(')[0].trim();
          icoHtm = '<div class="building-structure__ho blue_1 ' + className + '">' + name + '</div>' + icoHtm;
        }
      }

      icoHtm = '<div class="building-structure__floor">' + icoHtm;
    }

    $('#build-' + type + '-body4-2').html(icoHtm);
  },

  /**
   * 틸코 권리분석 로직 시작
   */
  fnTilkoProc: function(kind) {
    $eventBus.emit('loadingOn');
    $('#landKind').val(kind);

    // 사전검사 진행(주소등 있는지 여부 판단)
    $.ajax({
      type: 'post',
      dataType: 'json',
      data: {
        'addr': $realtySearch.value.realty.mapAddr,
        'dong': $realtySearch.value.dong,
        'ho': $realtySearch.value.ho,
        'kind': kind,
        'landPrice': $realtySearch.value.price,
        'noticeAmt': $realtySearch.value.noticeAmt
      },
      cache: false,
      url: '/tilko/getLandCertificateYn',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
      },
      beforeSend: function(xhr) {
      },
      success: function(rtn) {
        // 모바일 여부
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);

        if (rtn.result == 1) {
          const url = '/ini/inicisForm?addr=' + encodeURIComponent($realtySearch.value.realty.mapAddr) +
            '&dong=' + encodeURIComponent($realtySearch.value.dong) +
            '&ho=' + encodeURIComponent($realtySearch.value.ho) +
            '&kind=' + encodeURIComponent(kind) +
            '&landPrice=' + encodeURIComponent($realtySearch.value.price) +
            '&noticeAmt=' + encodeURIComponent($realtySearch.value.noticeAmt) +
            '&isMobile=' + encodeURIComponent(isMobile);

          const iniWindow = window.open(url, 'iniWindow', 'width=800,height=600');

          const checkChildWindow = setInterval(function() {
            if (iniWindow.closed) {
              clearInterval(checkChildWindow);

              $eventBus.emit('loadingOff');
            }
          }, 1000); // 1000ms마다 자식 창의 상태를 체크합니다.
        } else if (rtn.result == 2) {
          $toast.error('등기소에서 검색할 수 없는 주소입니다.');
          $eventBus.emit('loadingOff');
        } else if (rtn.result == 3) {
          $toast.error('등기소에 데이터가 존재하지 않습니다.');
          $eventBus.emit('loadingOff');
        } else if (rtn.result == 4) {
          $toast.error('추정가격이 존재하지 않아 검색이 불가능합니다.');
          $eventBus.emit('loadingOff');
        } else if (rtn.result == 5) {
          /**
           * 사전정제
           */
          $toast.success('결제가 완료되었습니다.');

          // 결과를 전역에 저장
          $tilko.value.tilkoMap = rtn.rightAnalysisVO;

          //값 전달 프로세스
          let kind = 'build';

          if (rtn.rightAnalysisVO.oracularResponses == '해당' ||
            rtn.rightAnalysisVO.seizure == '해당' ||
            rtn.rightAnalysisVO.leasehold == '해당' ||
            rtn.rightAnalysisVO.auctionGoYn == '해당' ||
            rtn.rightAnalysisVO.currentYn == 'N' ||
            $('#' + kind + '-second-11').text() == '해당'
          ) {
            $('#' + kind + '-second-1').hide();
            $('#' + kind + '-second-2').show();
            $('#' + kind + '-second-7').hide();
            $('#' + kind + '-second-8').show();
            $('#' + kind + '-second-5').text('가입 불가');
            $('#' + kind + '-second-5').attr('style', 'color: red !important;');
            $('#' + kind + '-second-26').hide();
          } else {
            $('#' + kind + '-second-1').show();
            $('#' + kind + '-second-2').hide();
            $('#' + kind + '-second-7').show();
            $('#' + kind + '-second-8').hide();
            $('#' + kind + '-second-5').text($realtySearch.fnPriceFinal(rtn.rightAnalysisVO.currentTax));
            $('#' + kind + '-second-6').text($realtySearch.fnPriceFinal(rtn.rightAnalysisVO.currentTaxRoseBonds));
          }

          if (rtn.rightAnalysisVO.seniorBonds == '' || rtn.rightAnalysisVO.seniorBonds == '0') {
            $('#' + kind + '-second-4').text('없음');
          } else {
            $('#' + kind + '-second-4').text($realtySearch.fnPriceFinal(rtn.rightAnalysisVO.seniorBonds));
          }


          let bondsHtm = '';
          bondsHtm += '<div class="no-value-box">';
          bondsHtm += '<img src="/assets/building/no_value.svg" alt="">';
          bondsHtm += '<div class="no-value-box__title"><strong class="no-value-box__title blue">' + $realtySearch.fnPriceFinal(rtn.rightAnalysisVO.currentTax) + '원 이하</strong>의 전세 계약';
          bondsHtm += '권유';
          bondsHtm += '</div>';
          bondsHtm += '<div class="no-value-box__inner-box">';
          bondsHtm += '단, 선순위 채권 소멸 특약을 설정한 경우에는<br />';
          bondsHtm += '<strong class="blue"> ' + $realtySearch.fnPriceFinal(rtn.rightAnalysisVO.currentTaxRoseBonds) + '원 이하</strong>의 전세 계약을 권유 드립니다.';
          bondsHtm += '</div>';
          bondsHtm += '</div>';

          $('#' + kind + '-second-7').html(bondsHtm);
          $('#' + kind + '-second-9').text(rtn.rightAnalysisVO.owner);
          $('#' + kind + '-second-10').text(rtn.rightAnalysisVO.typeOwn);
          $('#' + kind + '-second-12').text(rtn.rightAnalysisVO.oracularResponses);
          if (rtn.rightAnalysisVO.oracularResponses == '해당') {
            $('#' + kind + '-second-12').attr('style', 'color: red !important;');
          }
          $('#' + kind + '-second-13').text(rtn.rightAnalysisVO.seizure);
          if (rtn.rightAnalysisVO.seizure == '해당') {
            $('#' + kind + '-second-13').attr('style', 'color: red !important;');
          }
          $('#' + kind + '-second-14').text(rtn.rightAnalysisVO.leasehold);
          if (rtn.rightAnalysisVO.leasehold == '해당') {
            $('#' + kind + '-second-14').attr('style', 'color: red !important;');
          }
          $('#' + kind + '-second-23').text(rtn.rightAnalysisVO.auctionGoYn);
          if (rtn.rightAnalysisVO.auctionGoYn == '해당') {
            $('#' + kind + '-second-23').attr('style', 'color: red !important;');
          }
          $('#' + kind + '-second-15').text(rtn.rightAnalysisVO.charteredKayule + '%');
          $('#' + kind + '-second-16').text(rtn.rightAnalysisVO.auctionBidRate + '%');
          $('#' + kind + '-second-17').text(rtn.rightAnalysisVO.etcLandCtn);
          $('#' + kind + '-second-18').hide();
          $('#' + kind + '-second-btn4').attr('onclick', '$tilko.fnDownLandOwn(\'' + kind + '\')');

          $realtySearch.value.transactionKey = $realtySearch.value.realty.mapAddr;

          //종료
          $eventBus.emit('loadingOff');
        } else {
          $toast.error('알수없는 오류가 발생했습니다');
          $eventBus.emit('loadingOff');
        }
      },
      error: function(request, status, error) {
        console.log('code:' + request.status + '\n' + 'error:' + error);
        if (request.status === 401) { // 인증되지 않음
          $toast.error('로그인 후 사용 가능합니다.');
          window.location.href = '/?login=false';
        } else {
          $toast.error('요청을 실패하였습니다. 다시 시도 해주세요.');
        }
      },
      complete: function(xhr, data) {
      }
    });
  },

  /**
   * 필지에서 가까운 요소찾기. 탭 change 메서드
   */
  fnCloseInfo: function(kind, type) {
    $('#' + kind + '-body9 li').removeClass('active');
    $('#' + kind + '-body9 li:eq(' + (type - 1) + ')').addClass('active');

    if (type == 1) {
      $('#' + kind + '-body9-1').show();
      $('#' + kind + '-body9-2').show();
      $('#' + kind + '-body9-3').hide();
      $('#' + kind + '-body9-4').hide();
      $('#' + kind + '-body9-5').hide();
      $('#' + kind + '-body9-6').hide();
      $('#' + kind + '-body9-7').hide();
      $('#' + kind + '-body9-8').hide();
    } else if (type == 2) {
      $('#' + kind + '-body9-1').hide();
      $('#' + kind + '-body9-2').hide();
      $('#' + kind + '-body9-3').show();
      $('#' + kind + '-body9-4').show();
      $('#' + kind + '-body9-5').show();
      $('#' + kind + '-body9-6').hide();
      $('#' + kind + '-body9-7').hide();
      $('#' + kind + '-body9-8').hide();
    } else if (type == 3) {
      $('#' + kind + '-body9-1').hide();
      $('#' + kind + '-body9-2').hide();
      $('#' + kind + '-body9-3').hide();
      $('#' + kind + '-body9-4').hide();
      $('#' + kind + '-body9-5').hide();
      $('#' + kind + '-body9-6').show();
      $('#' + kind + '-body9-7').show();
      $('#' + kind + '-body9-8').show();
    }
  },

  /**
   * 주변정보 가져와서 표시해주기
   */
  fnGetCloseInfo: function(kind) {
    $realtySearch.value.kind7 = [];
    $realtySearch.value.kind9 = [];
    $realtySearch.value.kind10 = [];

    // 지도의 현재 영역을 얻어옵니다
    const bounds = map.getBounds();

    // 영역의 남서쪽 좌표를 얻어옵니다
    const swLatLng = bounds.getSouthWest();

    // 영역의 북동쪽 좌표를 얻어옵니다
    const neLatLng = bounds.getNorthEast();

    const maX = swLatLng.getLat();
    const laX = swLatLng.getLng();
    const maY = neLatLng.getLat();
    const laY = neLatLng.getLng();

    $realtySearch.value.kind = kind;
    $.ajax({
      type: 'post',
      dataType: 'json',
      data: {
        'laX': laX,
        'maX': maX,
        'laY': laY,
        'maY': maY
      },
      cache: false,
      url: '/real/getCloseInfo',
      beforeSend: function(xhr) {
      },
      success: function(rtn) {
        if (rtn.result == 1) {
          // 내 위치 정보 $realtySearch.value.latlng

          // 지하철, 마트, 병원
          $realtySearch.fnSearchAllCategories();

          // 버스
          let htm4 = '';
          htm4 += '<div class="near-info__title">';
          htm4 += '<img src="/assets/apart/location_2.svg" alt="">';
          htm4 += '<div>버스정류장(' + rtn.busMap.list.length + '개)</div>';
          htm4 += '</div>';

          if (rtn.busMap.list.length != 0) {
            // 거리에 따라 배열 정렬
            rtn.busMap.list.sort(function(a, b) {
              const meterA = Math.round(
                $commonMap.fnHaversineDistanceInMeters($realtySearch.value.latlng.Ma, $realtySearch.value.latlng.La, a.latitude, a.longitude)
              );
              const meterB = Math.round(
                $commonMap.fnHaversineDistanceInMeters($realtySearch.value.latlng.Ma, $realtySearch.value.latlng.La, b.latitude, b.longitude)
              );
              return meterA - meterB;
            });

            htm4 += '<ul class="vehicle-info bus">';
            for (let i = 0; i < rtn.busMap.list.length; i++) {
              if (i > 10) {
                break;
              }

              // 거리계산
              const meter = Math.round(
                $commonMap.fnHaversineDistanceInMeters(
                  $realtySearch.value.latlng.Ma, $realtySearch.value.latlng.La, rtn.busMap.list[i].latitude, rtn.busMap.list[i].longitude
                )
              );
              const walk = Math.round(meter / 100);

              htm4 += '<li class="vehicle-info__item">';
              htm4 += '<img class="vehicle-info__img" src="/assets/apart/location_2_1.svg" alt="">';
              htm4 += '<div class="vehicle-info__station">' + rtn.busMap.list[i].name + '</div>';
              htm4 += '<div>' + meter + 'm ' + walk + '분거리</div>';
              htm4 += '</li>';
            }
            htm4 += '</ul>';
          }

          $('#' + $realtySearch.value.kind + '-body9-2').html(htm4);


          // 커피점
          let htm5 = '';
          htm5 += '<div class="near-info__title">';
          htm5 += '<img src="/assets/apart/location_6.svg" alt="">';
          htm5 += '<div>카페(' + rtn.coffeeMap.list.length + '개)</div>';
          htm5 += '</div>';

          if (rtn.coffeeMap.list.length != 0) {
            // 거리에 따라 배열 정렬
            rtn.coffeeMap.list.sort(function(a, b) {
              const meterA = Math.round(
                $commonMap.fnHaversineDistanceInMeters($realtySearch.value.latlng.Ma, $realtySearch.value.latlng.La, a.latitude, a.longitude)
              );
              const meterB = Math.round(
                $commonMap.fnHaversineDistanceInMeters($realtySearch.value.latlng.Ma, $realtySearch.value.latlng.La, b.latitude, b.longitude)
              );
              return meterA - meterB;
            });

            htm5 += '<ul class="vehicle-info">';
            for (let i = 0; i < rtn.coffeeMap.list.length; i++) {
              if (i > 10) {
                break;
              }

              // 거리계산
              const meter = Math.round($commonMap.fnHaversineDistanceInMeters($realtySearch.value.latlng.Ma, $realtySearch.value.latlng.La, rtn.coffeeMap.list[i].latitude, rtn.coffeeMap.list[i].longitude));
              const walk = Math.round(meter / 100);

              htm5 += '<li class="vehicle-info__item circle-list-style">';
              htm5 += '<div class="vehicle-info__station">' + rtn.coffeeMap.list[i].name + '</div>';
              htm5 += '<div>' + meter + 'm ' + walk + '분거리</div>';
              htm5 += '</li>';
            }
            htm5 += '</ul>';
          }

          $('#' + $realtySearch.value.kind + '-body9-8').html(htm5);


          // 초등학교
          let htm6 = '';
          htm6 += '<div class="near-info__title">';
          htm6 += '<img src="/assets/apart/location_3.svg" alt="">';
          htm6 += '<div>초등학교(' + rtn.schoolMap1.list.length + '개)</div>';
          htm6 += '</div>';

          if (rtn.schoolMap1.list.length != 0) {
            // 거리에 따라 배열 정렬
            rtn.schoolMap1.list.sort(function(a, b) {
              const meterA = Math.round($commonMap.fnHaversineDistanceInMeters($realtySearch.value.latlng.Ma, $realtySearch.value.latlng.La, a.latitude, a.longitude));
              const meterB = Math.round($commonMap.fnHaversineDistanceInMeters($realtySearch.value.latlng.Ma, $realtySearch.value.latlng.La, b.latitude, b.longitude));
              return meterA - meterB;
            });

            htm6 += '<ul class="vehicle-info">';
            for (let i = 0; i < rtn.schoolMap1.list.length; i++) {
              if (i > 10) {
                break;
              }

              // 거리계산
              const meter = Math.round($commonMap.fnHaversineDistanceInMeters($realtySearch.value.latlng.Ma, $realtySearch.value.latlng.La, rtn.schoolMap1.list[i].latitude, rtn.schoolMap1.list[i].longitude));
              const walk = Math.round(meter / 100);

              htm6 += '<li class="vehicle-info__item circle-list-style">';
              htm6 += '<div class="vehicle-info__station">' + rtn.schoolMap1.list[i].name + '</div>';
              htm6 += '<div>' + meter + 'm ' + walk + '분거리</div>';
              htm6 += '</li>';
            }
            htm6 += '</ul>';
          }

          $('#' + $realtySearch.value.kind + '-body9-3').html(htm6);


          // 중학교
          let htm7 = '';
          htm7 += '<div class="near-info__title">';
          htm7 += '<img src="/assets/apart/location_3.svg" alt="">';
          htm7 += '<div>중학교(' + rtn.schoolMap2.list.length + '개)</div>';
          htm7 += '</div>';

          if (rtn.schoolMap2.list.length != 0) {
            // 거리에 따라 배열 정렬
            rtn.schoolMap2.list.sort(function(a, b) {
              const meterA = Math.round($commonMap.fnHaversineDistanceInMeters($realtySearch.value.latlng.Ma, $realtySearch.value.latlng.La, a.latitude, a.longitude));
              const meterB = Math.round($commonMap.fnHaversineDistanceInMeters($realtySearch.value.latlng.Ma, $realtySearch.value.latlng.La, b.latitude, b.longitude));
              return meterA - meterB;
            });

            htm7 += '<ul class="vehicle-info">';
            for (let i = 0; i < rtn.schoolMap2.list.length; i++) {
              if (i > 10) {
                break;
              }

              // 거리계산
              const meter = Math.round($commonMap.fnHaversineDistanceInMeters($realtySearch.value.latlng.Ma, $realtySearch.value.latlng.La, rtn.schoolMap2.list[i].latitude, rtn.schoolMap2.list[i].longitude));
              const walk = Math.round(meter / 100);

              htm7 += '<li class="vehicle-info__item circle-list-style">';
              htm7 += '<div class="vehicle-info__station">' + rtn.schoolMap2.list[i].name + '</div>';
              htm7 += '<div>' + meter + 'm ' + walk + '분거리</div>';
              htm7 += '</li>';
            }
            htm7 += '</ul>';
          }

          $('#' + $realtySearch.value.kind + '-body9-4').html(htm7);


          // 고등학교
          let htm8 = '';
          htm8 += '<div class="near-info__title">';
          htm8 += '<img src="/assets/apart/location_3.svg" alt="">';
          htm8 += '<div>고등학교(' + rtn.schoolMap3.list.length + '개)</div>';
          htm8 += '</div>';

          if (rtn.schoolMap3.list.length != 0) {
            // 거리에 따라 배열 정렬
            rtn.schoolMap3.list.sort(function(a, b) {
              const meterA = Math.round($commonMap.fnHaversineDistanceInMeters($realtySearch.value.latlng.Ma, $realtySearch.value.latlng.La, a.latitude, a.longitude));
              const meterB = Math.round($commonMap.fnHaversineDistanceInMeters($realtySearch.value.latlng.Ma, $realtySearch.value.latlng.La, b.latitude, b.longitude));
              return meterA - meterB;
            });

            htm8 += '<ul class="vehicle-info">';
            for (let i = 0; i < rtn.schoolMap3.list.length; i++) {
              if (i > 10) {
                break;
              }

              // 거리계산
              const meter = Math.round($commonMap.fnHaversineDistanceInMeters($realtySearch.value.latlng.Ma, $realtySearch.value.latlng.La, rtn.schoolMap3.list[i].latitude, rtn.schoolMap3.list[i].longitude));
              const walk = Math.round(meter / 100);

              htm8 += '<li class="vehicle-info__item circle-list-style">';
              htm8 += '<div class="vehicle-info__station">' + rtn.schoolMap3.list[i].name + '</div>';
              htm8 += '<div>' + meter + 'm ' + walk + '분거리</div>';
              htm8 += '</li>';
            }
            htm8 += '</ul>';
          }

          $('#' + $realtySearch.value.kind + '-body9-5').html(htm8);
        } else {

        }
      },
      error: function(request, status, error) {
        console.log('code:' + request.status + '\n' + 'message:' + request.responseText + '\n' + 'error:' + error);
        $toast.error('요청을 실패하였습니다.다시 시도 해주세요.');
      },
      complete: function(xhr, data) {
      }
    });
  },

  // 장소검색이 완료됐을 때 호출되는 콜백함수 입니다
  fnPlacesSearchCB: function(data, status, pagination) {
    if (status === kakao.maps.services.Status.OK) {
      // 정상적으로 검색이 완료됐으면 지도에 마커를 표출합니다
      $realtySearch.fnDisplayPlaces(data);
    } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
      // 검색결과가 없는경우 해야할 처리가 있다면 이곳에 작성해 주세요
      console.log('검색결과 없음');
    } else if (status === kakao.maps.services.Status.ERROR) {
      // 에러로 인해 검색결과가 나오지 않은 경우 해야할 처리가 있다면 이곳에 작성해 주세요
      console.log('검색결과 에러');
    }
  },

  // 지도에 마커를 표출하는 함수입니다
  fnDisplayPlaces: function(places) {
    const addUniquePlaces = (placesArray) => {
      places.forEach((place) => {
        const isAddressExists = placesArray.some((existingPlace) => existingPlace.address_name === place.address_name);
        if (!isAddressExists) {
          placesArray.push(place);
        }
      });
    };

    if ($realtySearch.value.currCategory == 'SW8') { // 지하철 kind7
      addUniquePlaces($realtySearch.value.kind7);
    } else if ($realtySearch.value.currCategory == 'HP8') { // 병원 kind9
      addUniquePlaces($realtySearch.value.kind9);
    } else if ($realtySearch.value.currCategory == 'MT1') { // 마트 kind10
      addUniquePlaces($realtySearch.value.kind10);
    }
  },

  // 비동기 작업을 Promise로 감싼 함수
  fnCategorySearchPromise: function(category, page) {
    return new Promise((resolve) => {
      $rightTool.value.ps.categorySearch(category, (data, status, pagination) => {
        $realtySearch.fnPlacesSearchCB(data, status, pagination);
        resolve();
      }, {
        useMapBounds: true,
        page: page
      });
    });
  },

  // 비동기 작업들을 순차적으로 실행하는 함수
  fnSearchAllCategories: async function() {
    const categories = ['SW8', 'HP8', 'MT1'];
    const kinds = ['kind7', 'kind9', 'kind10'];

    for (let c = 0; c < categories.length; c++) {
      $realtySearch.value.currCategory = categories[c];
      for (let i = 1; i < 4; i++) {
        await $realtySearch.fnCategorySearchPromise($realtySearch.value.currCategory, i);
      }
    }

    // 주변정보 갱신 실행
    let htm1 = '';
    htm1 += '<div class="near-info__title">';
    htm1 += '<img src="/assets/apart/location_1.svg" alt="">';
    htm1 += '<div>지하철(' + $realtySearch.value.kind7.length + '개)</div>';
    htm1 += '</div>';

    if ($realtySearch.value.kind7.length != 0) {
      // 거리에 따라 kind7 배열 정렬
      $realtySearch.value.kind7.sort(function(a, b) {
        const meterA = Math.round($commonMap.fnHaversineDistanceInMeters($realtySearch.value.latlng.Ma, $realtySearch.value.latlng.La, a.y, a.x));
        const meterB = Math.round($commonMap.fnHaversineDistanceInMeters($realtySearch.value.latlng.Ma, $realtySearch.value.latlng.La, b.y, b.x));
        return meterA - meterB;
      });

      htm1 += '<ul class="vehicle-info subway">';
      for (let i = 0; i < $realtySearch.value.kind7.length; i++) {
        if (i > 10) {
          break;
        }

        let className = '';
        let categName = '';
        const categoryNames = $realtySearch.value.kind7[i].category_name.split(' > ');
        const lastCategory = categoryNames[categoryNames.length - 1];
        const firstPlace = $realtySearch.value.kind7[i].place_name.split(' ')[0];

        // 거리계산
        const meter = Math.round($commonMap.fnHaversineDistanceInMeters($realtySearch.value.latlng.Ma, $realtySearch.value.latlng.La, $realtySearch.value.kind7[i].y, $realtySearch.value.kind7[i].x));
        const walk = Math.round(meter / 100);

        if (lastCategory.includes('1호선')) {
          className = 'line_1';
          categName = '1호선';
        } else if (lastCategory.includes('2호선')) {
          className = 'line_2';
          categName = '2호선';
        } else if (lastCategory.includes('3호선')) {
          className = 'line_3';
          categName = '3호선';
        } else if (lastCategory.includes('4호선')) {
          className = 'line_4';
          categName = '4호선';
        } else if (lastCategory.includes('5호선')) {
          className = 'line_5';
          categName = '5호선';
        } else if (lastCategory.includes('6호선')) {
          className = 'line_6';
          categName = '6호선';
        } else if (lastCategory.includes('7호선')) {
          className = 'line_7';
          categName = '7호선';
        } else if (lastCategory.includes('8호선')) {
          className = 'line_8';
          categName = '8호선';
        } else if (lastCategory.includes('9호선')) {
          className = 'line_9';
          categName = '9호선';
        } else if (lastCategory.includes('공항')) {
          className = 'line_10';
          categName = '공항';
        } else if (lastCategory.includes('중앙')) {
          className = 'line_11';
          categName = '중앙';
        } else if (lastCategory.includes('경춘')) {
          className = 'line_12';
          categName = '경춘';
        }

        htm1 += '<li class="vehicle-info__item">';
        htm1 += '<div class="vehicle-info__line ' + className + '">' + categName + '</div>';
        htm1 += '<div class="vehicle-info__station">' + firstPlace + '</div>';
        htm1 += '<div>' + meter + 'm ' + walk + '분거리</div>';
        htm1 += '</li>';

        // 지하철 관련 코드, 초록에 넣기
        if (i == 0) {
          const summerySubwayHtm = '<i class="fas fa-map-marker-alt"></i>' + firstPlace + ' (' + categName + ') 도보 ' + walk + '분';
          $('#' + $realtySearch.value.kind + '-body1-2').html(summerySubwayHtm);
        }
      }
      htm1 += '</ul>';
    } else {
      $('#' + $realtySearch.value.kind + '-body1-2').hide();
    }

    $('#' + $realtySearch.value.kind + '-body9-1').html(htm1);

    let htm2 = '';
    htm2 += '<div class="near-info__title">';
    htm2 += '<img src="/assets/apart/location_4.svg" alt="">';
    htm2 += '<div>병원(' + $realtySearch.value.kind9.length + '개)</div>';
    htm2 += '</div>';

    if ($realtySearch.value.kind9.length != 0) {
      // 거리에 따라 kind9 배열 정렬
      $realtySearch.value.kind9.sort(function(a, b) {
        const meterA = Math.round($commonMap.fnHaversineDistanceInMeters($realtySearch.value.latlng.Ma, $realtySearch.value.latlng.La, a.y, a.x));
        const meterB = Math.round($commonMap.fnHaversineDistanceInMeters($realtySearch.value.latlng.Ma, $realtySearch.value.latlng.La, b.y, b.x));
        return meterA - meterB;
      });

      htm2 += '<ul class="vehicle-info">';
      for (let i = 0; i < $realtySearch.value.kind9.length; i++) {
        if (i > 10) {
          break;
        }

        // 거리계산
        const meter = Math.round($commonMap.fnHaversineDistanceInMeters($realtySearch.value.latlng.Ma, $realtySearch.value.latlng.La, $realtySearch.value.kind9[i].y, $realtySearch.value.kind9[i].x));
        const walk = Math.round(meter / 100);

        htm2 += '<li class="vehicle-info__item circle-list-style">';
        htm2 += '<div class="vehicle-info__station">' + $realtySearch.value.kind9[i].place_name + '</div>';
        htm2 += '<div>' + meter + 'm ' + walk + '분거리</div>';
        htm2 += '</li>';
      }
      htm2 += '</ul>';
    }

    $('#' + $realtySearch.value.kind + '-body9-6').html(htm2);


    let htm3 = '';
    htm3 += '<div class="near-info__title">';
    htm3 += '<img src="/assets/apart/location_5.svg" alt="">';
    htm3 += '<div>마트(' + $realtySearch.value.kind10.length + '개)</div>';
    htm3 += '</div>';

    if ($realtySearch.value.kind10.length != 0) {
      // 거리에 따라 kind10 배열 정렬
      $realtySearch.value.kind10.sort(function(a, b) {
        const meterA = Math.round($commonMap.fnHaversineDistanceInMeters($realtySearch.value.latlng.Ma, $realtySearch.value.latlng.La, a.y, a.x));
        const meterB = Math.round($commonMap.fnHaversineDistanceInMeters($realtySearch.value.latlng.Ma, $realtySearch.value.latlng.La, b.y, b.x));
        return meterA - meterB;
      });

      htm3 += '<ul class="vehicle-info">';
      for (let i = 0; i < $realtySearch.value.kind10.length; i++) {
        if (i > 10) {
          break;
        }

        // 거리계산
        const meter = Math.round($commonMap.fnHaversineDistanceInMeters($realtySearch.value.latlng.Ma, $realtySearch.value.latlng.La, $realtySearch.value.kind10[i].y, $realtySearch.value.kind10[i].x));
        const walk = Math.round(meter / 100);

        htm3 += '<li class="vehicle-info__item circle-list-style">';
        htm3 += '<div class="vehicle-info__station">' + $realtySearch.value.kind10[i].place_name + '</div>';
        htm3 += '<div>' + meter + 'm ' + walk + '분거리</div>';
        htm3 += '</li>';
      }
      htm3 += '</ul>';
    }

    $('#' + $realtySearch.value.kind + '-body9-7').html(htm3);
  },

  /**
   * 권리분석 창 전환
   */
  fnChangeKind: function(kind, type) {
    $('#' + kind + '-second-19 li').removeClass('active');
    $('#' + kind + '-second-19 li:eq(' + (type - 1) + ')').addClass('active');

    if (type == 1) {
      $('#' + kind + '-second-20').show();
      $('#' + kind + '-second-21').hide();
    } else {
      $('#' + kind + '-second-20').hide();
      $('#' + kind + '-second-21').show();
    }
  },

  /**
   * 권리분석 체크포인트 FAQ
   */
  fnOnOffSlideBox: function(thiz) {
    if ($(thiz).hasClass('active')) {
      $(thiz).removeClass('active');
    } else {
      $(thiz).addClass('active');
    }
  },

  /**
   * 로드뷰 위 리스트 중 클릭한 곳으로 이동
   */
  fnScrollIntoView: function(targetSection) {
    let targetId = '';
    targetId = targetSection;

    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  },

  /**
   *  로고 클릭 시 새로고침
   */
  fnReLoad: function() {
    location.reload();
  }

};

$(function() {
  $realtySearch.init();
});

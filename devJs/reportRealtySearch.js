// 카카오맵 init
const mapContainer = document.querySelector('#kakao-map');
var options = {
    center: new kakao.maps.LatLng(37.491521, 127.014960),
    level: 3
};
var map = new kakao.maps.Map(mapContainer, options);
var ps = new kakao.maps.services.Places(); 

var $reportRealtySearch = {
    /**
     * 초기화
     */
    init : function() {
		$reportRealtySearch.value.geocoder = new kakao.maps.services.Geocoder();
		$reportRealtySearch.fnBuildInfo();
    },
    
    value : {
		latlng : {
			Ma : "",
			La : "",
		},
	},
	
    /**
    * 해당 주소 토지, 건물 정보 가져오기
    */
	fnBuildInfo : function () {
		$("div[name=more]").hide();
		$("div[name=no-more]").hide();
		
		$("#real_tag").hide();
		
		$("#build-info-403").hide();
		$("#build-info-1").hide();
		
		$("#build-body0").hide();
		$("#build-body2-1").hide();
		$("#build-body2-2").hide();
		$("#build-body3-1").hide();
		$("#build-body3-2").hide();
		$("#build-body3-3").hide();
		$("#build-body4-14").hide();
		
		// 전세 위험도 분석
		$("#build-second-btn3").attr("onclick", "$tilko.fnDownLandReport()");
		$("#build-second-btn4").attr("onclick", "$tilko.fnDownLandOwn('build')");
		$("#build-second-1").show();
		$("#build-second-2").hide();
		$("#build-second-4").text("-");
		$("#build-second-5").text("-");
		$("#build-second-6").text("-");
		$("#build-second-7").hide();
		$("#build-second-8").hide();
		$("#build-second-9").text("-");
		$("#build-second-10").text("-");
		$("#build-second-11").text("미등록");
		$('#build-second-11').css('color', '');
		$("#build-second-12").text("-");
		$('#build-second-12').css('color', '');
		$("#build-second-13").text("-");
		$('#build-second-13').css('color', '');
		$("#build-second-14").text("-");
		$('#build-second-14').css('color', '');
		$("#build-second-18").show();
		$("#build-second-22").text("-");
		$("#build-second-23").text("-");
		$("#build-second-24").text("전세 위험도 분석(권리분석)");
		$("#build-second-25").text("예상 추정가");
		$('#build-second-5').css('color', '');
		$("#build-second-26").show();
		
		$("#build-body5-1").hide();
		$("#build-body5-2").hide();
		$("#build-body5-3").hide();
		$("#build-body5-4").hide();
		
		const params = new URLSearchParams(window.location.search);
		let reportNo = params.get('reportNo'); // '파라미터명'을 원하는 파라미터 이름으로 대체
		
		$.ajax({
			type: 'POST',
			url: '/tilko/buildInfo',
			traditional : true,
			cache : false,
			data: {
					"reportNo": reportNo
				  },	
			dataType: 'JSON',
			beforeSend : function(xhr) {
				//var token = $("#_csrf").val();
				//var header = $("#_csrf_header").val(); 
				//xhr.setRequestHeader(header, token);
			},
			success: function(rtn)
			{
				if (!rtn.buildMap || typeof rtn.buildMap.result === 'undefined') {
					$toast.error("조회할 수 없는 물건입니다.");
					return false;
				}

				if (rtn.buildMap.result != 1 && rtn.buildMap.result != 304) {
					$toast.error("조회할 수 없는 물건입니다.");
					return false;
				}
				
				if(rtn.result == 1){
//					console.log(rtn.addrMap);
//					console.log(rtn.buildMap);
//					console.log(rtn.realMap);
//					console.log(rtn.tilkoMap);

					$reportRealtySearch.value.latlng.Ma = rtn.addrMap.ma;
					$reportRealtySearch.value.latlng.La = rtn.addrMap.la;

					// 1. 필지별 info 세팅
					$("#div_dong").text(rtn.buildMap.dong);
					$("#div_ho").text(rtn.buildMap.ho);
					$("#build-header-1").text($commonUtil.fnInsteadString(rtn.buildMap.build.bldNm, "-"));
					$("#build-header-2").text(rtn.addrMap.addr);
					$("#build-header-3").text('(' + rtn.addrMap.addrNewType + ')');
					$("#build-body0").show();
					
					$reportRealtySearch.fnInitNaverPano(rtn.addrMap.ma, rtn.addrMap.la, "road-view3");
					naver.maps.onJSContentLoaded = $reportRealtySearch.fnInitNaverPano;
					
					$("#build-body1-1").text($commonUtil.fnInsteadString(rtn.buildMap.build.bldNm, "-"));
					$("#build-body1-2").html('<i class="fas fa-map-marker-alt"></i>선릉역 (2호선ㆍ분당선) 도보 5분');
					$("#build-body1-3").html('<i class="fas fa-home"></i>토지 ' + rtn.buildMap.land.tArea + '평(' + (rtn.buildMap.land.subJiBunListMap.length+1) + '필지)ㆍ' + rtn.buildMap.land.spfc + 'ㆍ' + rtn.buildMap.land.landUse + 'ㆍ' + rtn.buildMap.land.jimok);
					$("#build-body1-4").html('<i class="fas fa-layer-group"></i>건물 ' + rtn.buildMap.dongListLength + '개동ㆍ' + rtn.buildMap.build.hhldCnt + '세대ㆍB' + rtn.buildMap.build.ugrndFlrCnt + '/' + rtn.buildMap.build.grndFlrCnt + '층ㆍ' + rtn.buildMap.build.useAprDay.slice(0, 4) + '년');
				
					//부동산 정보
					let pnu = rtn.addrMap.pnu;
					
					$("#build-body4-1").attr("href", 'http://www.eum.go.kr/web/ar/lu/luLandDet.jsp?selSido='+pnu.substring(0, 2)+'&selSgg='+pnu.substring(2, 5)+'&selUmd='+pnu.substring(5, 9)+'&selRi='+pnu.substring(8, 10)+'&landGbn='+pnu.substring(10, 11)+'&bobn='+String(parseInt(pnu.substring(11, 15)))+'&bubn='+String(parseInt(pnu.substring(15, 19)))+'&pnu='+pnu+'&scale=&isNoScr=script&chk=0&mode=search&selGbn=umd');
					$("#build-body4-2").text($commonUtil.fnInsteadString(rtn.buildMap.build.bldNm, "-"));
					$("#build-body4-3").text(rtn.buildMap.build.mainPurpsCdNm);
					$("#build-body4-4").text(rtn.buildMap.build.area + "㎡");
					$("#build-body4-5").text(rtn.buildMap.build.allArea + "㎡");
					$("#build-body4-6").text(rtn.buildMap.build.strctCdNm);
					$("#build-body4-7").text("지하" + rtn.buildMap.build.ugrndFlrCnt + "층 / 지상" + rtn.buildMap.build.grndFlrCnt + "층");
					$("#build-body4-8").text(rtn.buildMap.build.hhldCnt + "세대(해당동)");
					
					let useAprDay = rtn.buildMap.build.useAprDay;
					
					if (!useAprDay || useAprDay.length < 4) {
					} else {
					    let year = parseInt(useAprDay.substring(0, 4), 10);
					    let currentYear = new Date().getFullYear();
					
					    if (year === currentYear) {
							$("#build-second-24").text("분양가 권리분석 보고서");
							$("#build-second-25").text("분양가");
					    }
					}
					
					$("#build-body4-9").text(rtn.buildMap.build.useAprDay);
					
					let elvt = '-';
					let utcnt = '-';
					if(rtn.buildMap.build.rideUseElvtCnt != 0 || rtn.buildMap.build.emgenUseElvtCnt != 0){
						elvt = Number(rtn.buildMap.build.rideUseElvtCnt) + Number(rtn.buildMap.build.emgenUseElvtCnt);
						elvt += "대";
					}
					
					if(rtn.buildMap.build.indrMechUtcnt != 0 || rtn.buildMap.build.oudrMechUtcnt != 0){
						let cnt = Number(rtn.buildMap.build.indrMechUtcnt) + Number(rtn.buildMap.build.oudrMechUtcnt);
						utcnt = "기계식 " + cnt + "대";	
					}
					
					if(rtn.buildMap.build.indrAutoUtcnt != 0 || rtn.buildMap.build.oudrAutoUtcnt != 0){
						let cnt = Number(rtn.buildMap.build.indrAutoUtcnt) + Number(rtn.buildMap.build.oudrAutoUtcnt);
						if(utcnt == "-"){
							utcnt = "자주식 " + cnt + "대";	
						} else {
							utcnt += ", 자주식 " + cnt + "대";
						}
					}
					
					$("#build-body4-10").text(utcnt);
					$("#build-body4-11").text(elvt);
					$("#build-body4-12").html("해당없음");
					$("#build-body4-13").html("해당없음");
					if(rtn.buildMap.mapKind == 2){
						$("#build-second-22").text("아파트");
					} else if(rtn.buildMap.mapKind == 3){
						$("#build-second-22").text("다세대");
					} else if(rtn.buildMap.mapKind == 4){
						$("#build-second-22").text("오피스텔");
					} 
					
					//위반건축물
					if(rtn.buildMap.build.violYn == "Y"){
						$("#build-body4-14").show();
						$("#build-second-11").text("해당");
						$('#build-second-11').attr('style', 'color: red !important;');
					}

					if(rtn.realMap.result == "401"){
						$("#build-body2-2").show();
						$reportRealtySearch.value.price = 0;
						$("#build-second-3").text("상세검토 필요");
					} else {
						$("#build-body2-1-1").text($reportRealtySearch.fnPriceFinal(rtn.realMap.price));
						$reportRealtySearch.value.price = rtn.realMap.price;
						$reportRealtySearch.value.price = Math.round($reportRealtySearch.value.price / 1000000) * 1000000;
						$("#build-second-3").text($reportRealtySearch.fnPriceFinal(rtn.realMap.price));
						$("#build-body2-1-2").text($reportRealtySearch.fnPriceSibMan(Math.round(rtn.realMap.price / rtn.buildMap.build.allAreaF)));
						$("#build-body2-1-3").text('거래면적: ' + rtn.buildMap.build.allAreaF + '평');
						$("#build-body2-1-4").text($reportRealtySearch.fnPriceSibMan(Math.round(rtn.realMap.price / rtn.buildMap.build.areaF)));
						$("#build-body2-1-5").text('거래면적: ' + rtn.buildMap.build.areaF + '평');
						
						$("#build-body2-1").show();
					}
					
					if(rtn.realMap.result == "401" || rtn.realMap.useDataList.length == 0){
						$("#build-body3-1").show();
					} else {
						let ulHtm = '';
						$("#build-body3-2").html('');
						
						ulHtm += '<ul class="trade-list header">';
						ulHtm += '<li class="trade-list__item">거래일</li>';
						ulHtm += '<li class="trade-list__item large">주소</li>';
						ulHtm += '<li class="trade-list__item large">거래금액</li>';
						ulHtm += '<li class="trade-list__item large">전용면적<br />단가</li>';
						ulHtm += '<li class="trade-list__item">거리</li>';
						ulHtm += '</ul>';

						for(let i=0; i<rtn.realMap.useDataList.length; i++){
							if(i < 3){
								ulHtm += '<ul class="trade-list header">';
							} else {
								$("#build-body3-2_more").show();
								ulHtm += '<ul class="trade-list header" name="build-body3-2_more" style="display:none">';
							}
							ulHtm += '<li class="trade-list__item">' + rtn.realMap.useDataList[i].contractYm.slice(2, 4) + '.' + rtn.realMap.useDataList[i].contractYm.slice(4, 6).padStart(2, '0') + '.' + rtn.realMap.useDataList[i].contractDate.padStart(2, '0') + '</li>';
							if(rtn.realMap.useDataList[i].ji == "0000"){
								ulHtm += '<li class="trade-list__item large">' + rtn.realMap.useDataList[i].gu + " " + Number(rtn.realMap.useDataList[i].bun) + '</li>';
							} else {
								ulHtm += '<li class="trade-list__item large">' + rtn.realMap.useDataList[i].gu + " " + Number(rtn.realMap.useDataList[i].bun) + '-' + Number(rtn.realMap.useDataList[i].ji) + '</li>';
							}
							ulHtm += '<li class="trade-list__item large">' + $reportRealtySearch.fnPriceFinal(rtn.realMap.useDataList[i].tradePrice*10000) + '</li>';
							ulHtm += '<li class="trade-list__item large">' + rtn.realMap.useDataList[i].totArea + '㎡<br />' + $reportRealtySearch.fnPriceFinal(Math.round(rtn.realMap.useDataList[i].tradePrice*10000/rtn.realMap.useDataList[i].totArea / 10) * 10) + '</li>';
							
                            if (rtn.buildMap.mapKind == 3) {
                                ulHtm += '<li class="trade-list__item" id="realtyDistance' + i + '"></li>';
                            } else {
                                ulHtm += '<li class="trade-list__item">' + 0 + 'm</li>';
                            }
							
							ulHtm += '</ul>';
						}
						
						$reportRealtySearch.fnRealtyList(rtn.realMap.useDataList);
						$reportRealtySearch.value.realtyList = rtn.realMap.useDataList;
						
						$reportRealtySearch.value.realtyList.sort((a, b) => {
						    return a.contractYm - b.contractYm;
						});
					
						$("#build-body3-2").html(ulHtm);
						$("#build-body3-2").show();
						
						var categories = $reportRealtySearch.value.realtyList.map(item => item.contractYm);
						var seriesData = $reportRealtySearch.value.realtyList.map(item => {
						    let price = parseInt(item.tradePrice) * 10000;  // 원 단위로 변환
						    return price / 100000000;  // 억 단위로 변환
						});
						
						seriesData = seriesData.map(value => {
						    let rounded = Math.round(value * 100) / 100;
						    return rounded;
						});
						
						// 실거래 그래프
						var options = {
							series: [
								{
									data: seriesData,
								},
							],
							chart: {
								type: "area",
								height: 200,
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
								categories: categories,
							},
							yaxis: {
							    labels: {
							        show: true,
							        formatter: (value) => {
							            return `${Math.round(value * 100) / 100}억`;
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
					    
					    //실거래 정보 업데이트
					    var minDate = Math.min.apply(Math, $reportRealtySearch.value.realtyList.map(function(data) { return parseInt(data.contractYm, 10); })).toString();
						var maxDate = Math.max.apply(Math, $reportRealtySearch.value.realtyList.map(function(data) { return parseInt(data.contractYm, 10); })).toString();
						
						minDate = minDate.slice(0, 4) + "." + minDate.slice(4);
						maxDate = maxDate.slice(0, 4) + "." + maxDate.slice(4);
						
						$('#build-body3-3-1').text(minDate + " ~ " + maxDate);

						var avg = $reportRealtySearch.value.realtyList.reduce(function(sum, data) {
						    return sum + parseInt(data.tradePrice, 10);
						}, 0) / $reportRealtySearch.value.realtyList.length;
						
						var billion = Math.floor(avg / 10000);
						var million = Math.floor(avg % 10000);

						$('#build-body3-3-2').text(billion + "억 " + million + "만원");
						
						var maxPrice = Math.max.apply(Math, $reportRealtySearch.value.realtyList.map(function(data) { return parseInt(data.tradePrice, 10); }));
							billion = Math.floor(maxPrice / 10000);
							million = Math.floor(maxPrice % 10000);
							
						$('#build-body3-3-4').html(billion + '억 ' + million + '만');
						$('#build-body3-3-6').html('<div class="arrow-up summary__subitem__icon"></div>최고 ' + billion + '억 ' + million + '만');

						var minPrice = Math.min.apply(Math, $reportRealtySearch.value.realtyList.map(function(data) { return parseInt(data.tradePrice, 10); }));
							billion = Math.floor(minPrice / 10000);
							million = minPrice % 10000;

						$('#build-body3-3-7').html('<div class="arrow-down summary__subitem__icon"></div>최저 ' + billion + '억 ' + million + '만');
						$('#build-body3-3-8').text("총 " + $reportRealtySearch.value.realtyList.length + "건");
					    
						$("#build-body3-3").show();
					}

					// 3. 공시가격 세팅
					if(rtn.buildMap.mapKind == 4){
						$("#build-body5-1").text("공시가격");
						
						if(rtn.buildMap.build.coApprCoPenOfficeList.length != 0){
							$("#build-body5-1").show();
							$("#build-body5-2").show();
							$("#build-body5-3").show();
							$("#build-body5-4").show();
							
							let amtHtm = '';
							
							for(let i=0; i<rtn.buildMap.build.coApprCoPenOfficeList.length; i++){
								let item = rtn.buildMap.build.coApprCoPenOfficeList[i];

							    let noticeAmt = parseInt(item.noticeAmt, 10);
							    let mainArea = parseFloat(item.mainArea);
							    let shareArea = parseFloat(item.shareArea);
							    
							    let total = noticeAmt * (mainArea + shareArea);
								
								amtHtm += '<li class="general-table-item flex-between align-center">';
								amtHtm += '<div class="general-table-item__content">' + item.noticeDate.substring(0, 4) + '년</div>';
								amtHtm += '<div class="general-table-item__content dark-gray">' + $reportRealtySearch.fnPriceFinal(total) + '</div>';
								amtHtm += '</li>';
								
								if(i==0){
									$reportRealtySearch.value.noticeAmt = total;
									$("#build-body5-5").text($reportRealtySearch.fnPriceFinal(total));
								}
							}
							
							$("#build-body5-2").html(amtHtm);
							
						} else {
							$("#build-body5-1").hide();
							$("#build-body5-2").hide();
							$("#build-body5-3").hide();
							$("#build-body5-4").hide();
							
							$reportRealtySearch.value.noticeAmt = "";						
						}
					} else {
						$("#build-body5-1").text("공동주택가격");
						if(rtn.buildMap.build.coApprCoPenList.length != 0){
							$("#build-body5-1").show();
							$("#build-body5-2").show();
							$("#build-body5-3").show();
							$("#build-body5-4").show();
							
							let amtHtm = '';
							
							for(let i=0; i<rtn.buildMap.build.coApprCoPenList.length; i++){
								let item = rtn.buildMap.build.coApprCoPenList[i];
								
								amtHtm += '<li class="general-table-item flex-between align-center">';
								amtHtm += '<div class="general-table-item__content">' + item.baseYear + '년</div>';
								amtHtm += '<div class="general-table-item__content dark-gray">' + $reportRealtySearch.fnPriceFinal(item.noticeAmt) + '</div>';
								amtHtm += '</li>';
								
								if(i==0){
									$reportRealtySearch.value.noticeAmt = item.noticeAmt;
									$("#build-body5-5").text($reportRealtySearch.fnPriceFinal(item.noticeAmt));
								}
							}
							
							$("#build-body5-2").html(amtHtm);
						} else {
							$("#build-body5-1").hide();
							$("#build-body5-2").hide();
							$("#build-body5-3").hide();
							
							$reportRealtySearch.value.noticeAmt = "";	
						}
					}
					
					//4. 전세 위험도 분석
					if(rtn.tilkoMap.oracularResponses == "해당" || rtn.tilkoMap.seizure == "해당" || rtn.tilkoMap.leasehold == "해당" || rtn.tilkoMap.auctionGoYn == "해당" || rtn.tilkoMap.currentYn == "N" || $("#build-second-11").text() == "해당"){
						$("#build-second-1").hide();
						$("#build-second-2").show();
						$("#build-second-7").hide();
						$("#build-second-8").show();
						$("#build-second-5").text("가입 불가");
						$("#build-second-5").attr('style', 'color: red !important;');
						$("#build-second-26").hide();
					} else {
						$("#build-second-1").show();
						$("#build-second-2").hide();
						$("#build-second-7").show();
						$("#build-second-8").hide();
						$("#build-second-5").text($reportRealtySearch.fnPriceFinal(rtn.tilkoMap.currentTax));
						$("#build-second-6").text($reportRealtySearch.fnPriceFinal(rtn.tilkoMap.currentTaxRoseBonds));
					}
					
					if(rtn.tilkoMap.seniorBonds == "" || rtn.tilkoMap.seniorBonds == "0"){
						$("#build-second-4").text("없음");
					} else {
						$("#build-second-4").text($reportRealtySearch.fnPriceFinal(rtn.tilkoMap.seniorBonds));
					}
					
					let bondsHtm = "";
					bondsHtm += '<div class="no-value-box">';
					bondsHtm += '<img src="/assets/building/no_value.svg" alt="">';
					bondsHtm += '<div class="no-value-box__title"><strong class="no-value-box__title blue">' + $reportRealtySearch.fnPriceFinal(rtn.tilkoMap.currentTax) + '원 이하</strong>의 전세 계약';
					bondsHtm += '권유';
					bondsHtm += '</div>';
					bondsHtm += '<div class="no-value-box__inner-box">';
					bondsHtm += '단, 선순위 채권 소멸 특약을 설정한 경우에는<br />';
					bondsHtm += '<strong class="blue"> ' + $reportRealtySearch.fnPriceFinal(rtn.tilkoMap.currentTaxRoseBonds) + '원 이하</strong>의 전세 계약을 권유 드립니다.';
					bondsHtm += '</div>';
					bondsHtm += '</div>';
					
					$("#build-second-7").html(bondsHtm);
					$("#build-second-9").text(rtn.tilkoMap.owner);
					$("#build-second-10").text(rtn.tilkoMap.typeOwn);
					$("#build-second-12").text(rtn.tilkoMap.oracularResponses);
					if(rtn.tilkoMap.oracularResponses == "해당"){
						$("#build-second-12").attr('style', 'color: red !important;');
					}
					$("#build-second-13").text(rtn.tilkoMap.seizure);
					if($("#seizure").val() == "해당"){
						$("#build-second-13").attr('style', 'color: red !important;');
					}
					$("#build-second-14").text(rtn.tilkoMap.leasehold);
					if($("#leasehold").val() == "해당"){
						$("#build-second-14").attr('style', 'color: red !important;');
					}
					$("#build-second-23").text(rtn.tilkoMap.auctionGoYn);
					if($("#auctionGoYn").val() == "해당"){
						$("#build-second-23").attr('style', 'color: red !important;');
					}
					$("#build-second-15").text(rtn.tilkoMap.charteredKayule + "%");
					$("#build-second-16").text(rtn.tilkoMap.auctionBidRate + "%");
					$("#build-second-17").text(rtn.tilkoMap.etcLandCtn);
					$("#build-second-18").hide();
				} else {
					console.log("해당 정보를 가져올 수 없습니다.");
				}
			},
			error:function(request,status,rtn)
			{
		         console.log("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+rtn);
		    },
		    complete : function(xhr, data) {
			}
		});
	},
	
	/**
	 * 네이버 로드뷰 초기화
	 */
	fnInitNaverPano : function(x, y, viewName){
		pano = new naver.maps.Panorama(viewName, {
		position: new naver.maps.LatLng(x, y),
		logoControl : false,	//로고1
		mapDataControl : false,	//로고2
		pov: {
			pan: -135,
			tilt: 29,
			fov: 100
			}
		});
	},
	
	/**
	 * 가격 이쁘게 나누기 - 천만단위
	 */
	fnPriceFinal : function(price){
	    if(price == null || price == "undefined"){
	        return price;
	    } 
	    
	    if(price == 0){
			return 0;
		}
	
	    price = Math.round(price / 1000000) * 1000000;
	    price = price.toString().replace(/\B(?=(\d{4})+(?!\d))/g, ',');
	
	    var result = price.split(',');
	    var jo = "";
	    var ug = "";
	    var manwon = "";
	
	    if(result.length == 4){
	        jo = result[0];
	        ug = result[1];
	        manwon = result[2];
	    } else if(result.length == 3){
	        ug = result[0];
	        manwon = result[1];
	    } else if(result.length == 2){
	        manwon = result[0];
	    }
	
	    var htm = "";
	
	    if(jo != ""){
	        htm += jo + "조 ";
	    }
	
	    if(ug != ""){
	        htm += Number(ug) + "억 ";
	    }
	
	    if(manwon != "" && manwon != "0000"){
	        htm += Number(manwon) + "만";
	    }
	
	    return htm;
	},

	/**
     * 가격 이쁘게 나누기 - 십만단위
     */
     fnPriceSibMan : function(price) {
        if (price == null || price == "undefined") {
            return price;
        }

        if (price == 0) {
            return 0;
        }

        // 십만 원 단위로 반올림
        price = Math.round(price / 100000) * 100000;
        price = price.toString().replace(/\B(?=(\d{4})+(?!\d))/g, ',');

        var result = price.split(',');
        var jo = "";
        var ug = "";
        var manwon = "";

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

        var htm = "";

        if (jo != "") {
            htm += jo + "조 ";
        }

        if (ug != "") {
            htm += Number(ug) + "억 ";
        }

        if (manwon != "" && manwon != "0000") {
            htm += Number(manwon) + "만";
        }

        return htm;
     },

	
	/**
	 * 조,억,만 스트링을 넘버로 변환
	 */
	fnPriceToNumber: function(strPrice) {
	    if(!strPrice) return null;
	
	    var jo = 0, ug = 0, manwon = 0;
	    
	    // "조" 단위 처리
	    var joIndex = strPrice.indexOf("조");
	    if(joIndex !== -1) {
	        jo = parseInt(strPrice.substring(0, joIndex)) * 1000000000000; // 조는 1조 = 1,000,000,000,000
	        strPrice = strPrice.substring(joIndex + 1).trim();
	    }
	
	    // "억" 단위 처리
	    var ugIndex = strPrice.indexOf("억");
	    if(ugIndex !== -1) {
	        ug = parseInt(strPrice.substring(0, ugIndex)) * 100000000; // 억은 1억 = 100,000,000
	        strPrice = strPrice.substring(ugIndex + 1).trim();
	    }
	
	    // "만" 단위 처리
	    var manwonIndex = strPrice.indexOf("만");
	    if(manwonIndex !== -1) {
	        manwon = parseInt(strPrice.substring(0, manwonIndex)) * 10000; // 만은 1만 = 10,000
	    }
	
	    return jo + ug + manwon;
	},
	
	/**
	 * 더보기, 닫기 설정
	 */
	fnMore : function(thiz, type){
		let tagId = $(thiz).attr("tagId");
		
		if(type == 1){
			$("ul[name=" + tagId + "]").show();
			$("li[name=" + tagId + "]").show();
			$("div[name=" + tagId + "]").show();
			$(thiz).next().show();
			$(thiz).hide();
		} else {
			$("ul[name=" + tagId + "]").hide();
			$("li[name=" + tagId + "]").hide();
			$("div[name=" + tagId + "]").hide();
			$(thiz).prev().show();
			$(thiz).hide();
		}
	},
	
	/**
	 * 건물정보 변경 로직
	 */
	fnChangeBuildInfo : function(index){
		$("#land-body7-2").text($commonUtil.fnInsteadInt($reportRealtySearch.value.brTitleList[index].platAreaF, "-", "평"));
		$("#land-body7-3").text($reportRealtySearch.value.brTitleList[index].mainPurpsCdNm);
		$("#land-body7-4").text($commonUtil.fnInsteadString($reportRealtySearch.value.brTitleList[index].useAprDay, "-"));
		$("#land-body7-5").text($reportRealtySearch.value.brTitleList[index].strctCdNm);
		$("#land-body7-6").text($reportRealtySearch.value.brTitleList[index].roofCdNm);
		$("#land-body7-7").text($reportRealtySearch.value.brTitleList[index].totAreaF + " 평");
		$("#land-body7-8").text("지하" + $reportRealtySearch.value.brTitleList[index].ugrndFlrCnt + "층/지상" + $reportRealtySearch.value.brTitleList[index].grndFlrCnt + "층");
		$("#land-body7-9").text($commonUtil.fnInsteadInt($reportRealtySearch.value.brTitleList[index].vlRat, "-", "%"));
		$("#land-body7-10").text($commonUtil.fnInsteadInt($reportRealtySearch.value.brTitleList[index].vlRatEstmTotAreaF, "-", "평"));
		$("#land-body7-11").text($commonUtil.fnInsteadInt($reportRealtySearch.value.brTitleList[index].bcRat, "-", "%"));
		
		let elvt = '-';
		let utcnt = '-';
		if($reportRealtySearch.value.brTitleList[index].rideUseElvtCnt != 0 || $reportRealtySearch.value.brTitleList[index].emgenUseElvtCnt != 0){
			elvt = Number($reportRealtySearch.value.brTitleList[index].rideUseElvtCnt) + Number($reportRealtySearch.value.brTitleList[index].emgenUseElvtCnt);
			elvt += "대";
		}
		
		if($reportRealtySearch.value.brTitleList[index].indrMechUtcnt != 0 || $reportRealtySearch.value.brTitleList[index].oudrMechUtcnt != 0){
			let cnt = Number($reportRealtySearch.value.brTitleList[index].indrMechUtcnt) + Number($reportRealtySearch.value.brTitleList[index].oudrMechUtcnt);
			utcnt = "기계식 " + cnt + "대";	
		}
		
		if($reportRealtySearch.value.brTitleList[index].indrAutoUtcnt != 0 || $reportRealtySearch.value.brTitleList[index].oudrAutoUtcnt != 0){
			let cnt = Number($reportRealtySearch.value.brTitleList[index].indrAutoUtcnt) + Number($reportRealtySearch.value.brTitleList[index].oudrAutoUtcnt);
			if(utcnt == "-"){
				utcnt = "자주식 " + cnt + "대";	
			} else {
				utcnt += ", 자주식 " + cnt + "대";
			}
		}
		
		$("#land-body7-12").text(utcnt);
		$("#land-body7-13").text(elvt);
		
		//층정보 표기
		$("#land-body8-1").html('');
		
		let flrovrvwListHtm = '';
		flrovrvwListHtm += '<li class="general-table-item flex-between align-center center">';
		flrovrvwListHtm += '<div class="general-table-item__content">층수</div>';
		flrovrvwListHtm += '<div class="general-table-item__content">용도</div>';
		flrovrvwListHtm += '<div class="general-table-item__content">면적</div>';
		flrovrvwListHtm += '<div class="general-table-item__content">구조</div>';
		flrovrvwListHtm += '</li>';
		
		for(let i=0; i<$reportRealtySearch.value.brTitleList[index].brFlrovrvwList.length; i++){
			if(i < 3){
				flrovrvwListHtm += '<li class="general-table-item flex-between align-center center">';
			} else {
				$("#land-body8_more").show();
				flrovrvwListHtm += '<li class="general-table-item flex-between align-center center" name="land-body8_more" style="display:none">';
			}
			flrovrvwListHtm += '<div class="general-table-item__content">' + $reportRealtySearch.value.brTitleList[index].brFlrovrvwList[i].flrGbCdNm + $reportRealtySearch.value.brTitleList[index].brFlrovrvwList[i].flrNo + '층</div>';
			flrovrvwListHtm += '<div class="general-table-item__content">' + $reportRealtySearch.value.brTitleList[index].brFlrovrvwList[i].mainPurpsCdNm + '</div>';
			flrovrvwListHtm += '<div class="general-table-item__content">' + $reportRealtySearch.value.brTitleList[index].brFlrovrvwList[i].totArea + '㎡</div>';
			flrovrvwListHtm += '<div class="general-table-item__content">' + $reportRealtySearch.value.brTitleList[index].brFlrovrvwList[i].strctCdNm + '</div>';
			flrovrvwListHtm += '</li>';	
		}
		
		flrovrvwListHtm += '';
		
		$("#land-body8-1").html(flrovrvwListHtm);
		$("#land-body8_no-more").hide();
		$("#land-body8_no-more").prev().show();
	},
	
	/**
	 * 실거래 표시로직, 주소검색이라 동기로 가져옴
	 */
	fnRealtyList: async function (list) {
		const tempSubAddr = new Array();
	    for (const [index, data] of list.entries()) {
		    await $commonUtil.fnDelay(1).then(() => {
				let tempAddr = "";
			    tempAddr += data.platPlc + ' ' + Number(data.bun);
			    if (Number(data.ji) != 0) {
			        tempAddr += '-' + Number(data.ji);
			    }
	            $reportRealtySearch.value.geocoder.addressSearch(tempAddr, function (result2, status) {
	                // 정상적으로 검색이 완료됐으면
	                if (status === kakao.maps.services.Status.OK) {
	                    let coords2 = new kakao.maps.LatLng(result2[0].y, result2[0].x);

                        var distanceInMeters = $commonMap.fnHaversineDistanceInMeters($reportRealtySearch.value.latlng.Ma, $reportRealtySearch.value.latlng.La, coords2.getLat(), coords2.getLng());
                        var distanceText = '<a href="#" class="realtyDistanceLink" data-lat="' + coords2.getLat() + '" data-lng="' + coords2.getLng() + '" onclick="$reportRealtySearch.fnOnRealtyDetail(' + index + ')">' + distanceInMeters + 'm</a>';
                        $("#realtyDistance" + index).html(distanceText);

                        // 이벤트 리스너를 사용하여 클릭 이벤트 처리
                        $(document).on('click', '.realtyDistanceLink', function() {
                            // 클릭한 요소의 데이터 속성을 통해 좌표를 가져오기
                            var lat = $(this).data('lat');
                            var lng = $(this).data('lng');

                            // 좌표가 정의되어 있으면 지도 이동
                            if (lat && lng) {
                                var moveCoords2 = new kakao.maps.LatLng(lat, lng);
                                map.panTo(moveCoords2);
                            }
                            return false;
                        });

	                    // 주소중복이면 마크 생성x
	                    // 순서대로 안빠짐 (추후 수정 필수)
	                    let boolX = true;
	
	                    for (let j = 0; j < tempSubAddr.length; j++) {
	                        if (tempSubAddr[j] == tempAddr) {
	                            boolX = false;
	                        }
	                    }
	                }
	            });
	        });
	    }
	},

	/**
	 * 실거래 정보 세팅
	 */
	fnOnRealtyDetail : function(index){
		if($reportRealtySearch.value.realtyList[index] == null || $reportRealtySearch.value.realtyList[index] == "undefined"){
			return false;
		}
		
		$("#real_tag_body").html('');
		
		let tempAddr = "";
		let realTagBody = '';

	    tempAddr += $reportRealtySearch.value.realtyList[index].platPlc + ' ' + Number($reportRealtySearch.value.realtyList[index].bun);
	    if (Number($reportRealtySearch.value.realtyList[index].ji) != 0) {
	        tempAddr += '-' + Number($reportRealtySearch.value.realtyList[index].ji);
	    }

	    let tradePriceInMan = Number($reportRealtySearch.value.realtyList[index].tradePrice + "0000");
		let totArea = $reportRealtySearch.value.realtyList[index].totArea;

		realTagBody += tempAddr;
		realTagBody += '<div class="general-table">';
		realTagBody += '<ul class="general-table-list">';
		realTagBody += '<li class="general-table-item flex-between align-center">';
		realTagBody += '<div class="general-table-item__content">총액</div>';
		realTagBody += '<div class="general-table-item__content">';
		realTagBody += '<div>' + $reportRealtySearch.fnPriceFinal(tradePriceInMan) + '</div>';
		realTagBody += '</div>';
		realTagBody += '</li>';
		realTagBody += '<li class="general-table-item flex-between align-center">';
		realTagBody += '<div class="general-table-item__content">거래일</div>';
		realTagBody += '<div class="general-table-item__content">';
		realTagBody += '<div>' + $reportRealtySearch.value.realtyList[index].contractYm.slice(2, 4) + '.' + $reportRealtySearch.value.realtyList[index].contractYm.slice(4) + '.' + String($reportRealtySearch.value.realtyList[index].contractDate).padStart(2, '0') + '</div>';
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
		realTagBody += '<div>' + $reportRealtySearch.fnPriceFinal(Number(Math.round(tradePriceInMan / totArea / 10000) + "0000")) + '</div>';
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
		
		$("#real_tag_body").html(realTagBody);
		$("#real_tag").show();
	},

	/**
     * 로드뷰 위 리스트 중 클릭한 곳으로 이동
     */
     fnScrollIntoView : function(targetSection){
         var targetId = "";
         targetId = targetSection;

         var targetElement = document.getElementById(targetId);

         if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
         }
     },

};

$(function(){
    $reportRealtySearch.init();
});
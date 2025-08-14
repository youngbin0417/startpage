
var $commonMap = {

    /**
     * 초기화
     */
    init : function() {
		
    },

	value : {
		anonyFunc : "",
		addrInfo : {
			addr : "", // 공통주소
			latLng : null, // 위치값
			ma : "", // 공통위도
			la : "" // 공통경도
		},
		polygonMarker : [],
		mapLevel : 5
	},
	
	/**
	 * 레이아웃 초기화
	 */
	fnLayoutInit : function(){
		$(".favorable-wrap").removeClass("show");
		$(".favorable-wrap").removeClass("fold");
		$(".building-wrap").removeClass("show");
		$(".building-wrap").removeClass("fold");
		$(".land-wrap").removeClass("show");
		$(".land-wrap").removeClass("fold");
		
		$("div[name=more]").hide();
		$("div[name=no-more]").hide();
		
		$("#land-body2-1").hide();
		$("#land-body2-2").hide();
		$("#land-body3-1").hide();
		$("#land-body3-2").hide();
		$("#land-body5").hide();
		
		$("#land-body7-0").hide();
		$("#land-body7").hide();
		$("#land-body-sub-7").hide();

		$("#land-body8").hide();
		$("#land-body8-1").hide();
		
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

		$("#land-second").hide();
		$("#build-second").hide();
		
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
		$("#build-second-23").css('color', '');
		$("#build-second-24").text("전세 위험도 분석(권리분석)");
		$("#build-second-25").text("예상 추정가");
		$('#build-second-5').css('color', '');
		$("#build-second-26").show();
		$("#build-second-26").show();

		$("#land-second-1").show();
		$("#land-second-2").hide();
		$("#land-second-4").text("-");
		$("#land-second-5").text("-");
		$("#land-second-6").text("-");
		$("#land-second-7").hide();
		$("#land-second-8").hide();
		$("#land-second-9").text("-");
		$("#land-second-10").text("-");
		$("#land-second-11").text("미등록");
		$('#land-second-11').css('color', '');
		$("#land-second-12").text("-");
		$('#land-second-12').css('color', '');
		$("#land-second-13").text("-");
		$('#land-second-13').css('color', '');
		$("#land-second-14").text("-");
		$('#land-second-14').css('color', '');
		$("#land-second-18").show();

		$realtySearch.fnChangeKind('build', 1);
		$realtySearch.fnChangeKind('land', 1);
		
		//주변 정보
		$realtySearch.fnCloseInfo('build', 1);
		$realtySearch.fnCloseInfo('land', 1);
		
		$("#build-body5-1").hide();
		$("#build-body5-2").hide();
		$("#build-body5-3").hide();
		$("#build-body5-4").hide();
	},
	
	/**
	 * 두 좌표사이 m단위 계산
	 */
	fnHaversineDistanceInMeters : function(lat1, lon1, lat2, lon2) {
	    const earthRadius = 6371000; // 지구 반지름 (단위: 미터)
	
	    const dLat = (lat2 - lat1) * (Math.PI / 180); // 위도 차이를 라디안으로 변환
	    const dLon = (lon2 - lon1) * (Math.PI / 180); // 경도 차이를 라디안으로 변환
	
	    const a =
	        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
	        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
	        Math.sin(dLon / 2) * Math.sin(dLon / 2);
	
	    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	
	    const distanceInMeters = earthRadius * c; // 거리 계산 (단위: 미터)
	    return Math.round(distanceInMeters);
	},
	
    /**
    * 지도위에 모든 객체 제거
    */
    fnRemoveAllObj : function() {
		$rightTool.value.markers.forEach(element => {element.setMap(null)});
    	$rightTool.value.markers = [];
		$rightTool.value.placeOverlays.forEach(element => {element.setMap(null)});
		$rightTool.value.placeOverlays = [];
	},
	
	/**
    * 모든 이벤트 제거
    */
    fnRemoveAllListener : function() {
		kakao.maps.event.removeListener(map, 'click', $rightTool.distance.fnMClickEvent);
		kakao.maps.event.removeListener(map, 'mousemove', $rightTool.distance.fnMMoveEvent);                 
		kakao.maps.event.removeListener(map, 'rightclick', $rightTool.distance.fnMRightClickEvent);  
		
		kakao.maps.event.removeListener(map, 'click', $rightTool.square.fnMClickEvent);
		kakao.maps.event.removeListener(map, 'mousemove', $rightTool.square.fnMMoveEvent);     
		kakao.maps.event.removeListener(map, 'rightclick', $rightTool.square.fnMRightClickEvent);
		
		kakao.maps.event.removeListener(map, 'click', $realtySearch.fnMainClickEvtClick);
	},
};

$(function(){
    $commonMap.init();
});
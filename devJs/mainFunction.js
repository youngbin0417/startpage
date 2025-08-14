var $mainFunction = {
	/**
     * 초기화
     */
    init : function() {
  		$mainFunction.value.geocoder = new kakao.maps.services.Geocoder();
  		$realtySearch.fnSearchHistory();
    },
    
    value : {
		lat : "",
		lng : "",
		addr : "서울 서초구 서초동 1671-2",
		level : 3,
		geocoder : null
	},
    
    // 좌표로 법정동 상세 주소 정보를 요청합니다
    fnSearchDetailAddrFromCoords : function(coords, callback){
		$mainFunction.value.geocoder.coord2Address(coords.getLng(), coords.getLat(), callback);
	}
}

// 카카오맵 init
const mapContainer = document.querySelector('#kakao-map');
var options = {
    center: new kakao.maps.LatLng(37.491521, 127.014960),
    level: 3
};
var map = new kakao.maps.Map(mapContainer, options);
var ps = new kakao.maps.services.Places(); 

// 마우스 드래그로 지도 이동이 완료되었을 때 마지막 파라미터로 넘어온 함수를 호출하도록 이벤트를 등록합니다
kakao.maps.event.addListener(map, 'dragend', function() {        
    
    // 지도 중심좌표를 얻어옵니다 
    let latlng = map.getCenter(); 
    
    let message = '변경된 지도 중심좌표는 ' + latlng.getLat() + ' 이고, ';
    message += '경도는 ' + latlng.getLng() + ' 입니다';
    
    $mainFunction.value.lat = latlng.getLat();
    $mainFunction.value.lng = latlng.getLng();
    
    // 주소정보 가져오기
    $mainFunction.fnSearchDetailAddrFromCoords(latlng, function(result, status) {
        if (status === kakao.maps.services.Status.OK) {
            $mainFunction.value.addr = result[0].address.address_name;
        }   
    });
    
    //옮길때 이벤트
    if($mainFunction.value.level < $commonMap.value.mapLevel){
		if($rightTool.value.searchIdx != 0){
			$rightTool.ico.fnIcoOnLoad($rightTool.value.searchIdx);
		}
	}
});

// 지도가 확대 또는 축소되면 마지막 파라미터로 넘어온 함수를 호출하도록 이벤트를 등록합니다
kakao.maps.event.addListener(map, 'zoom_changed', function() {        
    
    // 지도의 현재 레벨을 얻어옵니다
    let level = map.getLevel();
    let message = '현재 지도 레벨은 ' + level + ' 입니다';
    
    $mainFunction.value.level = level;
    
    //아이콘 최대표시 레벨 : 4
    if(level >= $commonMap.value.mapLevel){
		$commonMap.fnRemoveAllObj();
	} else {
		if($rightTool.value.searchIdx != 0){
			$rightTool.ico.fnIcoOnLoad($rightTool.value.searchIdx);
		}
	}
});

function openConsultingModal(type) {
    const templateId = type + '-consulting-template';
    const modalId = type + 'ConsultingRequestModal';

    // 이미 모달이 DOM에 있는지 확인
    if ($('#' + modalId).length > 0) {
        $('#' + modalId).removeClass('hide');
        return;
    }

    const template = document.getElementById(templateId);
    if (!template) {
        console.error('Template not found:', templateId);
        return;
    }
    const clone = document.importNode(template.content, true);
    document.body.appendChild(clone);

    $('#' + modalId).removeClass('hide');
}

$(function(){
    $mainFunction.init();
});

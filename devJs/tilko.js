var $tilko = {
    /**
     * 초기화
     */
    init : function() {
		
    },
    
	value : {
		addrMap : null,
		buildMap : null,
		realMap : null,
		tilkoMap : null
	},
	
	 /**
	  * 반환받은 트랜젝션키로 등기부등본 PDF 다운로드 하기
	  */
	fnDownLandOwn : function(kind) {
	    let transactionKey = $realtySearch.value.transactionKey;
	    if(transactionKey != ""){
	        window.location.href = '/tilko/downloadForValuemon?transactionKey=' + transactionKey;
	        
			$eventBus.emit('loadingOn');
			setTimeout(() => {
				$eventBus.emit('loadingOff');
			}, 5000);
			
	        $("#" + kind + "-second-btn4").attr("onclick", "$toast.error('다운로드는 1회만 가능합니다')");
	    } else {
	        $toast.error("먼저 등기분석을 진행해주세요");
	    }
	},
	
	 /**
	  * 보고서 생성 후 카카오톡 전송
	  */
	fnDownLandReport : function() {
		let transactionKey = $realtySearch.value.transactionKey;
		if(transactionKey != "" && $tilko.value.addrMap != null && $tilko.value.buildMap != null && $tilko.value.realMap != null && $tilko.value.tilkoMap != null){
			let resultMap = {
			    addrMap: $tilko.value.addrMap,
			    buildMap: $tilko.value.buildMap,
			    realMap: $tilko.value.realMap,
			    tilkoMap: $tilko.value.tilkoMap,
			    useAprDay: $tilko.value.buildMap.build.useAprDay
			};
			
			$eventBus.emit('loadingOn');
			setTimeout(() => {
				$eventBus.emit('loadingOff');
			}, 3000);
			
			$.ajax({
			    type: "post",
			    dataType: "json",
			    data: JSON.stringify(resultMap),
			    contentType: "application/json",
			    cache: false,
			    url: "/tilko/downLandReport",
				headers: {
		            'Authorization': 'Bearer ' + localStorage.getItem("accessToken")
		        },
			    success: function(data) {
					if(data.result == 1){
						$toast.success("등록하신 휴대폰 정보로 결과가 공유되었습니다.");
					} else {
						$toast.error("등록 실패");
					}
			    },
			    error: function(xhr, status, error) {
			        console.log("code:" + request.status + "\n" + "error:" + error);
					if (request.status === 401) { // 인증되지 않음
				        $toast.error("로그인 정보를 가져올 수 없습니다");
				    }
			    }
			});
		} else {
			$toast.error("먼저 등기분석을 진행해주세요");
		}
	},
};

$(function(){
    $tilko.init();
});
var $inicis = {
	
    /**
     * 초기화
     */
    init : function() {
		
		//이니시스 취소, 성공 이벤트 관리 모듈
		window.addEventListener('message', function(event) {
		    if (event.data === 'closeIni') {
		        $toast.error("결제를 취소하였습니다.");
		        
		        $eventBus.emit('loadingOff');
		        $('#inicisModalDiv').hide();
		        $('.inipay_modal-backdrop').hide();
		    }
		}, false);
    },
    
};

$(function(){
    $inicis.init();
});
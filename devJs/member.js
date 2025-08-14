var $member = {
	/**
	 * 초기화
	 */
	init : function() {
		console.log("🔥 $member.init() called");
		const accessToken = localStorage.getItem("accessToken");

		if (accessToken) {
			$("#loginBtn").hide();
			$("#logoutBtn").show();
		} else {
			$("#loginBtn").show();
			$("#logoutBtn").hide();
		}

		var params = new URLSearchParams(window.location.search);
		if (params.get('login') === 'false') {
			$('#loginBtn').trigger('click');
		}

		$("#phoneLogin, #idFindPhone, #pwFindPhone").on("input", function() {
			var input = $(this).val().replace(/[^0-9]/g, ''); // 숫자만 추출
			var formatted = '';

			// 숫자를 포맷에 맞게 조정
			if (input.length > 3 && input.length <= 7) {
				formatted = `${input.slice(0, 3)}-${input.slice(3)}`;
			} else if (input.length > 7) {
				formatted = `${input.slice(0, 3)}-${input.slice(3, 7)}-${input.slice(7, 11)}`;
			} else {
				formatted = input;
			}

			$(this).val(formatted); // 포맷된 문자열로 값 업데이트
		});

		$('.checklist__item').click(function() {
			var checkbox = $(this).find('.checkbox');
			checkbox.toggleClass('active');

			// '전체 동의하기' 체크박스 클릭시 다른 체크박스 처리
			if (checkbox.attr('id') === 'joinChk1') {
				if (checkbox.hasClass('active')) {
					// '전체 동의하기'가 활성화되면 모든 체크박스 활성화
					$('.checklist__item .checkbox').addClass('active');
				} else {
					// '전체 동의하기'가 비활성화되면 모든 체크박스 비활성화
					$('.checklist__item .checkbox').removeClass('active');
				}
			}

			if (checkbox.attr('id') != 'joinChk1' && checkbox.attr('id') != 'joinChk2') {
				let dataValue = $(this).attr("data-value");

				$("#agreementModal").removeClass("hide");
				$("#agreementhead").text($agreement.fnHeaderText(dataValue));
				$("#agreementText").text($agreement.fnBodyText(dataValue));
			}
		});
	},

	value : {
		phoneAuthTimer : null,
		emailAuth : false,
		phoneAuth : false,
	},

	/**
	 * 로그인버튼 초기화
	 */
	fnInitLogin : function(){
		$("#emailLoginForm").addClass("hide");
	},

	/**
	 * 회원가입버튼 초기화
	 */
	fnInitJoin : function(){
		$("#phoneLogin").prop("disabled", false);
		$("#authNumLogin").prop("disabled", false);
		$("#emailLogin").prop("disabled", false);
		$("#phoneLogin").val();

		if ($member.value.phoneAuthTimer !== null) {
			clearInterval($member.value.phoneAuthTimer);
			$member.value.phoneAuthTimer = null;
		}

		$("#emailConf").hide();
		$("#passwordConf").hide();
		$("#passwordConf2").hide();
		$("#nameConf").hide();
		$("#phoneConf").hide();
		$("#authNumConf").hide();

		$member.value.emailAuth = false;
		$member.value.phoneAuth = false;
	},

	/**
	 * 회원가입 프로세스
	 */
	fnRegUser : function(){
		// 입력 필드 값 수집
		let email = $("#emailLogin").val();
		let password = $("#passwordLogin").val();
		let passwordConfirm = $("#passwordConfLogin").val();
		let name = $("#nameLogin").val();
		let phone = $("#phoneLogin").val();
		let authNum = $("#authNumLogin").val();

		//이메일 중복검사, 휴대폰 인증 검사부터진행
		if($member.value.phoneAuth === false){
			$toast.error("핸드폰 인증을 먼저 진행해주세요");
			return false;
		}

		if($member.value.emailAuth === false){
			$toast.error("이메일 중복검사를 진행해주세요");
			return false;
		}

		let requiredCheckboxes = ["#joinChk2", "#joinChk3", "#joinChk4", "#joinChk5"];
		for (var i = 0; i < requiredCheckboxes.length; i++) {
			if (!$(requiredCheckboxes[i]).hasClass("active")) {
				$toast.error("약관동의는 필수입니다");
				return false;
			}
		}

		$("#emailConf").hide();
		$("#passwordConf").hide();
		$("#passwordConf2").hide();
		$("#nameConf").hide();
		$("#phoneConf").hide();
		$("#authNumConf").hide();

		if(email == ""){
			$("#emailConf").children(":first").addClass("error").removeClass("check");
			$("#emailConf .text-wrap").text("이메일을 입력해주세요");
			$("#emailConf").show();
			return false;
		}

		if(password == ""){
			$("#passwordConf").children(":first").addClass("error").removeClass("check");
			$("#passwordConf .text-wrap").text("패스워드를 입력해주세요");
			$("#passwordConf").show();
			return false;
		}

		if(passwordConfirm == ""){
			$("#passwordConf2").children(":first").addClass("error").removeClass("check");
			$("#passwordConf2 .text-wrap").text("패스워드를 입력해주세요");
			$("#passwordConf2").show();
			return false;
		}

		if(name == ""){
			$("#nameConf").children(":first").addClass("error").removeClass("check");
			$("#nameConf .text-wrap").text("이름을 입력해주세요");
			$("#nameConf").show();
			return false;
		}

		//모든 유효성검사는 백단에서 진행할 예정
		$.ajax({
			type : "post",
			dataType : "json",
			data : {
				"email":email,
				"password":password,
				"passwordConfirm":passwordConfirm,
				"name":name,
				"phone":phone,
				"authNum":authNum,
			},
			cache : false,
			url : "/members/regUser",
			success: function(data) {
				if(data.result == 1){
					$toast.success("회원가입에 성공했습니다");
					window.location.href = "/";
				} else if(data.result == 2) {
					$("#authNumConf").children(":first").removeClass("check").addClass("error");
					$("#authNumConf .text-wrap").text("유효시간이 초과되었습니다. 인증번호를 다시 요청해주세요");
					$("#authNumConf").show();
				} else if(data.result == 3) {
					$("#authNumConf").children(":first").removeClass("check").addClass("error");
					$("#authNumConf .text-wrap").text("인증번호가 일치하지 않습니다");
					$("#authNumConf").show();
				} else if(data.result == 4) {
					$("#passwordConf").children(":first").removeClass("check").addClass("error");
					$("#passwordConf .text-wrap").text("패스워드는 영문, 숫자, 특수문자 포함 8자리 이상입니다");
					$("#passwordConf").show();
				} else if(data.result == 5) {
					$("#passwordConf2").children(":first").removeClass("check").addClass("error");
					$("#passwordConf2 .text-wrap").text("패스워드가 일치하지 않습니다");
					$("#passwordConf2").show();
				} else if(data.result == 6) {
					$("#emailConf").children(":first").addClass("error").removeClass("check");
					$("#emailConf .text-wrap").text("형식에 맞지않는 이메일입니다.");
					$("#emailConf").show();
				} else if(data.result == 7) {
					$("#phoneConf").children(":first").addClass("error").removeClass("check");
					$("#phoneConf .text-wrap").text("사전 인증된 핸드폰번호가 아닙니다");
					$("#phoneConf").show();
				} else if(data.result == 8) {
					$("#emailConf").children(":first").addClass("error").removeClass("check");
					$("#emailConf .text-wrap").text("사전 인증된 이메일주소가 아닙니다");
					$("#emailConf").show();
				} else {
					$toast.error("알수없는 오류가 발생했습니다.");
				}
			},
			error: function(xhr, status, error) {
				console.error('Error:', error);
			}
		});
	},

	/**
	 * 회원중복검사
	 */
	fnGetDuplicateId: function () {
		let memberId = document.getElementById("emailLogin").value;

		if (memberId === "") {
			$("#emailConf").children(":first").addClass("error").removeClass("check");
			$("#emailConf .text-wrap").text("이메일을 입력해주세요.");
			$("#emailConf").show();
			return false;
		}

		$.ajax({
			type: "POST",
			url: "/members/getDuplicateId",
			contentType: "application/json", // JSON 데이터 전송 명시
			dataType: "json", // 서버 응답 데이터 형식
			data: JSON.stringify({ email: memberId }), // JSON 직렬화
			cache: false,
			success: function (data) {
				if (data.result === 0) {
					$("#emailConf").children(":first").addClass("error").removeClass("check");
					$("#emailConf .text-wrap").text("형식에 맞지않는 이메일입니다.");
					$("#emailConf").show();
				} else {
					if (!data.isDuplicate) {
						$("#emailConf").children(":first").addClass("check").removeClass("error");
						$("#emailConf .text-wrap").text("사용가능한 이메일입니다");
						$("#emailConf").show();
						$("#emailLogin").prop("disabled", true);

						$member.value.emailAuth = true;
					} else {
						$("#emailConf").children(":first").addClass("error").removeClass("check");
						$("#emailConf .text-wrap").text("이메일이 존재합니다");
						$("#emailConf").show();
					}
				}
			},
			error: function (xhr, status, error) {
				console.error("Error:", xhr.responseText || error); // 자세한 에러 로그 출력
				$("#emailConf").children(":first").addClass("error").removeClass("check");
				$("#emailConf .text-wrap").text("서버 오류가 발생했습니다. 다시 시도해주세요.");
				$("#emailConf").show();
			},
		});
	},

	/**
	 * 로그인 프로세스
	 */
	fnLogin : function(){
		let memberId = document.getElementById("memberId").value;
		let password = document.getElementById("password").value;

		if(memberId == "" || password == ""){
			return false;
		}

		$.ajax({
			type: 'POST',
			url: '/members/login',
			contentType: 'application/json', // 컨텐츠 타입을 application/json으로 설정
			data: JSON.stringify({ // 데이터를 JSON 형식으로 변환
				memberId: memberId,
				password: password
			}),
			dataType: 'json', // 응답 데이터 타입을 json으로 설정
			success: function(data) {
				localStorage.setItem("grantType", data.grantType);
				localStorage.setItem("accessToken", data.accessToken);
				localStorage.setItem("refreshToken", data.refreshToken);
				window.location.href = "/";
			},
			error: function(xhr, status, error) {
				$toast.error("아이디나 비밀번호가 일치하지 않습니다.");
				console.error('Error:', error);
			}
		});
	},
	/**
	 * 로그아웃 프로세스
	 */
	fnLogout : function(){
		$.ajax({
			type: 'POST',
			url: '/members/logout',
			headers: { // 헤더에 현재 토큰을 실어보냅니다.
				'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
			},
			complete: function() {
				// 서버 응답과 관계없이 클라이언트에서는 항상 로그아웃 처리를 합니다.
				$toast.success("로그아웃 하였습니다");
				localStorage.removeItem('grantType');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
				window.location.reload();
			},
			error: function(xhr, status, error) {
				console.error('Error:', error);
			}
		});
	},

	/**
	 * 핸드폰 인증 프로세스
	 */
	fnSetSmsAuthNum : function(){
		$eventBus.emit('loadingOn');

		let phone = $("#phoneLogin").val();
		let phoneRegex = /^010-\d{4}-\d{4}$/;

		if (!phoneRegex.test(phone)) {
			$toast.error("휴대폰형식이 올바르지 않습니다.");
			$eventBus.emit('loadingOff');
			return;
		}

		$.ajax({
			type : "post",
			dataType : "json",
			contentType : "application/json",
			data : JSON.stringify({
				"phone": phone
			}),
			cache : false,
			url : "/members/setSmsAuthNum",
			success: function(data) {
				if(data.result == 1){
					$("#phoneLogin").prop("disabled", true);
					$("#phoneConf").children(":first").removeClass("error").removeClass("check");
					// 타이머 시작
					var countdown = 300; // 5분 = 300초
					$member.value.phoneAuthTimer = setInterval(function() {
						let minutes = Math.floor(countdown / 60);
						let seconds = countdown % 60;
						$("#phoneConf .text-wrap").text(`인증번호를 발송했습니다. (입력시간: ${minutes}:${seconds.toString().padStart(2, '0')})`);

						countdown--;
						if (countdown < 0) {
							clearInterval($member.value.phoneAuthTimer);
							$("#phoneLogin .text-wrap").text("인증시간이 만료되었습니다.");
						}
					}, 1000);
					$("#phoneConf").show();
				} else if(data.result == 2) {
					$("#phoneConf").children(":first").addClass("error").removeClass("check");
					$("#phoneConf .text-wrap").text("이미 등록된 핸드폰입니다.");
					$("#phoneConf").show();
				} else if(data.result == 0) {
					$toast.error("인증번호 발송실패");
				}
			},
			error: function(xhr, status, error) {
				console.error('Error:', error);
			},
			complete : function(xhr, data) {
				$eventBus.emit('loadingOff');
			}
		});
	},

	/**
	 * 핸드폰 인증 확인 프로세스
	 */
	fnSetSmsConfAuthNum: function() {
		// 현재 시간으로 인증시간(authTime)을 생성
		const now = new Date();
		const authTime = new Date(now.getTime() + (9 * 60 * 60 * 1000)).toISOString();

		// 입력값 가져오기
		let phone = $("#phoneLogin").val();
		let authNum = $("#authNumLogin").val(); // 인증번호 입력 필드

		if (!phone || !authNum) {
			$toast.error("전화번호와 인증번호를 모두 입력해주세요.");
			return;
		}

		$.ajax({
			type: "post",
			dataType: "json",
			contentType: "application/json",
			data: JSON.stringify({
				"phone": phone,        // 전화번호
				"authNum": authNum,    // 인증번호
				"authTime": authTime   // 인증시간
			}),
			cache: false,
			url: "/members/setSmsConfAuthNum",
			success: function(data) {
				if (data.result == 1) {
					// 인증 성공 처리
					$("#authNumLogin").prop("disabled", true);
					$("#authNumConf").children(":first").removeClass("error").addClass("check");
					$("#authNumConf .text-wrap").text("인증번호가 일치합니다.");

					if ($member.value.phoneAuthTimer !== null) {
						clearInterval($member.value.phoneAuthTimer);
						$member.value.phoneAuthTimer = null;
					}
					$("#phoneConf").hide();
					$("#authNumConf").show();

					$member.value.phoneAuth = true;
				} else {
					// 인증 실패 처리
					$("#authNumConf").children(":first").removeClass("check").addClass("error");
					$("#authNumConf .text-wrap").text(data.msg);
					$("#authNumConf").show();
				}
			},
			error: function(xhr, status, error) {
				console.error('Error:', error);
				$toast.error("서버 요청 중 오류가 발생했습니다.");
			}
		});
	},

	// 비밀번호 유효성 검사 함수
	fnValidatePassword : function(password) {
		let regex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
		return regex.test(password);
	},

	/**
	 * 아이디 찾기 프로세스
	 */
	fnIdFindConf : function(){
		// 입력 필드 값 수집
		var name = $("#idFindName").val();
		var phone = $("#idFindPhone").val();
		var authNum = $("#idFindAuthNum").val();

		if(name == ""){
			$toast.error("이름을 입력해주세요");
			return false;
		}

		if(phone == ""){
			$toast.error("핸드폰번호를 입력해주세요");
			return false;
		}

		if(authNum == ""){
			$toast.error("인증번호를 입력해주세요");
			return false;
		}

		//모든 유효성검사는 백단에서 진행할 예정
		$.ajax({
			type : "post",
			dataType : "json",
			data : {
				"name":name,
				"phone":phone,
				"authNum":authNum,
			},
			cache : false,
			url : "/members/idFindProc",
			success: function(data) {
				if(data.result == 1){
					alert("회원님의 아이디는 " + data.userId + " 입니다");
				} else if(data.result == 0) {
					$toast.error("알수없는 오류가 발생했습니다.");
				} else {
					$("#idFindAuthNumConf").children(":first").addClass("error").removeClass("check");
					$("#idFindAuthNumConf .text-wrap").text(data.msg);
					$("#idFindAuthNumConf").show();
				}
			},
			error: function(xhr, status, error) {
				console.error('Error:', error);
			}
		});
	},

	/**
	 * 패스워드 찾기 프로세스
	 */
	fnPwFindConf : function(){
		// 입력 필드 값 수집
		var name = $("#pwFindName").val();
		var email = $("#pwFindId").val();
		var phone = $("#pwFindPhone").val();
		var authNum = $("#pwFindAuthNum").val();

		if(email == ""){
			$toast.error("아이디를 입력해주세요");
			return false;
		}

		if(name == ""){
			$toast.error("이름을 입력해주세요");
			return false;
		}

		if(phone == ""){
			$toast.error("핸드폰번호를 입력해주세요");
			return false;
		}

		if(authNum == ""){
			$toast.error("인증번호를 입력해주세요");
			return false;
		}

		//모든 유효성검사는 백단에서 진행할 예정
		$.ajax({
			type : "post",
			dataType : "json",
			data : {
				"email":email,
				"name":name,
				"phone":phone,
				"authNum":authNum,
			},
			cache : false,
			url : "/members/pwFindProc",
			success: function(data) {
				if(data.result == 1){
					alert("임시 패스워드는 " + data.setPw + " 입니다");
				} else if(data.result == 0) {
					$toast.error("알수없는 오류가 발생했습니다.");
				} else {
					$("#pwFindAuthNumConf").children(":first").addClass("error").removeClass("check");
					$("#pwFindAuthNumConf .text-wrap").text(data.msg);
					$("#pwFindAuthNumConf").show();
				}
			},
			error: function(xhr, status, error) {
				console.error('Error:', error);
			}
		});
	},

	/**
	 * 유효시간 없는 핸드폰 인증 프로세스
	 */
	fnSetSimpleSmsAuthNum : function(type){
		$eventBus.emit('loadingOn');

		let phone = "";
		let phoneRegex = /^010-\d{4}-\d{4}$/;

		if(type == "id"){
			phone = $("#idFindPhone").val();
		} else if(type == "pw"){
			phone = $("#pwFindPhone").val();
		}

		if (!phoneRegex.test(phone)) {
			$toast.error("휴대폰형식이 올바르지 않습니다.");
			$eventBus.emit('loadingOff');
			return;
		}

		$.ajax({
			type : "post",
			dataType : "json",
			data : {
				"phone":phone
			},
			cache : false,
			url : "/members/setSimpleSmsAuthNum",
			success: function(data) {
				if(data.result == 1){
					if(type == "id"){
						$("#idFindPhone").prop("disabled", true);
						$("#idFindphoneConf .text-wrap").text(`인증번호를 발송했습니다`);
						$("#idFindphoneConf").children(":first").removeClass("error").removeClass("check");
						$("#idFindphoneConf").show();
					} else if(type == "pw"){
						$("#pwFindPhone").prop("disabled", true);
						$("#pwFindphoneConf .text-wrap").text(`인증번호를 발송했습니다`);
						$("#pwFindphoneConf").children(":first").removeClass("error").removeClass("check");
						$("#pwFindphoneConf").show();
					}
				} else if(data.result == 0) {
					$toast.error("인증번호 발송실패");
				}
			},
			error: function(xhr, status, error) {
				console.error('Error:', error);
			},
			complete : function(xhr, data) {
				$eventBus.emit('loadingOff');
			}
		});
	},

	/**
	 * 아이디찾기버튼 초기화
	 */
	fnInitIdFind : function(){
		$("#idFindphoneConf").hide();
		$("#idFindAuthNumConf").hide();
		$("#idFindPhone").prop("disabled", false);
	},

	/**
	 * 패스워드찾기버튼 초기화
	 */
	fnInitPwFind : function(){
		$("#pwFindphoneConf").hide();
		$("#pwFindAuthNumConf").hide();
		$("#pwFindPhone").prop("disabled", false);
	},
};
//
// $(function(){
// 	$member.init();
// });
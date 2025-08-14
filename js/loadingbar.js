const messages = ["부동산 유형을 파악하고 있습니다.", "주변 정보를 가져오고 있습니다.",
    "개별적 요인 분석 중 입니다.", "추정가를 산출하고 있습니다."];
let currentIndex = 0;

// 문장 출력 함수
function showNextMessage() {
    const textOutput = document.getElementById("text-output");
    textOutput.textContent = messages[currentIndex]; // 현재 문장 출력

    // 다음 문장으로 이동 (순환)
    currentIndex = (currentIndex + 1) % messages.length;
}

setInterval(showNextMessage, 5000);

// 초기 문장 출력
showNextMessage();
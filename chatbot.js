// 챗봇 버튼 클릭 이벤트
document.addEventListener('DOMContentLoaded', function() {
    const chatbotButton = document.getElementById('chatbotButton');
    
    if (chatbotButton) {
        chatbotButton.addEventListener('click', function() {
            // Tawk.to 챗봇 열기
            // Tawk.to가 로드된 후 사용 가능
            if (typeof Tawk_API !== 'undefined' && Tawk_API) {
                Tawk_API.maximize();
            } else {
                // Tawk.to가 아직 로드되지 않았거나 스크립트가 없는 경우
                console.log('Tawk.to 스크립트를 먼저 추가해주세요.');
                alert('챗봇을 준비 중입니다. 잠시 후 다시 시도해주세요.');
            }
        });
    }
});

